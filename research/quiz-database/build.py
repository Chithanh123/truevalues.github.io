#!/usr/bin/env python3
"""Build a researcher-only SQLite catalog from the authored repository content."""

import argparse
import csv
import hashlib
import importlib.util
import json
import re
import sqlite3
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
DOCS = 'docs/content-research/'
OWNER = 'Political Context quiz catalog schema 2\n'
PREVIOUS_OWNER = 'Political Context quiz catalog schema 1\n'
CATALOG_DATE = '2026-10-27'
_expansion_spec = importlib.util.spec_from_file_location('quiz_catalog_expansion', HERE / 'expansion.py')
expansion = importlib.util.module_from_spec(_expansion_spec)
_expansion_spec.loader.exec_module(expansion)


def read(relative):
    return (ROOT / relative).read_text(encoding='utf-8')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def insert(db, table, **row):
    # Table/column identifiers come only from this module or its fixed seed keys.
    cols = ','.join('"' + col + '"' for col in row)
    db.execute(f'INSERT INTO "{table}" ({cols}) VALUES ({",".join("?" for _ in row)})', tuple(row.values()))


def field(text, name):
    match = re.search(r'^\*\*' + re.escape(name) + r':\*\* (.+)$', text, re.M)
    if not match:
        raise ValueError(f'Missing authored field: {name}')
    return match.group(1).strip()


def load_current():
    # Import the same authored modules used by the prototype; no scraping of UI text.
    script = """
import {instrument} from './js/content.js';
import {makeSteps} from './js/engine.js';
import {viItems} from './js/translations/vi-items.js';
import {viFoundations} from './js/translations/vi-foundations.js';
import {viWorlds} from './js/translations/vi-worlds.js';
import {foundationEvidence} from './js/foundation-evidence.js';
console.log(JSON.stringify({instrument,steps:makeSteps(instrument),viItems,viFoundations,viWorlds,foundationEvidence}));
"""
    result = subprocess.run(['node', '--input-type=module', '-e', script], cwd=ROOT,
                            text=True, capture_output=True, check=True)
    return json.loads(result.stdout)


def scenario_markdown(scene):
    parts = [f'# {scene["title"]}', scene['setting'], scene['briefing'],
             scene['authority']]
    parts.extend(f'**{fact["label"]}:** {fact["text"]}' for fact in scene['facts'])
    parts.append(scene['prompt'])
    for option in scene['options']:
        parts.append(f'**{option["label"]}**\n\n{option["description"]}\n\n{option["tradeoff"]}')
    return '\n\n'.join(parts)


def add_text(db, item_id, language, text, fmt='plain', current=False):
    insert(db, 'item_texts', item_id=item_id, language=language, text=text, format=fmt,
           review_status='author_draft', usage='current_participant' if current else 'review_only')


