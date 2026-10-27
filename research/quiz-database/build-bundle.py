#!/usr/bin/env python3
"""Package the generated author catalog and its editable expansion source."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

HERE = Path(__file__).resolve().parent
OUTPUT = HERE / 'downloads' / 'quiz-database-2026-10-27.zip'
paths = [HERE / name for name in ('README.md', 'schema.sql', 'queries.sql')]
paths += sorted(path for path in (HERE / 'generated').rglob('*')
                if path.is_file() and path.name != 'CATALOG-OWNER')
paths += sorted((HERE / 'expansion').glob('*.json'))
if not (HERE / 'generated' / 'expansion-candidates.md').is_file():
    raise SystemExit('Build and check the catalog first; the expansion guide is missing.')
OUTPUT.parent.mkdir(exist_ok=True)
with ZipFile(OUTPUT, 'w') as archive:
    for path in paths:
        info = ZipInfo(path.relative_to(HERE).as_posix(), (2026, 10, 27, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        archive.writestr(info, path.read_bytes())
print(f'Built {OUTPUT} with {len(paths)} files')
