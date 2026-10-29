"""Exercise the two external-site snippets with a headless Chrome for QA."""
from pathlib import Path
import os
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parents[1]
for name in ['http', 'dynamic']:
    code = (root / '.qa' / 'python' / (name + '.py')).read_text(encoding='utf-8')
    if name == 'dynamic':
        code = code.replace('driver = webdriver.Chrome()', '''options = webdriver.ChromeOptions()
options.add_argument('--headless=new')
driver = webdriver.Chrome(options=options)''')
    with tempfile.TemporaryDirectory() as directory:
        source = Path(directory) / ('ml_' + name + '.py')
        source.write_text(code, encoding='utf-8')
        result = subprocess.run([sys.executable, '-I', '-X', 'utf8', str(source)],
            cwd=directory, capture_output=True, text=True, encoding='utf-8', timeout=90,
            env={**os.environ, 'PYTHONUTF8': '1'})
    print(name, 'PASS' if result.returncode == 0 else 'FAIL', flush=True)
    if result.returncode:
        print(result.stderr)
        sys.exit(1)
    if name == 'http' and '수집: 10 실패: 0' not in result.stdout:
        raise SystemExit('Unexpected static quote collection result')
    if name == 'dynamic' and len(result.stdout.strip().splitlines()) < 20:
        raise SystemExit('Dynamic quote cards were not collected')
print('Live static and JS pages collected on Python', sys.version.split()[0])