def add_current(db, data):
    instrument = data['instrument']
    vi = data['viItems']
    for role in instrument['roles']:
        insert(db, 'roles', id=role['id'], label_en=role['label'], label_vi=vi['roles'][role['id']]['label'])
    for domain in instrument['dimensions']:
        insert(db, 'domains', id=domain['id'], title=domain['label'], left_label=domain['left'],
               right_label=domain['right'], interpretation_limit=domain['description'])
    for kind, collection, source, translations in [
        ('value_statement', instrument['statements'], 'js/content.js', vi['statements']),
        ('foundation_statement', instrument['foundations']['items'], 'js/foundations.js', data['viFoundations']['items']),
    ]:
        for item in collection:
            scored = kind == 'value_statement'
            insert(db, 'items', id=item['id'], bank='current', kind=kind, title=item['text'],
                   content_version=instrument['version'], status='implemented_unvalidated',
                   claim_type='normative' if scored else item['category'], category=item.get('category'),
                   domain_id=item.get('dimension'), scoring_mode='directional_statement' if scored else 'descriptive',
                   direction=item.get('direction'), rationale=item.get('rationale', 'Current authored value statement; see item outcomes and audit.'),
                   interpretation_limits='No validated ideology identification. ' + item.get('rationale', 'The current domain grouping combines concepts requiring separate review.'),
                   source_path=source, source_section=item['id'])
            add_text(db, item['id'], 'en', item['text'], current=True)
            add_text(db, item['id'], 'vi', translations[item['id']]['text'])
    for scene in instrument['scenarios']:
        comparison = bool(scene.get('comparisonOf'))
        descriptive = scene.get('scoring') == 'descriptive'
        mode = 'comparison_excluded' if comparison else 'descriptive' if descriptive else 'provisional_scenario'
        insert(db, 'items', id=scene['id'], bank='current', kind='scenario', title=scene['title'],
               content_version=instrument['version'], status='implemented_unvalidated', claim_type='role_action',
               domain_id=scene.get('dimension'), role_id=scene['role'], locality=scene['locality'],
               scoring_mode=mode, rationale=scene['prompt'],
               interpretation_limits='A role choice does not identify ideology or establish a causal role effect. See audit and outcome limits.',
               source_path='js/content.js', source_section=scene['id'])
        translated = vi['scenarios'][scene['id']]
        add_text(db, scene['id'], 'en', scenario_markdown(scene), 'markdown', current=True)
        add_text(db, scene['id'], 'vi', scenario_markdown(translated), 'markdown')
        for order, option in enumerate(scene['options'], 1):
            insert(db, 'options', item_id=scene['id'], option_id=option['id'], display_order=order,
                   current_authored_score=option.get('score'))
            vi_option = next(x for x in translated['options'] if x['id'] == option['id'])
            for language, value in [('en', option), ('vi', vi_option)]:
                insert(db, 'option_texts', item_id=scene['id'], option_id=option['id'], language=language,
                       label=value['label'], description=value['description'], tradeoff=value['tradeoff'])
        for language, value in [('en', scene), ('vi', translated)]:
            insert(db, 'reason_notes', item_id=scene['id'], language=language,
                   notes='\n'.join(f'{r["id"]}: {r["label"]}' for r in value['reasons']))
        if comparison:
            insert(db, 'variants', id='HOUSING-URGENCY-COMPARISON', base_item_id=scene['comparisonOf'],
                   comparison_item_id=scene['id'], status='implemented_comparison',
                   description=scene['changedCondition'],
                   invariants='World, role, powers, housing need, ownership, financing, option wording, scores, reasons and institutional notes remain fixed.',
                   interpretation_limit='Fixed order and recognition prevent a causal urgency estimate; the repeated scenario is excluded from aggregates.',
                   translation_status='author_draft', source_path='docs/RESEARCH.md')
    for world in instrument['worlds']:
        insert(db, 'worlds', id=world['id'], name=world['name'])
        translated = data['viWorlds']['worlds'][world['id']]
        for language, value in [('en', world), ('vi', translated)]:
            insert(db, 'world_texts', world_id=world['id'], language=language, name=value['name'],
                   summary=value['summary'], institutions_json=json.dumps(value['institutions'], ensure_ascii=False))
            insert(db, 'world_reveals', world_id=world['id'], language=language,
                   inspiration=value['inspiration'], participant_visibility='after_completion')
        for scene in instrument['scenarios']:
            insert(db, 'scenario_contexts', item_id=scene['id'], world_id=world['id'],
                   status='authored_unreviewed', note_en=world['scenarioNotes'][scene['id']],
                   note_vi=translated['scenarioNotes'][scene['id']],
                   review_requirement='Authored fictional authorization; independent institutional and bilingual review remains pending.')


def add_candidates(db):
    text = read(DOCS + 'CANDIDATE-BANK.md')
    clusters = list(re.finditer(r'^## (CR-\d{2}) — ([^\n]+)\n(.*?)(?=^## |\Z)', text, re.M | re.S))
    if len(clusters) != 12:
        raise ValueError('Expected twelve complete candidate clusters')
    for cluster in clusters:
        cid, title, body = cluster.groups()
        risks = field(body, 'Main risks')
        insert(db, 'clusters', id=cid, title=title, research_question=field(body, 'Question'),
               contrast_and_probe=field(body, 'Contrast and probe'), risks=risks,
               source_path=DOCS + 'CANDIDATE-BANK.md')
        matches = list(re.finditer(r'^### (CR-\d{2}[ABC]) · ([^\n]+)\n(.*?)(?=^### |\Z)', body, re.M | re.S))
        if [m[1] for m in matches] != [cid + suffix for suffix in 'ABC']:
            raise ValueError(f'Incomplete or unordered candidate cluster {cid}')
        for match in matches:
            item_id, claim, content = match.groups()
            distinction = field(content, 'Distinction')
            insert(db, 'items', id=item_id, bank='candidate', kind='foundation_statement',
                   title=f'{title}: {item_id}', content_version='content-draft-2026-10-25',
                   status='author_draft', claim_type=claim, cluster_id=cid, scoring_mode='descriptive',
                   rationale=distinction, interpretation_limits=risks,
                   source_path=DOCS + 'CANDIDATE-BANK.md', source_section=item_id)
            for language in ['en', 'vi']:
                add_text(db, item_id, language, field(content, language.upper()))


