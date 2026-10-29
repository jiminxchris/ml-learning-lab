"""Run independent classroom snippets in a temporary directory on Python 3.13."""
from pathlib import Path
import os
import subprocess
import sys
import tempfile
import json
import sklearn

assert sys.version_info[:2] == (3, 13), sys.version
examples = Path(__file__).resolve().parents[1] / '.qa' / 'python'
failures = []
outputs = {}
for source in sorted(examples.glob('*.py')):
    if source.stem in {'http', 'dynamic'}:
        print(source.stem, 'SKIP: external network/browser exercise', flush=True)
        continue
    with tempfile.TemporaryDirectory() as directory:
        result = subprocess.run(
            [sys.executable, '-I', '-X', 'utf8', str(source)], cwd=directory,
            capture_output=True, text=True, encoding='utf-8', timeout=90,
            env={**os.environ, 'MPLBACKEND': 'Agg', 'PYTHONUTF8': '1'}
        )
    print(source.stem, 'PASS' if result.returncode == 0 else 'FAIL', flush=True)
    if result.returncode == 0:
        outputs[source.stem] = result.stdout.strip()
    if result.returncode:
        failures.append((source.stem, result.stderr))
for name, error in failures:
    print(name, error)
if not failures:
    target = examples.parents[1] / 'src' / 'example-results.json'
    target.write_text(json.dumps({
        'python': sys.version.split()[0], 'sklearn': sklearn.__version__,
        'date': '2026-10-29', 'outputs': outputs
    }, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Saved verified example output snapshots.', flush=True)
sys.exit(bool(failures))
