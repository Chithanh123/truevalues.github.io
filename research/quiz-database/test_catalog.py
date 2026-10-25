#!/usr/bin/env python3
"""Check the catalog's authored content, relationships, exclusions, and exports."""

import csv
import hashlib
import importlib.util
import json
import re
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('quiz_catalog_builder', HERE / 'build.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class CatalogChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory(prefix='quiz-catalog-check-')
        cls.addClassCleanup(cls.temporary.cleanup)
        cls.output = Path(cls.temporary.name) / 'generated'
        cls.database = builder.build(cls.output)
        cls.authored = builder.load_current()

    def setUp(self):
        self.db = sqlite3.connect(self.database)
        self.db.execute('PRAGMA foreign_keys=ON')
        self.addCleanup(self.db.close)

    def rows(self, query, args=()):
        return self.db.execute(query, args).fetchall()

    def scalar(self, query, args=()):
        return self.db.execute(query, args).fetchone()[0]

    def test_integrity_and_foreign_keys_reject_dangling_relationship(self):
        self.assertEqual(self.scalar('PRAGMA integrity_check'), 'ok')
        self.assertEqual(self.rows('PRAGMA foreign_key_check'), [])
        self.assertEqual(self.scalar('PRAGMA user_version'), 1)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO package_items(package_id,item_id,usage) VALUES ('REVIEW-A','not-an-item','primary_task')")
        self.db.rollback()
        self.assertEqual(dict(self.rows('SELECT bank,count(*) FROM items GROUP BY bank')),
                         {'current': 49, 'candidate': 42})

    def test_current_statements_preserve_both_languages_and_direction(self):
        instrument = self.authored['instrument']
        sources = [
            (instrument['statements'], self.authored['viItems']['statements'], 'directional_statement'),
            (instrument['foundations']['items'], self.authored['viFoundations']['items'], 'descriptive'),
        ]
        for collection, translations, scoring in sources:
            for item in collection:
                with self.subTest(item=item['id']):
                    self.assertEqual(self.rows('SELECT language,text,usage FROM item_texts WHERE item_id=? ORDER BY language', (item['id'],)),
                                     [('en', item['text'], 'current_participant'),
                                      ('vi', translations[item['id']]['text'], 'review_only')])
                    self.assertEqual(self.rows('SELECT scoring_mode,direction FROM items WHERE id=?', (item['id'],)),
                                     [(scoring, item.get('direction'))])

    def test_current_scenarios_retain_source_facts_and_literal_options(self):
        for scene in self.authored['instrument']['scenarios']:
            translated = self.authored['viItems']['scenarios'][scene['id']]
            for language, source in [('en', scene), ('vi', translated)]:
                text = self.scalar('SELECT text FROM item_texts WHERE item_id=? AND language=?', (scene['id'], language))
                for key in ['title', 'setting', 'briefing', 'authority', 'prompt']:
                    self.assertIn(source[key], text)
                for fact in source['facts']:
                    self.assertIn(fact['text'], text)
                for option in source['options']:
                    with self.subTest(scene=scene['id'], language=language, option=option['id']):
                        self.assertEqual(self.rows('SELECT label,description,tradeoff FROM option_texts WHERE item_id=? AND option_id=? AND language=?',
                                                   (scene['id'], option['id'], language)),
                                         [(option['label'], option['description'], option['tradeoff'])])
            self.assertEqual(self.rows('SELECT option_id,current_authored_score FROM options WHERE item_id=? ORDER BY display_order', (scene['id'],)),
                             [(o['id'], o.get('score')) for o in scene['options']])

    def test_candidate_stems_match_markdown_and_translation_gaps_are_absent(self):
        markdown = (builder.ROOT / 'docs/content-research/CANDIDATE-BANK.md').read_text()
        blocks = re.findall(r'^### (CR-\d{2}[ABC])[^\n]*\n(.*?)(?=^### |^## |\Z)', markdown, re.M | re.S)
        self.assertEqual(len(blocks), 36)
        for item_id, body in blocks:
            for language in ['en', 'vi']:
                stem = re.search(r'^\*\*' + language.upper() + r':\*\* (.+)$', body, re.M)[1]
                self.assertEqual(self.scalar('SELECT text FROM item_texts WHERE item_id=? AND language=?', (item_id, language)), stem)
        missing = self.rows("SELECT item_id FROM review_queue WHERE vietnamese_status='not_drafted' ORDER BY item_id")
        self.assertEqual(missing, [(f'CR-S{i:02}',) for i in range(3, 7)])
        self.assertEqual(self.scalar("SELECT count(*) FROM item_texts WHERE language='vi'"), 87)
        self.assertEqual(self.scalar("SELECT count(*) FROM item_texts WHERE language='vi' AND usage!='review_only'"), 0)
        drafts = json.loads((HERE / 'draft-scenarios.json').read_text())['scenarios']
        for scene in drafts:
            for version in scene['versions']:
                self.assertEqual(self.scalar('SELECT text FROM item_texts WHERE item_id=? AND language=?',
                                             (scene['id'], version['language'])), version['participant_markdown'])
            for option in scene['options']:
                for language in ['en', 'vi']:
                    expected = [] if option[language + '_label'] is None else [(
                        option[language + '_label'], option[language + '_description'], option[language + '_tradeoff'])]
                    self.assertEqual(self.rows('SELECT label,description,tradeoff FROM option_texts WHERE item_id=? AND option_id=? AND language=?',
                                               (scene['id'], option['id'], language)), expected)

    def test_package_membership_order_language_coverage_and_future_budget(self):
        expected_route = [s['itemId'] for s in self.authored['steps'] if 'itemId' in s]
        actual_route = [r[0] for r in self.rows("SELECT item_id FROM package_items WHERE package_id='PILOT-0.4.0' ORDER BY presentation_order")]
        self.assertEqual(actual_route, expected_route)
        packets = {'A': ([2, 3, 5, 6], [1, 3]), 'B': ([1, 4, 11, 12], [2, 5]), 'C': ([7, 8, 9, 10], [4, 6])}
        all_draft_ids = []
        for suffix, (clusters, scenes) in packets.items():
            expected = {f'CR-{i:02}{letter}' for i in clusters for letter in 'ABC'} | {f'CR-S{i:02}' for i in scenes}
            rows = self.rows('SELECT item_id,presentation_order FROM package_items WHERE package_id=?', ('REVIEW-' + suffix,))
            self.assertEqual({r[0] for r in rows}, expected)
            self.assertTrue(all(r[1] is None for r in rows))
            all_draft_ids.extend(r[0] for r in rows)
        self.assertEqual(len(all_draft_ids), len(set(all_draft_ids)))
        self.assertEqual(self.rows('SELECT id,assigned_items,planned_primary_tasks,vietnamese_drafts,probe_tasks FROM package_summary ORDER BY id'),
                         [('FUTURE-24', 0, 24, 0, 0), ('PILOT-0.4.0', 49, 49, 49, 0),
                          ('REVIEW-A', 14, 14, 13, 1), ('REVIEW-B', 14, 14, 13, 0), ('REVIEW-C', 14, 14, 12, 0)])
        self.assertEqual(self.scalar("SELECT count(*) FROM package_outcomes WHERE package_id='FUTURE-24'"), 0)

    def test_outcome_links_preserve_probe_only_and_whole_package_meanings(self):
        self.assertEqual(self.scalar('SELECT count(*) FROM outcomes'), 31)
        self.assertEqual(self.rows("SELECT i.id FROM items i WHERE NOT EXISTS (SELECT 1 FROM item_outcomes io WHERE io.item_id=i.id AND io.relationship IN ('primary','probe'))"), [])
        self.assertEqual(self.rows("SELECT io.relationship,o.claim_kind FROM item_outcomes io JOIN outcomes o ON o.id=io.outcome_id WHERE io.item_id='CR-S03'"),
                         [('probe', 'comprehension')])
        self.assertEqual(self.rows("SELECT coverage_scope,linked_items,applicable_items FROM package_outcome_matrix WHERE outcome_id='REVIEW-COMPREHENSION' ORDER BY package_id"),
                         [('whole_package', 0, 49), ('whole_package', 0, 14), ('whole_package', 0, 14), ('whole_package', 0, 14)])
        self.assertEqual(self.scalar("SELECT count(*) FROM outcomes WHERE trim(intended_interpretation)='' OR trim(evidence_required)='' OR trim(unsupported_inferences)=''"), 0)

    def test_scoring_exclusions_are_not_reintroduced_by_catalog_links(self):
        self.assertEqual(self.rows("SELECT id,scoring_mode FROM items WHERE id IN ('public-records','housing-planned') ORDER BY id"),
                         [('housing-planned', 'comparison_excluded'), ('public-records', 'descriptive')])
        self.assertEqual(self.scalar("SELECT count(*) FROM options WHERE item_id='public-records' AND current_authored_score IS NOT NULL"), 0)
        self.assertEqual(self.rows("SELECT current_authored_score FROM options WHERE item_id='housing-planned' ORDER BY current_authored_score"), [(-2,), (0,), (2,)])
        self.assertEqual(self.scalar("SELECT count(*) FROM items WHERE scoring_mode='provisional_scenario'"), 7)
        self.assertEqual(self.scalar("SELECT count(*) FROM options o JOIN items i ON i.id=o.item_id WHERE i.bank='candidate' AND o.current_authored_score IS NOT NULL"), 0)
        self.assertEqual(self.scalar("SELECT count(*) FROM items WHERE bank='candidate' AND scoring_mode NOT IN ('descriptive','probe_only')"), 0)

    def test_contexts_and_country_correspondences_remain_separate(self):
        self.assertEqual(dict(self.rows('SELECT status,count(*) FROM scenario_contexts GROUP BY status')),
                         {'authored_unreviewed': 72, 'needs_authorization_review': 48})
        self.assertEqual(self.scalar("SELECT count(*) FROM scenario_contexts WHERE status='needs_authorization_review' AND (note_en IS NOT NULL OR note_vi IS NOT NULL)"), 0)
        self.assertEqual(self.rows('SELECT DISTINCT participant_visibility FROM world_reveals'), [('after_completion',)])
        self.assertEqual(self.scalar('SELECT count(*) FROM world_reveals'), 16)
        participant_text = '\n'.join(r[0] for r in self.rows('SELECT text FROM item_texts'))
        english_text = '\n'.join(r[0] for r in self.rows("SELECT text FROM item_texts WHERE language='en'"))
        self.assertIsNone(re.search(r'\b(?:United States|United Kingdom|Germany|Japan|Fiji|Viet Nam|Vietnam|India|Central African Republic)\b', english_text))
        for world in self.authored['instrument']['worlds']:
            self.assertEqual(self.scalar("SELECT inspiration FROM world_reveals WHERE world_id=? AND language='en'", (world['id'],)), world['inspiration'])
            self.assertNotIn(world['inspiration'], participant_text)
            for scene in self.authored['instrument']['scenarios']:
                self.assertEqual(self.scalar('SELECT note_en FROM scenario_contexts WHERE item_id=? AND world_id=?', (scene['id'], world['id'])), world['scenarioNotes'][scene['id']])
        self.assertFalse(any('inspiration' in r[1] for r in self.rows('PRAGMA table_info(world_texts)')))

    def test_sources_and_variants_preserve_unverified_and_unwritten_statuses(self):
        self.assertEqual(self.rows('SELECT verification,count(*) FROM readings GROUP BY verification'), [('unverified', 48)])
        self.assertEqual(dict(self.rows('SELECT status,count(*) FROM variants GROUP BY status')),
                         {'editorial_proposal': 6, 'implemented_comparison': 1})
        self.assertEqual(self.scalar("SELECT count(*) FROM variants WHERE status='editorial_proposal' AND (comparison_item_id IS NOT NULL OR translation_status!='not_drafted')"), 0)
        manifest = json.loads((self.output / 'source-manifest.json').read_text())
        self.assertEqual(dict(self.rows('SELECT path,sha256 FROM source_files')), manifest)
        for relative, fingerprint in manifest.items():
            self.assertEqual(hashlib.sha256((builder.ROOT / relative).read_bytes()).hexdigest(), fingerprint)
        self.assertEqual(self.scalar('SELECT count(*) FROM audit_findings'), 49)

    def test_csvs_preserve_vietnamese_and_guard_formula_like_cells(self):
        file = self.output / 'csv/item_texts.csv'
        self.assertTrue(file.read_bytes().startswith(b'\xef\xbb\xbf'))
        with file.open(encoding='utf-8-sig', newline='') as handle:
            rows = list(csv.DictReader(handle))
        vi = next(r for r in rows if r['item_id'] == 'CR-03C' and r['language'] == 'vi')
        self.assertEqual(vi['text'], self.scalar("SELECT text FROM item_texts WHERE item_id='CR-03C' AND language='vi'"))
        for value in ['=1+1', ' +SUM(A1:A2)', '-2+3', '@SUM(A1)', '\tplain text', '\ntext']:
            self.assertEqual(builder.csv_value(value), "'" + value)
        self.assertEqual(builder.csv_value(-2), -2)
        self.assertEqual(builder.csv_value('Tự do, "quyền lực"\nchăm sóc'), 'Tự do, "quyền lực"\nchăm sóc')
        self.assertEqual(builder.csv_value(None), '')

    def test_all_eight_documented_queries_run_without_modifying_data(self):
        sql = (HERE / 'queries.sql').read_text()
        uncommented = re.sub(r'^\s*--.*$', '', sql, flags=re.M)
        statements = [s.strip() for s in uncommented.split(';') if s.strip()]
        self.assertEqual(len(statements), 8)
        self.db.execute('PRAGMA query_only=ON')
        expected_counts = [5, 7, 14, 4, 1, 1, 16, 5]
        for query, count in zip(statements, expected_counts):
            self.assertTrue(query.upper().startswith('SELECT'))
            self.assertEqual(len(self.rows(query)), count)

    def test_unowned_output_and_stale_scenario_extraction_are_rejected(self):
        destination = Path(self.temporary.name) / 'not-generated'
        destination.mkdir(exist_ok=True)
        note = destination / 'keep.txt'
        note.write_text('Unrelated user work')
        with self.assertRaisesRegex(ValueError, 'not owned'):
            builder.build(destination)
        self.assertEqual(note.read_text(), 'Unrelated user work')
        seed = json.loads((HERE / 'draft-scenarios.json').read_text())
        seed['source_sha256'] = '0' * 64
        with sqlite3.connect(':memory:') as empty:
            with self.assertRaisesRegex(ValueError, 'Scenario Markdown changed'):
                builder.add_draft_scenarios(empty, seed)
            self.assertEqual(empty.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall(), [])


if __name__ == '__main__':
    unittest.main(verbosity=2)