def add_draft_scenarios(db, seed):
    source_path = DOCS + 'SCENARIO-LAB.md'
    if seed['source_sha256'] != digest(ROOT / source_path):
        raise ValueError('Scenario Markdown changed: review and refresh draft-scenarios.json before rebuilding')
    scenes = seed['scenarios']
    if [s['id'] for s in scenes] != [f'CR-S{i:02}' for i in range(1, 7)]:
        raise ValueError('Expected exactly six ordered draft scenarios')
    for scene in scenes:
        insert(db, 'items', id=scene['id'], bank='candidate', kind='scenario', title=scene['title'],
               content_version='content-draft-2026-10-25', status=scene['status'], claim_type='role_action',
               role_id=scene['role_id'], locality=scene['locality'],
               scoring_mode='probe_only' if scene['status'] == 'probe_only' else 'descriptive',
               rationale=scene['reason_notes'], interpretation_limits=scene['interpretation_limits'],
               source_path=scene['source_path'], source_section=scene['source_section'])
        for version in scene['versions']:
            add_text(db, scene['id'], version['language'], version['participant_markdown'], 'markdown')
        if [o['id'] for o in scene['options']] != list('ABC'):
            raise ValueError(f'Invalid option order in {scene["id"]}')
        for order, option in enumerate(scene['options'], 1):
            insert(db, 'options', item_id=scene['id'], option_id=option['id'], display_order=order)
            for language in ['en', 'vi']:
                if option[language + '_label'] is not None:
                    insert(db, 'option_texts', item_id=scene['id'], option_id=option['id'], language=language,
                           label=option[language + '_label'], description=option[language + '_description'],
                           tradeoff=option[language + '_tradeoff'])
        insert(db, 'reason_notes', item_id=scene['id'], language='en', notes=scene['reason_notes'])
        insert(db, 'variants', base_item_id=scene['id'], status='editorial_proposal',
               source_path=source_path, **scene['variant'])
    # These are review tasks, deliberately not invented, ready-to-use world wrappers.
    context_text = read(source_path)
    for world in db.execute('SELECT id,name FROM worlds').fetchall():
        row = next((line for line in context_text.splitlines() if line.startswith('| ' + world[1] + ' |')), None)
        if row is None:
            raise ValueError(f'Missing world review requirement for {world[0]}')
        requirement = row.strip('|').split('|')[-1].strip()
        for scene in scenes:
            insert(db, 'scenario_contexts', item_id=scene['id'], world_id=world[0],
                   status='needs_authorization_review', review_requirement=requirement)


def add_research_records(db, data):
    source = DOCS + 'SOURCE-DOSSIER.md'
    for line in read(source).splitlines():
        if re.match(r'^\| [TM]\d{2} \|', line):
            rid, proposal, question = [cell.strip() for cell in line.strip('|').split('|')]
            insert(db, 'readings', id=rid, bibliographic_proposal=proposal, review_question=question,
                   verification='unverified', source_path=source)
        elif re.match(r'^\| CR-\d{2}:', line):
            cells = line.strip('|').split('|')
            cid = re.search(r'CR-\d{2}', cells[0])[0]
            for rid in re.findall(r'T\d{2}', cells[1]):
                insert(db, 'cluster_readings', cluster_id=cid, reading_id=rid, relationship='proposed_reading')
    evidence = data['foundationEvidence']
    for proposed in evidence['sources']:
        insert(db, 'readings', id='LEGACY:' + proposed['id'],
               bibliographic_proposal=proposed['title'] + ' — ' + proposed['url'],
               review_question=proposed['note'], verification='unverified', source_path='js/foundation-evidence.js')
    for item in evidence['items']:
        for link in item['links']:
            insert(db, 'item_readings', item_id=item['itemId'], reading_id='LEGACY:' + link['sourceId'],
                   relationship=link['relation'], note=link['note'])
    current = {r[0]: r[1] for r in db.execute("SELECT id,kind FROM items WHERE bank='current'")}
    for line in read(DOCS + 'CURRENT-CONTENT-AUDIT.md').splitlines():
        match = re.match(r'^\| `([^`]+)`', line)
        if match and match[1] in current:
            cells = [cell.strip() for cell in line.strip('|').split('|')]
            if len(cells) != 3:
                raise ValueError(f'Unrecognized audit table row {match[1]}')
            insert(db, 'audit_findings', item_id=match[1],
                   issue=cells[2] if current[match[1]] == 'scenario' else cells[1],
                   proposed_disposition=cells[2], source_path=DOCS + 'CURRENT-CONTENT-AUDIT.md')


