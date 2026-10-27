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
        self.assertEqual(self.scalar('PRAGMA user_version'), 2)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO package_items(package_id,item_id,usage) VALUES ('REVIEW-A','not-an-item','primary_task')")
        self.db.rollback()
        self.assertEqual(dict(self.rows('SELECT bank,count(*) FROM items GROUP BY bank')),
                         {'current': 49, 'candidate': 102})

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
        self.assertEqual(self.scalar("SELECT count(*) FROM item_texts WHERE language='vi'"), 147)
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
                          ('REVIEW-A', 14, 14, 13, 1), ('REVIEW-B', 14, 14, 13, 0), ('REVIEW-C', 14, 14, 12, 0),
                          ('REVIEW-D', 10, 10, 10, 0), ('REVIEW-E', 10, 10, 10, 0),
                          ('REVIEW-F', 10, 10, 10, 0), ('REVIEW-G', 10, 10, 10, 0),
                          ('REVIEW-H', 10, 10, 10, 0), ('REVIEW-I', 5, 5, 5, 0), ('REVIEW-J', 5, 5, 5, 0)])
        self.assertEqual(self.scalar("SELECT count(*) FROM package_outcomes WHERE package_id='FUTURE-24'"), 0)

    def test_outcome_links_preserve_probe_only_and_whole_package_meanings(self):
        self.assertEqual(self.scalar('SELECT count(*) FROM outcomes'), 55)
        self.assertEqual(self.rows("SELECT i.id FROM items i WHERE NOT EXISTS (SELECT 1 FROM item_outcomes io WHERE io.item_id=i.id AND io.relationship IN ('primary','probe'))"), [])
        self.assertEqual(self.rows("SELECT io.relationship,o.claim_kind FROM item_outcomes io JOIN outcomes o ON o.id=io.outcome_id WHERE io.item_id='CR-S03'"),
                         [('probe', 'comprehension')])
        self.assertEqual(self.rows("SELECT coverage_scope,linked_items,applicable_items FROM package_outcome_matrix WHERE outcome_id='REVIEW-COMPREHENSION' ORDER BY package_id"),
                         [('whole_package', 0, 49), ('whole_package', 0, 14), ('whole_package', 0, 14), ('whole_package', 0, 14)] +
                         [('whole_package', 0, 10)] * 5 + [('whole_package', 0, 5)] * 2)
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
                         {'authored_unreviewed': 72, 'needs_authorization_review': 144})
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
        self.assertEqual(self.rows("SELECT verification,count(*) FROM readings WHERE id NOT LIKE 'EX-%' GROUP BY verification"), [('unverified', 48)])
        self.assertEqual(dict(self.rows('SELECT status,count(*) FROM variants GROUP BY status')),
                         {'editorial_proposal': 18, 'implemented_comparison': 1})
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

    def test_expansion_statements_preserve_rivals_probes_and_internal_disagreements(self):
        packets, ledger = builder.expansion.load(builder.ROOT)
        self.assertEqual(len([c for _, packet in packets for c in packet['clusters']]), 12)
        count = 0
        for path, packet in packets:
            for cluster in packet['clusters']:
                self.assertEqual(self.rows('SELECT lens,argument,internal_disagreement FROM cluster_tensions WHERE cluster_id=? ORDER BY display_order',
                                           (cluster['id'],)),
                                 [(t['lens'], t['argument'], t['internal_disagreement']) for t in cluster['tradition_tensions']])
                for statement in cluster['statements']:
                    count += 1
                    for language in ('en', 'vi'):
                        self.assertEqual(self.rows('SELECT text,usage FROM item_texts WHERE item_id=? AND language=?',
                                                   (statement['id'], language)), [(statement[language], 'review_only')])
                    self.assertEqual(self.rows('SELECT rival_reading,comprehension_probe FROM statement_review WHERE item_id=?',
                                               (statement['id'],)), [(statement['rival_reading'], statement['probe'])])
                    self.assertEqual(self.rows('SELECT source_path,rationale,scoring_mode,direction FROM items WHERE id=?',
                                               (statement['id'],)), [(path, statement['distinction'], 'descriptive', None)])
                    self.assertEqual({r[0] for r in self.rows('SELECT reading_id FROM item_readings WHERE item_id=?', (statement['id'],))},
                                     set(statement['reading_ids']))
        self.assertEqual(count, 48)

    def test_expansion_scenarios_preserve_authority_options_reasons_and_preferences(self):
        packets, _ = builder.expansion.load(builder.ROOT)
        scenes = [scene for _, packet in packets for scene in packet['scenarios']]
        self.assertEqual(len(scenes), 12)
        for scene in scenes:
            with self.subTest(scene=scene['id']):
                self.assertEqual(self.rows('SELECT role_id,locality,cluster_id,scoring_mode FROM items WHERE id=?', (scene['id'],)),
                                 [(scene['role_id'], scene['locality'], scene['cluster_id'], 'descriptive')])
                self.assertEqual(self.rows('SELECT option_id,current_authored_score FROM options WHERE item_id=? ORDER BY display_order', (scene['id'],)),
                                 [('A', None), ('B', None), ('C', None)])
                for language in ('en', 'vi'):
                    text = self.scalar('SELECT text FROM item_texts WHERE item_id=? AND language=?', (scene['id'], language))
                    self.assertIn(scene['briefing'][language], text)
                    self.assertIn(scene['personal_preference_prompt'][language], text)
                    for option in scene['options']:
                        self.assertEqual(self.rows('SELECT label,description,tradeoff FROM option_texts WHERE item_id=? AND option_id=? AND language=?',
                                                   (scene['id'], option['id'], language)),
                                         [(option['label'][language], option['description'][language], option['tradeoff'][language])])
                    self.assertEqual(self.scalar('SELECT notes FROM reason_notes WHERE item_id=? AND language=?', (scene['id'], language)),
                                     '\n'.join(scene['reasons'][language]))
                    self.assertEqual(self.scalar('SELECT prompt FROM scenario_preference_prompts WHERE item_id=? AND language=?',
                                                 (scene['id'], language)), scene['personal_preference_prompt'][language])
                self.assertEqual([r[0] for r in self.rows('SELECT probe FROM scenario_probes WHERE item_id=? ORDER BY display_order', (scene['id'],))],
                                 scene['comprehension_probes'])
                self.assertEqual(self.rows('SELECT description,invariants,interpretation_limit,translation_status,comparison_item_id FROM variants WHERE base_item_id=?',
                                           (scene['id'],)), [(scene['variant']['description'], scene['variant']['invariants'],
                                                              scene['variant']['interpretation_limit'], 'not_drafted', None)])

    def test_expansion_packages_allocate_all_sixty_items_once_with_exact_outcomes(self):
        all_items = []
        for suffix, (clusters, scenes) in builder.expansion.PACKETS.items():
            expected = {f'CR-{n:02}{letter}' for n in clusters for letter in 'ABCD'} | {f'CR-S{n:02}' for n in scenes}
            actual = self.rows('SELECT item_id,presentation_order FROM package_items WHERE package_id=?', ('REVIEW-' + suffix,))
            self.assertEqual({r[0] for r in actual}, expected)
            self.assertTrue(all(r[1] is None for r in actual))
            all_items.extend(r[0] for r in actual)
            expected_outcomes = {f'DEBATE-{n:02}' for n in clusters} | {f'SCENARIO-{n:02}' for n in scenes} | {'REVIEW-COMPREHENSION'}
            self.assertEqual({r[0] for r in self.rows('SELECT outcome_id FROM package_outcomes WHERE package_id=?', ('REVIEW-' + suffix,))}, expected_outcomes)
        self.assertEqual(len(all_items), 60)
        self.assertEqual(len(set(all_items)), 60)
        packets, _ = builder.expansion.load(builder.ROOT)
        for path, packet in packets:
            for outcome in packet['outcomes']:
                self.assertEqual({r[0] for r in self.rows('SELECT item_id FROM item_outcomes WHERE outcome_id=?', (outcome['id'],))}, set(outcome['item_ids']))
                self.assertEqual(self.rows('SELECT intended_interpretation,evidence_required,unsupported_inferences,status FROM outcomes WHERE id=?',
                                           (outcome['id'],)), [(outcome['intended_interpretation'], outcome['evidence_required'],
                                                               outcome['unsupported_inferences'], 'author_draft')])

    def test_inspected_source_passages_preserve_provenance_without_upgrading_old_proposals(self):
        _, ledger = builder.expansion.load(builder.ROOT)
        self.assertEqual(self.scalar('SELECT count(*) FROM reading_evidence'), len(ledger['readings']))
        for reading in ledger['readings']:
            self.assertEqual(self.scalar('SELECT verification FROM readings WHERE id=?', (reading['id'],)), reading['verification'])
            self.assertEqual(self.rows('SELECT source_kind,retrieval_status,access_date,relevance,limits FROM reading_evidence WHERE reading_id=?',
                                       (reading['id'],)), [(reading['source_kind'], reading['retrieval_status'], reading['access_date'],
                                                          reading['relevance'], reading['limits'])])
            self.assertEqual(self.rows('SELECT locator,excerpt,url,sha256 FROM reading_passages WHERE reading_id=? ORDER BY passage_number',
                                       (reading['id'],)), [(p['locator'], p['excerpt'], p['url'], p['sha256']) for p in reading['passages']])
        self.assertEqual(self.rows("SELECT verification,count(*) FROM readings WHERE id NOT LIKE 'EX-%' GROUP BY verification"), [('unverified', 48)])
        self.assertEqual(self.rows("SELECT r.id FROM readings r WHERE r.verification='unverified' AND EXISTS (SELECT 1 FROM reading_passages p WHERE p.reading_id=r.id)"), [])

    def test_readable_expansion_exports_retain_questions_sources_and_limits(self):
        packets, ledger = builder.expansion.load(builder.ROOT)
        candidates = (self.output / 'expansion-candidates.md').read_text()
        sources = (self.output / 'source-evidence.md').read_text()
        for _, packet in packets:
            for cluster in packet['clusters']:
                for statement in cluster['statements']:
                    for field in ('en', 'vi', 'distinction', 'rival_reading', 'probe'):
                        self.assertIn(statement[field], candidates)
            for scene in packet['scenarios']:
                self.assertIn(scene['briefing']['en'], candidates)
                self.assertIn(scene['briefing']['vi'], candidates)
                self.assertIn(scene['interpretation_limits'], candidates)
            for outcome in packet['outcomes']:
                self.assertIn(outcome['unsupported_inferences'], candidates)
        for reading in ledger['readings']:
            self.assertIn(reading['bibliographic_proposal'], sources)
            self.assertIn(reading['verification'], sources)
            self.assertIn(reading['limits'], sources)
            for passage in reading['passages']:
                self.assertIn(passage['excerpt'], sources)
                self.assertIn(passage['sha256'], sources)

    def test_expansion_rejects_unsubstantiated_inspection_and_misassigned_outcomes(self):
        import shutil
        with tempfile.TemporaryDirectory(prefix='expansion-invalid-') as directory:
            root = Path(directory)
            for path in builder.expansion.PATHS:
                target = root / path
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(builder.ROOT / path, target)
            path = root / builder.expansion.SOURCE_PATH
            original = path.read_text()
            ledger = json.loads(original)
            unverified = next(r for r in ledger['readings'] if r['verification'] == 'unverified')
            unverified['verification'] = 'passage_inspected'
            path.write_text(json.dumps(ledger))
            with self.assertRaisesRegex(ValueError, 'passages and inspection status disagree'):
                builder.expansion.load(root)
            path.write_text(original)
            candidate_path = root / 'research/quiz-database/expansion/care-family.json'
            candidate = json.loads(candidate_path.read_text())
            candidate['outcomes'][0]['item_ids'] = ['CR-S07']
            candidate_path.write_text(json.dumps(candidate))
            with self.assertRaisesRegex(ValueError, 'incorrect intended-outcome links'):
                builder.expansion.load(root)

    def test_all_ten_documented_queries_run_without_modifying_data(self):
        sql = (HERE / 'queries.sql').read_text()
        uncommented = re.sub(r'^\s*--.*$', '', sql, flags=re.M)
        statements = [s.strip() for s in uncommented.split(';') if s.strip()]
        self.assertEqual(len(statements), 10)
        self.db.execute('PRAGMA query_only=ON')
        expected_counts = [12, 7, 14, 4, 1, 1, 16, 5, len(json.loads((HERE / 'expansion/sources.json').read_text())['readings']), 10]
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
