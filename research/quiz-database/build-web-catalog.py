#!/usr/bin/env python3
"""Publish an intentionally restricted, deterministic view of the author catalog."""
import argparse
import hashlib
import json
import sqlite3
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
DATABASE = HERE / 'generated' / 'quiz-packages.sqlite3'
OUTPUT = ROOT / 'data' / 'question-catalog.json'


def load():
    db = sqlite3.connect(f'file:{DATABASE}?mode=ro', uri=True)
    db.row_factory = sqlite3.Row
    with db:
        # Never silently publish a catalog assembled from stale authored inputs.
        sources = {}
        for source in db.execute('SELECT path, sha256 FROM source_files ORDER BY path'):
            path = (ROOT / source['path']).resolve()
            if not path.is_relative_to(ROOT) or not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != source['sha256']:
                raise ValueError('Catalog source is missing or stale; rebuild the catalog: ' + source['path'])
            sources[source['path']] = source['sha256']
        # The full catalog text deliberately embeds choices and follow-ups for
        # reading. The playable route needs the original structured briefing,
        # reason labels, and personal-preference question without duplicating
        # those choices. Read only the already fingerprinted author sources.
        scenes = {}
        expansion_prefix = 'research/quiz-database/expansion/'
        for path in sources:
            if not path.startswith(expansion_prefix) or not path.endswith('.json') or path.endswith('/sources.json'):
                continue
            document = json.loads((ROOT / path).read_text(encoding='utf-8'))
            for scene in document.get('scenarios', []):
                if scene['id'] in scenes:
                    raise ValueError('Duplicate authored scenario: ' + scene['id'])
                scenes[scene['id']] = scene
        expected_scenes = {f'CR-S{i:02}' for i in range(7, 19)}
        if set(scenes) != expected_scenes:
            raise ValueError('Expanded route requires exactly CR-S07 through CR-S18')
        integrity = db.execute('PRAGMA integrity_check').fetchone()[0]
        if integrity != 'ok' or db.execute('PRAGMA foreign_key_check').fetchone():
            raise ValueError('Catalog database failed integrity checks')
        metadata = dict(db.execute('SELECT key,value FROM metadata'))
        items = []
        item_sql = '''SELECT id,kind,bank,title,status,claim_type,cluster_id,category,
                      role_id,locality,rationale,interpretation_limits FROM items ORDER BY id'''
        for row in db.execute(item_sql).fetchall():
            item = dict(row)
            iid = item['id']
            item['texts'] = {r['language']: {'text': r['text'], 'format': r['format']}
                             for r in db.execute('SELECT language,text,format FROM item_texts WHERE item_id=? ORDER BY language', (iid,))}
            if 'en' not in item['texts']:
                raise ValueError('Missing English text: ' + iid)
            item['options'] = []
            for option in db.execute('SELECT option_id FROM options WHERE item_id=? ORDER BY display_order', (iid,)).fetchall():
                oid = option['option_id']
                texts = {r['language']: {'label': r['label'], 'description': r['description'], 'tradeoff': r['tradeoff']}
                         for r in db.execute('SELECT language,label,description,tradeoff FROM option_texts WHERE item_id=? AND option_id=? ORDER BY language', (iid, oid))}
                item['options'].append({'id': oid, 'texts': texts})
            if iid in scenes:
                scene = scenes[iid]
                if item['kind'] != 'scenario' or item['bank'] != 'candidate':
                    raise ValueError('Expanded scene is not a candidate scenario: ' + iid)
                item['briefings'] = scene['briefing']
                item['reasons'] = scene['reasons']
                item['personalPreferencePrompt'] = scene['personal_preference_prompt']
                for language in ('en', 'vi'):
                    if (not isinstance(item['briefings'].get(language), str)
                        or not item['briefings'][language].strip()
                        or not isinstance(item['personalPreferencePrompt'].get(language), str)
                        or not item['personalPreferencePrompt'][language].strip()
                        or not isinstance(item['reasons'].get(language), list)
                        or not item['reasons'][language]
                        or any(not isinstance(reason, str) or not reason.strip() for reason in item['reasons'][language])):
                        raise ValueError('Expanded scene has incomplete bilingual fields: ' + iid)
                if len(item['reasons']['en']) != len(item['reasons']['vi']):
                    raise ValueError('Expanded scene has unequal bilingual reason counts: ' + iid)
            item['outcomes'] = [dict(r) for r in db.execute('''SELECT o.id,o.title,o.claim_kind,o.intended_interpretation,
                         o.evidence_required,o.unsupported_inferences,o.status,io.relationship FROM outcomes o
                         JOIN item_outcomes io ON io.outcome_id=o.id WHERE io.item_id=? ORDER BY o.id''', (iid,))]
            item['readings'] = [dict(r) for r in db.execute('''SELECT DISTINCT r.id,r.bibliographic_proposal,r.verification,
                         e.url,e.source_kind,e.retrieval_status,
                         CASE WHEN EXISTS (SELECT 1 FROM item_readings ir WHERE ir.item_id=? AND ir.reading_id=r.id)
                              THEN 'item' ELSE 'cluster' END AS scope FROM readings r
                         LEFT JOIN reading_evidence e ON e.reading_id=r.id WHERE r.id IN
                         (SELECT reading_id FROM item_readings WHERE item_id=? UNION
                          SELECT cr.reading_id FROM cluster_readings cr WHERE cr.cluster_id=?) ORDER BY r.id''', (iid,iid,item['cluster_id']))]
            items.append(item)
        ids = {item['id'] for item in items}
        if not expected_scenes <= ids:
            raise ValueError('Expanded scenario missing from the author catalog')
        packages = []
        for row in db.execute('''SELECT p.id,p.title,p.status,p.purpose,p.language_note,p.inference_limit,
                           s.planned_primary_tasks FROM package_summary s JOIN packages p ON s.id=p.id ORDER BY p.id''').fetchall():
            package = dict(row)
            package['items'] = [r[0] for r in db.execute('''SELECT item_id FROM package_items WHERE package_id=?
                               ORDER BY presentation_order IS NULL,presentation_order,item_id''', (package['id'],))]
            if not set(package['items']) <= ids:
                raise ValueError('Package references an unavailable question: ' + package['id'])
            packages.append(package)
        clusters = [dict(row) for row in db.execute('SELECT id,title FROM clusters ORDER BY id')]
        result = {'schemaVersion': 1, 'catalogVersion': metadata['catalog_version'],
                  'provenance': {'database': {'path': str(DATABASE.relative_to(ROOT)),
                                             'sha256': hashlib.sha256(DATABASE.read_bytes()).hexdigest()},
                                 'sources': sources},
                  'counts': {'items': len(items), 'packages': len(packages),
                             'outcomes': db.execute('SELECT count(*) FROM outcomes').fetchone()[0]},
                  'packages': packages, 'items': items, 'clusters': clusters}
        serialized = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
        # Explicitly refuse to copy any end-of-assessment country correspondence.
        for reveal in db.execute('SELECT inspiration FROM world_reveals'):
            if reveal['inspiration'] in serialized:
                raise ValueError('Country-reveal text found in web catalog')
        return serialized


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Check committed JSON against the catalog without writing')
    args = parser.parse_args()
    content = load()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding='utf-8') != content:
            raise SystemExit('Web catalog is stale. Run python3 research/quiz-database/build-web-catalog.py')
        print('Web catalog matches current authored sources and database.')
    else:
        OUTPUT.parent.mkdir(exist_ok=True)
        OUTPUT.write_text(content, encoding='utf-8')
        print(f'Wrote {OUTPUT} ({len(content.encode("utf-8"))} bytes)')

if __name__ == '__main__':
    main()