def add_packages(db, data):
    common = 'No validated ideology labels, causal effects, population comparisons, or equivalent-form claims.'
    insert(db, 'packages', id='PILOT-0.4.0', title='Original 49-item Political Context instrument', version='0.4.0',
           kind='current_quiz', status='implemented_unvalidated',
           purpose='Document the original 49-item section: general values, foundations, role decisions and a descriptive housing comparison. The main assessment also includes 60 additional unscored draft questions.',
           audience='Prototype readers; intended first comprehension pilot: bilingual English–Vietnamese adults.',
           target_statements=40, target_scenarios=9, order_status='fixed_current_route',
           language_note='English participant route; all Vietnamese text is author-review material, not an implemented Vietnamese route.',
           inference_limit=common, source_path='docs/RESEARCH.md')
    position = 0
    for step in data['steps']:
        if 'itemId' in step:
            position += 1
            insert(db, 'package_items', package_id='PILOT-0.4.0', item_id=step['itemId'],
                   presentation_order=position, usage='primary_task')
    packets = {
        'A': ([2, 3, 5, 6], [1, 3], 'Power, freedom, enterprise authority and political knowledge'),
        'B': ([1, 4, 11, 12], [2, 5], 'Agency, care, ecology and grounds of authority'),
        'C': ([7, 8, 9, 10], [4, 6], 'Continuity, membership, religion and historical repair'),
    }
    for name, (clusters, scenes, title) in packets.items():
        pid = 'REVIEW-' + name
        insert(db, 'packages', id=pid, title='Content interview ' + name + ': ' + title,
               version='draft-2026-10-25', kind='content_interview', status='author_draft',
               purpose='Investigate comprehension and competing interpretations; select and revise content before assessment use.',
               audience='Bilingual English–Vietnamese adults after source, language and pilot-readiness review.',
               target_statements=12, target_scenarios=2, order_status='allocation_only',
               language_note='All twelve statements have Vietnamese drafts; some allocated scenarios lack Vietnamese text. No reconciled translations.',
               inference_limit=common + ' Fourteen primary tasks exclude briefing, probes, reasons and debrief. CR-S03 is only a comprehension probe.',
               source_path=DOCS + 'REVIEW-PROTOCOL.md')
        ids = [f'CR-{i:02}{letter}' for i in clusters for letter in 'ABC'] + [f'CR-S{i:02}' for i in scenes]
        for item_id in ids:
            insert(db, 'package_items', package_id=pid, item_id=item_id,
                   usage='comprehension_probe' if item_id == 'CR-S03' else 'primary_task')
    insert(db, 'packages', id='FUTURE-24', title='Future 24-task content budget', version='proposal-2026-10-25',
           kind='design_budget', status='unassigned_blueprint',
           purpose='Explore eighteen statements plus six scenarios drawn from both current and new material; select anchors after review.',
           audience='To be specified in a future research protocol.', target_statements=18, target_scenarios=6,
           order_status='not_selected', language_note='Items, translations and form allocation have not been selected.',
           inference_limit=common + ' This is only a burden budget, not a defined test or a fixed set of outcomes.',
           source_path=DOCS + 'REVIEW-PROTOCOL.md')


