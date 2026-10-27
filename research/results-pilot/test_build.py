"""Artifact checks for the synthetic-only comprehension kit, not human findings."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from zipfile import ZipFile

spec = importlib.util.spec_from_file_location('results_pilot_build', Path(__file__).with_name('build.py'))
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class PilotKitTests(unittest.TestCase):
    def test_rebuild_is_deterministic_and_zip_matches_sources_and_rules(self):
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary)
            bundle = builder.build(output)
            original = {p.name: p.read_bytes() for p in output.iterdir()}
            builder.build(output)
            self.assertEqual(original, {p.name: p.read_bytes() for p in output.iterdir()})
            manifest = json.loads((output / 'manifest.json').read_text())
            self.assertTrue(manifest['synthetic_only'])
            self.assertEqual(manifest['human_observations'], 0)
            self.assertEqual(len(manifest['cases']), 6)
            self.assertTrue(all(case['answer_count'] == 49 for case in manifest['cases']))
            for name, digest in manifest['source_sha256'].items():
                self.assertEqual(hashlib.sha256((builder.ROOT / name).read_bytes()).hexdigest(), digest)
            with ZipFile(bundle) as archive:
                self.assertIsNone(archive.testzip())
                self.assertEqual(set(archive.namelist()), set(manifest['bundle_file_sha256']) | {'manifest.json'})
                self.assertEqual(len(archive.namelist()), 13)
                for name, digest in manifest['bundle_file_sha256'].items():
                    self.assertEqual(hashlib.sha256(archive.read(name)).hexdigest(), digest)
                builder.validate_blank_log(archive.read('observation-log-template.csv'))
                source = builder.load_examples()
                key = archive.read('EXAMPLES.md').decode()
                for case in source['examples']:
                    label = case['case']['id']
                    text = archive.read(f'reports/SYNTHETIC-{label}.txt').decode()
                    self.assertTrue(text.startswith('SYNTHETIC PILOT EXAMPLE — NOT A PARTICIPANT RESPONSE'))
                    self.assertTrue(text.endswith(case['text']))
                    self.assertIn(case['report']['world']['inspiration'], text)
                    for insight in case['interpretation']['insights']:
                        self.assertIn(insight['text'], key)
                        self.assertIn(insight['text'], text)

    def test_packaging_refuses_observations_and_malformed_log_headers(self):
        header = ','.join(builder.LOG_COLUMNS).encode()
        builder.validate_blank_log(header + b'\n')
        with self.assertRaisesRegex(ValueError, 'observation data'):
            builder.validate_blank_log(header + b'\nTEST-ONLY-SYNTHETIC-ROW\n')
        for invalid in [b'', b'only_one_column\n', header.replace(b'observation_id', b'session_code')]:
            with self.assertRaisesRegex(ValueError, '18-column header'):
                builder.validate_blank_log(invalid)

    def test_generated_artifacts_do_not_overwrite_links_or_authored_files(self):
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / 'artifacts'
            output.mkdir()
            keep = output / 'PROTOCOL.md'
            keep.write_text('Local authored document')
            outside = Path(temporary) / 'outside.md'
            outside.write_text('Keep this file')
            (output / 'EXAMPLES.md').symlink_to(outside)
            with self.assertRaisesRegex(ValueError, 'symlink artifact'):
                builder.build(output)
            self.assertEqual(outside.read_text(), 'Keep this file')
            self.assertEqual(keep.read_text(), 'Local authored document')
            (output / 'EXAMPLES.md').unlink()
            builder.build(output)
            self.assertEqual(keep.read_text(), 'Local authored document')


if __name__ == '__main__':
    unittest.main()