def validate(db):
    def require(condition, message):
        if not condition:
            raise ValueError(message)
    require(db.execute('PRAGMA integrity_check').fetchone()[0] == 'ok', 'SQLite integrity failure')
    require(not db.execute('PRAGMA foreign_key_check').fetchall(), 'Broken relational link')
    counts = dict(db.execute('SELECT bank,count(*) FROM items GROUP BY bank'))
    require(counts == {'current': 49, 'candidate': 102}, 'Unexpected content coverage')
    require(db.execute('SELECT count(*) FROM audit_findings').fetchone()[0] == 49, 'Incomplete existing-item audit')
    require(db.execute("SELECT count(*) FROM item_texts WHERE language='vi'").fetchone()[0] == 147, 'Unexpected Vietnamese draft coverage')
    require(not db.execute("SELECT i.id FROM items i LEFT JOIN item_outcomes io ON io.item_id=i.id AND io.relationship IN ('primary','probe') WHERE io.item_id IS NULL").fetchall(), 'An item lacks an intended outcome')
    require(not db.execute("SELECT 1 FROM item_outcomes io JOIN outcomes o ON o.id=io.outcome_id WHERE io.item_id='CR-S03' AND (io.relationship!='probe' OR o.claim_kind!='comprehension')").fetchall(), 'Probe incorrectly assigned an ideological outcome')
    require(not db.execute("SELECT 1 FROM options o JOIN items i ON i.id=o.item_id WHERE i.bank='candidate' AND o.current_authored_score IS NOT NULL").fetchall(), 'Candidate must not carry an authored score')
    require(not db.execute("SELECT 1 FROM items WHERE id IN ('public-records','housing-planned') AND scoring_mode NOT IN ('descriptive','comparison_excluded')").fetchall(), 'Descriptive or comparison exclusion lost')
    require(not db.execute("SELECT 1 FROM package_items WHERE package_id='FUTURE-24'").fetchall(), 'Future budget must remain unassigned')
    require(not db.execute("SELECT 1 FROM package_outcomes WHERE package_id='FUTURE-24'").fetchall(), 'Future budget must not imply selected outcomes')
    for row in db.execute('SELECT id,assigned_items,planned_primary_tasks FROM package_summary'):
        require(row[1] == (0 if row[0] == 'FUTURE-24' else row[2]), 'Incorrect package membership: ' + row[0])
    require(not db.execute("SELECT 1 FROM package_items pi JOIN packages p ON p.id=pi.package_id WHERE p.order_status!='fixed_current_route' AND pi.presentation_order IS NOT NULL").fetchall(), 'Draft allocation must not invent presentation order')
    require(not db.execute("SELECT 1 FROM package_outcome_matrix WHERE applicable_items=0").fetchall(), 'An assigned package outcome has no applicable content')
    require(db.execute("SELECT count(*) FROM scenario_contexts WHERE status='needs_authorization_review' AND note_en IS NULL AND note_vi IS NULL").fetchone()[0] == 144, 'Draft world wrappers must remain unapproved and unwritten')
    require(db.execute('SELECT count(*) FROM statement_review').fetchone()[0] == 48, 'Expansion statement review metadata missing')
    require(db.execute('SELECT count(*) FROM scenario_preference_prompts').fetchone()[0] == 24, 'Expansion preference drafts missing')
    require(not db.execute("SELECT r.id FROM readings r WHERE (r.verification='passage_inspected') != EXISTS (SELECT 1 FROM reading_passages p WHERE p.reading_id=r.id)").fetchall(), 'Inspection status disagrees with passage evidence')


def csv_value(value):
    if value is None:
        return ''
    if isinstance(value, str) and (value.lstrip().startswith(('=', '+', '-', '@')) or value.startswith(('\t', '\r', '\n'))):
        return "'" + value
    return value


def export(db, directory):
    folder = directory / 'csv'
    folder.mkdir()
    names = [r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name")]
    for name in names:
        cursor = db.execute(f'SELECT * FROM "{name}"')
        with (folder / (name + '.csv')).open('w', encoding='utf-8-sig', newline='') as handle:
            writer = csv.writer(handle)
            writer.writerow(col[0] for col in cursor.description)
            writer.writerows([csv_value(value) for value in row] for row in cursor)
    cursor = db.execute('SELECT * FROM package_summary ORDER BY id')
    summary = [dict(zip([c[0] for c in cursor.description], row)) for row in cursor]
    (directory / 'package-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    overview = [
        '# Quiz packages and intended outcomes',
        '',
        'Read this page directly in a web or mobile browser. No SQLite application is needed to read the overview.',
        '',
        f'**Catalog:** {db.execute("SELECT count(*) FROM packages").fetchone()[0]} package records, '
        f'{db.execute("SELECT count(*) FROM items").fetchone()[0]} authored items, and '
        f'{db.execute("SELECT count(*) FROM outcomes").fetchone()[0]} intended outcomes. '
        'Outcomes describe questions the assessment is intended to explore; they are provisional interpretations, not desired political answers or validated diagnoses.',
        '',
        '[Full catalog guide](../README.md) · [Expansion candidates](expansion-candidates.md) · [Source evidence](source-evidence.md) · '
        '[Package CSV](csv/package_summary.csv) · [Outcome CSV](csv/package_outcome_matrix.csv)',
        '',
        '| Package | Assigned / planned tasks | Current status |',
        '| --- | --- | --- |',
    ]
    for row in summary:
        status = {'implemented_unvalidated': 'Implemented prototype; unvalidated',
                  'author_draft': 'Draft content-interview packet',
                  'unassigned_blueprint': 'Design budget; content not selected'}[row['status']]
        overview.append(f'| {row["id"]} | {row["assigned_items"]} / {row["planned_primary_tasks"]} | {status} |')
    overview += ['', 'REVIEW-A/B/C each allocate twelve statements and two scenarios; REVIEW-D/E/F/G/H each allocate eight statements and two scenarios; '
                 'REVIEW-I/J each allocate four statements and one scenario. The original 49-item instrument is the first section of the 109-item assessment; '
                 'the 60 questions from REVIEW-D–J are included as descriptive, unscored drafts. '
                 'Reasons, interviews, briefing and debrief add burden beyond these counts. '
                 'CR-S03 is held as a comprehension probe pending redesign. '
                 'The participant application remains English; all Vietnamese text is an author draft.', '']
    for row in summary:
        overview += [f'## {row["id"]}', '', row['title'], '',
                     f'**Content:** {row["assigned_statements"]} statements and {row["assigned_scenarios"]} scenarios currently assigned. '
                     f'Vietnamese drafts exist for {row["vietnamese_drafts"]} of {row["assigned_items"]} assigned items.', '',
                     row['language_note'], '']
        if not row['assigned_items']:
            overview += ['The target is eighteen statements plus six scenarios. No questions or intended outcomes have been selected for this package.', '']
            continue
        ids = [item[0] for item in db.execute(
            'SELECT item_id FROM package_items WHERE package_id=? ORDER BY presentation_order IS NULL,presentation_order,item_id', (row['id'],))]
        overview += ['<details>', '<summary>Show item IDs</summary>', '',
                     ', '.join('`' + item + '`' for item in ids), '', '</details>', '']
        outcomes = db.execute('SELECT outcome_id,outcome,intended_interpretation,evidence_required,unsupported_inferences '
                              'FROM package_outcome_matrix WHERE package_id=? ORDER BY outcome_id', (row['id'],)).fetchall()
        for oid, title, interpretation, evidence, limits in outcomes:
            overview += [f'### {title}', '', interpretation, '', '<details>',
                         '<summary>Evidence required and interpretation limits</summary>', '',
                         f'**Evidence required:** {evidence}', '', f'**Limits:** {limits}', '',
                         f'Catalog outcome: `{oid}`.', '', '</details>', '']
    overview += ['## Review gaps', '',
                 '- REVIEW-A lacks a Vietnamese draft for CR-S03; REVIEW-B lacks one for CR-S05; REVIEW-C lacks them for CR-S04 and CR-S06.',
                 '- Independent content review, translation reconciliation and participant comprehension findings remain outstanding.',
                 '- Legacy bibliographic proposals remain unverified. The expansion source ledger distinguishes inspected passages from unverified proposals; '
                 'neither status establishes source endorsement of a question or measurement validity.',
                 '- The author database contains country-inspiration spoilers. The participant flow retains the end-only reveal.',
                 '- The database contains authored material only, with no participant answers or personal records.', '']
    (directory / 'package-overview.md').write_text('\n'.join(overview), encoding='utf-8')


def build(output=None):
    output = Path(output or HERE / 'generated').absolute()
    if output.is_symlink():
        raise ValueError('Refusing a symlink output directory')
    output = output.resolve()
    if output == ROOT or output in ROOT.parents:
        raise ValueError('Output cannot replace the repository or an ancestor')
    if output.exists() and (not output.is_dir() or not (output / 'CATALOG-OWNER').is_file()
                            or (output / 'CATALOG-OWNER').read_text() not in (OWNER, PREVIOUS_OWNER)):
        raise ValueError('Refusing to overwrite an output not owned by this catalog builder')
    data = load_current()
    outcomes = json.loads((HERE / 'outcomes.json').read_text())
    scenarios = json.loads((HERE / 'draft-scenarios.json').read_text())
    expansion_packets, expansion_sources = expansion.load(ROOT)
    paths = {
        'js/content.js', 'js/foundations.js', 'js/worlds.js', 'js/engine.js', 'js/foundation-evidence.js',
        'js/translations/vi-items.js', 'js/translations/vi-foundations.js', 'js/translations/vi-worlds.js',
        'docs/RESEARCH.md', 'docs/FOUNDATIONS.md',
        *(DOCS + name for name in ['CANDIDATE-BANK.md', 'SCENARIO-LAB.md', 'SOURCE-DOSSIER.md',
                                  'CURRENT-CONTENT-AUDIT.md', 'REVIEW-PROTOCOL.md']),
        *(str((HERE / name).relative_to(ROOT)) for name in ['schema.sql', 'build.py', 'outcomes.json', 'draft-scenarios.json']),
    }
    paths.update(o['source_path'] for o in outcomes['outcomes'])
    paths.update(expansion.PATHS)
    manifest = {}
    for path in sorted(paths):
        resolved = (ROOT / path).resolve()
        if not resolved.is_relative_to(ROOT) or not resolved.is_file():
            raise ValueError('Invalid source path: ' + path)
        manifest[path] = digest(resolved)
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.quiz-catalog-', dir=output.parent) as temporary:
        staging = Path(temporary) / 'catalog'
        staging.mkdir()
        with sqlite3.connect(staging / 'quiz-packages.sqlite3') as db:
            db.executescript((HERE / 'schema.sql').read_text())
            for path, sha in manifest.items():
                insert(db, 'source_files', path=path, sha256=sha)
            commit = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()
            for key, value in {
                'catalog_version': '1.1.0', 'content_snapshot_date': CATALOG_DATE, 'base_commit': commit,
                'instrument_version': data['instrument']['version'], 'scope': 'author_content_only_no_participant_answers',
                'validation_status': 'unvalidated_author_drafts', 'country_reveal_policy': 'after_completion',
                'source_verification': 'Legacy readings remain unverified. Expansion readings distinguish selected inspected passages from unverified proposals; no item validation is implied.',
                'working_tree_note': 'Hashes identify the actual inputs, including uncommitted content drafts; base_commit alone does not identify this snapshot.',
            }.items():
                insert(db, 'metadata', key=key, value=value)
            add_current(db, data)
            add_candidates(db)
            add_draft_scenarios(db, scenarios)
            add_research_records(db, data)
            add_packages(db, data)
            for table in ['outcomes', 'item_outcomes', 'package_outcomes']:
                for row in outcomes[table]:
                    insert(db, table, **row)
            expansion.add(db, expansion_packets, expansion_sources, insert, add_text)
            validate(db)
            db.commit()
            export(db, staging)
            expansion.export(staging, expansion_packets, expansion_sources)
        (staging / 'CATALOG-OWNER').write_text(OWNER)
        (staging / 'source-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
        # All outputs are generated, and ownership was checked before staging.
        backup = Path(temporary) / 'previous'
        if output.exists():
            output.rename(backup)
        try:
            staging.rename(output)
        except BaseException:
            if backup.exists():
                backup.rename(output)
            raise
    return output / 'quiz-packages.sqlite3'


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, help='New or builder-owned output directory (default: generated/)')
    args = parser.parse_args()
    database = build(args.output)
    print(f'Created {database}')
    with sqlite3.connect(database) as connection:
        for pid, assigned, planned, vi_count in connection.execute('SELECT id,assigned_items,planned_primary_tasks,vietnamese_drafts FROM package_summary ORDER BY id'):
            print(f'{pid}: {assigned}/{planned} assigned tasks; {vi_count} Vietnamese drafts')
