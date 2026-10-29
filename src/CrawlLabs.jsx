import React, { useMemo, useState } from 'react';
import { Code2, Globe2, Play, Download, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import * as M from './math.js';

const sample = `<main id="quotes">\n  <div class="quote">\n    <span class="text">작은 실험에서 큰 이해가 시작됩니다.</span>\n    <span>by <small class="author">학습자 A</small></span>\n    <a class="tag" href="/tag/learning/">학습</a>\n  </div>\n  <div class="quote">\n    <span class="text">관찰한 결과를 자기 말로 설명해 보세요.</span>\n    <span>by <small class="author">학습자 B</small></span>\n    <a class="tag" href="/tag/data/">데이터</a>\n  </div>\n</main>`;
function parse(html, selector) {
  try {
    return {
      nodes: [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll(selector)],
      error: null,
    };
  } catch {
    return { nodes: [], error: '선택자 문법을 확인하세요. 예: .quote .author' };
  }
}
function Shell({ title, children }) {
  return (
    <div className="crawl-lab">
      <div className="crawl-title">
        <Globe2 size={15} />
        <span>WEB DATA LAB</span>
        <small>{title}</small>
      </div>
      {children}
    </div>
  );
}
function Stat({ label, value }) {
  return (
    <div className="crawl-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function SelectorLab() {
  const [html, setHtml] = useState(sample),
    [selector, setSelector] = useState('.quote .author');
  const result = useMemo(() => parse(html, selector), [html, selector]);
  return (
    <Shell title="선택자 놀이터">
      <div className="selector-presets">
        {[
          '.quote',
          '.text',
          '.author',
          '.quote > .author',
          '.quote .author',
          'a[href*="tag/"]',
          '#quotes',
        ].map((s) => (
          <button key={s} onClick={() => setSelector(s)} className={s === selector ? 'active' : ''}>
            {s}
          </button>
        ))}
      </div>
      <div className="selector-input">
        <label htmlFor="css-selector">CSS 선택자</label>
        <input
          id="css-selector"
          value={selector}
          onChange={(e) => setSelector(e.target.value)}
          spellCheck="false"
        />
        <code>soup.select('{selector}')</code>
      </div>
      <div className="crawl-columns">
        <div>
          <label className="editor-label" htmlFor="html-editor">
            <Code2 size={14} /> 원본 HTML · 직접 수정 가능
          </label>
          <textarea
            id="html-editor"
            className="html-editor"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            spellCheck="false"
          />
        </div>
        <div className="selection-results" aria-live="polite">
          <div className="result-heading">
            <span>선택 결과</span>
            <b>{result.nodes.length}개</b>
          </div>
          {result.error && <p className="error-message">{result.error}</p>}
          {!result.error && !result.nodes.length && (
            <div className="empty-state">
              일치하는 요소가 없습니다.
              <br />
              바로 아래 자식인지, 더 안쪽 자손인지 확인하세요.
            </div>
          )}
          {result.nodes.map((node, i) => (
            <div className="selected-node" key={i}>
              <code>
                &lt;{node.tagName.toLowerCase()}
                {node.className ? ` class="${node.className}"` : ''}&gt;
              </code>
              <p>{node.textContent.trim()}</p>
              {node.getAttribute('href') && <small>href: {node.getAttribute('href')}</small>}
            </div>
          ))}
        </div>
      </div>
      <div className="insight">
        {selector.includes('>')
          ? ' > 는 바로 아래 자식만 찾습니다. author는 quote 안의 span 안에 있으므로 .quote > .author와 일치하지 않습니다.'
          : '태그에서 글자만 꺼낼 때는 .get_text(strip=True), 링크 주소는 ["href"]를 사용합니다.'}
      </div>
    </Shell>
  );
}
function HttpLab() {
  const [scenario, setScenario] = useState('html');
  const cases = {
    html: { status: 200, type: 'text/html', body: sample },
    json: {
      status: 200,
      type: 'application/json',
      body: JSON.stringify({ items: [{ title: '작은 실험', author: '학습자 A' }] }, null, 2),
    },
    forbidden: { status: 403, type: 'text/html', body: '<h1>접근이 거부되었습니다.</h1>' },
    empty: {
      status: 200,
      type: 'text/html',
      body: '<main id="app"></main>\n<script src="app.js"></script>',
    },
    timeout: {
      status: null,
      type: '응답 없음',
      body: 'Timeout: 서버 응답 대기 시간이 초과되었습니다.',
    },
  };
  const c = cases[scenario],
    isError = c.status === null || c.status >= 400,
    count = !isError && c.type === 'text/html' ? parse(c.body, '.quote').nodes.length : 0;
  return (
    <Shell title="요청 → 확인 → 파싱">
      <div className="selector-presets">
        {[
          ['html', '200 HTML'],
          ['json', '200 JSON'],
          ['forbidden', '403 거부'],
          ['empty', '200 빈 HTML'],
          ['timeout', '시간 초과'],
        ].map(([v, t]) => (
          <button className={v === scenario ? 'active' : ''} key={v} onClick={() => setScenario(v)}>
            {t}
          </button>
        ))}
      </div>
      <div className="crawl-stats">
        <Stat label="HTTP 상태" value={c.status ?? 'Timeout'} />
        <Stat label="Content-Type" value={c.type} />
        <Stat label=".quote 카드" value={count} />
      </div>
      <pre className="sample-response">{c.body}</pre>
      <div className="request-flow">
        <span className="ok">요청 전송</span>
        <ArrowRight size={15} />
        <span className={isError ? 'fail' : 'ok'}>
          {c.status === null ? '예외 처리' : `상태 확인 ${c.status}`}
        </span>
        <ArrowRight size={15} />
        <span className={isError ? 'fail' : 'ok'}>
          {isError
            ? '실패 기록 후 다음 항목'
            : c.type === 'application/json'
              ? '키로 읽기: response.json()'
              : '태그 찾기: BeautifulSoup'}
        </span>
      </div>
      <div className="insight">
        {isError
          ? 'try/except로 실패 원인을 남기고 다음 항목으로 넘어갑니다. 상태 코드 검사만으로 timeout 예외까지 처리할 수는 없습니다.'
          : scenario === 'empty'
            ? '200이지만 카드 태그가 없습니다. 선택자가 맞는지, JavaScript가 뒤에서 내용을 만드는지 확인하세요.'
            : scenario === 'json'
              ? '데이터는 있지만 HTML 카드가 아닙니다. response.json()["items"]처럼 키와 목록으로 접근합니다.'
              : 'HTML에 카드가 2개 있습니다. 같은 카드 안에서 텍스트·저자를 짝지어 한 행으로 만들 수 있습니다.'}
      </div>
    </Shell>
  );
}
function DynamicLab() {
  const [mode, setMode] = useState('js'),
    [executed, setExecuted] = useState(false),
    [view, setView] = useState('response');
  const raw =
    mode === 'static'
      ? sample
      : '<main id="quotes"></main>\n<script>\n  var data = [\n    {text: "작은 실험에서 큰 이해가 시작됩니다.", author: "학습자 A"},\n    {text: "관찰한 결과를 자기 말로 설명해 보세요.", author: "학습자 B"}\n  ];\n  // JavaScript가 data로 .quote 태그를 생성합니다.\n</script>';
  const dom = mode === 'static' || executed ? sample : raw;
  return (
    <Shell title="서버 응답과 현재 DOM">
      <div className="selector-presets">
        {[
          ['static', '정적 페이지'],
          ['js', 'JavaScript 페이지'],
        ].map(([v, t]) => (
          <button
            className={mode === v ? 'active' : ''}
            key={v}
            onClick={() => {
              setMode(v);
              setExecuted(false);
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="crawl-stats">
        <Stat label="원본 응답의 .quote" value={parse(raw, '.quote').nodes.length} />
        <Stat label="현재 DOM의 .quote" value={parse(dom, '.quote').nodes.length} />
        <Stat
          label="JS 실행 상태"
          value={mode === 'static' ? '카드가 이미 있음' : executed ? '실행 후' : '실행 전'}
        />
      </div>
      <div className="dynamic-actions">
        <button
          className="btn primary"
          disabled={mode === 'static' || executed}
          onClick={() => {
            setExecuted(true);
            setView('dom');
          }}
        >
          <Play size={14} /> 브라우저처럼 JS 실행
        </button>
        <span>데이터를 카드 태그로 만드는 과정을 재현합니다.</span>
      </div>
      <div className="crawl-columns">
        <div>
          <div className="response-tabs">
            <button
              className={view === 'response' ? 'active' : ''}
              onClick={() => setView('response')}
            >
              Network · Response
            </button>
            <button className={view === 'dom' ? 'active' : ''} onClick={() => setView('dom')}>
              Elements · DOM
            </button>
          </div>
          <pre className="sample-response">{view === 'response' ? raw : dom}</pre>
        </div>
        <div className="mock-browser">
          <div className="mock-address">
            <i />
            <i />
            <i />
            <span>학습용 페이지 미리보기</span>
          </div>
          <h3>Quotes for Learning</h3>
          {parse(dom, '.quote').nodes.map((n, i) => (
            <article key={i}>
              <p>{n.querySelector('.text').textContent}</p>
              <small>by {n.querySelector('.author').textContent}</small>
            </article>
          ))}
          {mode === 'js' && !executed && (
            <p className="muted">아직 명언 카드가 만들어지지 않았습니다.</p>
          )}
        </div>
      </div>
      <div className="insight">
        원본 script에 문자열이 있어도 .quote 요소는 없을 수 있습니다. Network 응답에서 문자열 검색에
        성공했다고 CSS 선택에도 성공하는 것은 아닙니다.
      </div>
    </Shell>
  );
}
const trades = Array.from({ length: 7 }, (_, i) => ({
  aptNm: `학습아파트 ${String.fromCharCode(65 + i)}`,
  area: [59, 84, 72, 101, 49, 114, 84][i],
  price: [43000, 61000, 52000, 80000, 36000, 93000, 66000][i],
}));
function ApiLab() {
  const [size, setSize] = useState(3),
    [page, setPage] = useState(1),
    [format, setFormat] = useState('xml');
  const pages = Math.ceil(trades.length / size),
    rows = trades.slice((page - 1) * size, page * size);
  const xml = `<response>\n  <header><resultCode>000</resultCode></header>\n  <body>\n    <items>\n${rows.map((r) => `      <item><aptNm>${r.aptNm}</aptNm><area>${r.area}</area><price>${r.price}</price></item>`).join('\n')}\n    </items>\n    <totalCount>7</totalCount>\n  </body>\n</response>`;
  const payload = {
    response: { header: { resultCode: '000' }, body: { items: { item: rows }, totalCount: 7 } },
  };
  return (
    <Shell title="가상 거래 데이터 · 페이지 실습">
      <div className="api-controls">
        <label>
          페이지당 건수
          <select
            aria-label="페이지당 건수"
            value={size}
            onChange={(e) => {
              setSize(+e.target.value);
              setPage(1);
            }}
          >
            {[1, 2, 3, 5, 7].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          페이지 번호
          <select aria-label="페이지 번호" value={page} onChange={(e) => setPage(+e.target.value)}>
            {Array.from({ length: pages }, (_, i) => (
              <option key={i}>{i + 1}</option>
            ))}
          </select>
        </label>
        <label>
          연습 응답 형식
          <select
            aria-label="연습 응답 형식"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="xml">XML</option>
            <option value="json">JSON</option>
          </select>
        </label>
      </div>
      <div className="crawl-stats">
        <Stat label="전체 자료" value="7건" />
        <Stat label="현재 받은 자료" value={`${rows.length}건`} />
        <Stat label="필요 페이지" value={`${pages}페이지`} />
      </div>
      <div className="crawl-columns">
        <pre className="sample-response">
          {format === 'xml' ? xml : JSON.stringify(payload, null, 2)}
        </pre>
        <div>
          <h4 className="editor-label">item을 행으로 정리한 표</h4>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>아파트</th>
                  <th>면적 ㎡</th>
                  <th>가격 만원</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.aptNm}>
                    <td>{r.aptNm}</td>
                    <td>{r.area}</td>
                    <td>{r.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="insight">
            현재 {page}/{pages}페이지입니다.{' '}
            {rows.length === 1
              ? '한 건의 item이 dict로 해석되면 [item]으로 감싸 목록을 만듭니다.'
              : '여러 건이면 item 목록을 반복해 행을 만듭니다.'}
          </div>
        </div>
      </div>
      <div className="insight">
        실제 API 응답 형식은 해당 서비스가 지원해야 바꿀 수 있습니다. 이 형식 전환 버튼은 구조
        비교를 위한 학습용 기능입니다.
      </div>
    </Shell>
  );
}
function CollectionLab() {
  const [leak, setLeak] = useState(false);
  const data = useMemo(() => {
      const r = M.rng(72);
      return Array.from({ length: 60 }, (_, i) => {
        const area = 40 + r() * 90,
          price = 5000 + area * 600 + M.normal(r) * 5000;
        return { area, price, test: i >= 48 };
      });
    }, []),
    train = data.filter((p) => !p.test),
    test = data.filter((p) => p.test),
    fit = M.ols(train.map((p) => [leak ? p.price : p.area, p.price])),
    prediction = test.map((p) => fit.intercept + fit.slope * (leak ? p.price : p.area)),
    metrics = M.regressionMetrics(
      test.map((p) => p.price),
      prediction,
    ),
    baseline = M.regressionMetrics(
      test.map((p) => p.price),
      test.map(() => M.mean(train.map((p) => p.price))),
    );
  const save = () => {
    const blob = new Blob(
        [
          '\ufeffarea,price\n' +
            data.map((p) => `${p.area.toFixed(2)},${p.price.toFixed(2)}`).join('\n'),
        ],
        { type: 'text/csv;charset=utf-8' },
      ),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = 'apartment_synthetic.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <Shell title="수집 → 회귀 → 평가">
      <div className="selector-presets">
        <button className={!leak ? 'active' : ''} onClick={() => setLeak(false)}>
          면적으로 예측 · 올바른 입력
        </button>
        <button className={leak ? 'active' : ''} onClick={() => setLeak(true)}>
          거래금액도 입력 · 정답 누출
        </button>
      </div>
      <div className={`leak-banner ${leak ? 'leaking' : ''}`}>
        {leak ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
        <p>
          {leak
            ? '예측 시점에 모르는 거래금액을 입력으로 넣었습니다. 점수가 완벽해도 사용할 수 없습니다.'
            : '예측 시점에 알고 있는 면적을 사용합니다. 정답 거래금액은 학습과 평가에만 사용합니다.'}
        </p>
      </div>
      <div className="crawl-stats">
        <Stat label="모델 테스트 RMSE" value={`${Math.round(metrics.rmse).toLocaleString()}만원`} />
        <Stat label="평균 기준 RMSE" value={`${Math.round(baseline.rmse).toLocaleString()}만원`} />
        <Stat label="모델 테스트 R²" value={metrics.r2.toFixed(3)} />
      </div>
      <svg
        className="collection-chart"
        viewBox="0 0 600 270"
        role="img"
        aria-label="테스트 거래의 실제 가격과 예측 가격 비교"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1="55" x2="565" y1={235 - i * 50} y2={235 - i * 50} stroke="#e4eadb" />
            <text x="45" y={239 - i * 50} textAnchor="end">
              {(i * 25000) / 10000}억
            </text>
          </g>
        ))}
        <line x1="55" y1="235" x2="565" y2="35" stroke="#b8c8a4" strokeDasharray="5 4" />
        {test.map((p, i) => (
          <circle
            key={i}
            cx={55 + (p.price / 100000) * 510}
            cy={235 - (prediction[i] / 100000) * 200}
            r="5"
            fill={leak ? '#c8965b' : '#5d9b78'}
            opacity=".8"
          >
            <title>
              실제 {Math.round(p.price)}만원 / 예측 {Math.round(prediction[i])}만원
            </title>
          </circle>
        ))}
        <text x="300" y="263" textAnchor="middle">
          실제 거래금액 (만원 → 억원 표시)
        </text>
        <text x="15" y="130" textAnchor="middle" transform="rotate(-90 15 130)">
          예측 금액
        </text>
      </svg>
      <div className="insight">
        {leak
          ? '입력 자체가 정답이므로 y = 1×가격 + 0으로 복원됩니다. 면적과 ㎡당 거래가격을 함께 입력하는 경우도 정답 유래 정보인지 확인해야 합니다.'
          : '훈련 48건으로 학습하고 이후 12건을 평가했습니다. 점선은 예측=실제 기준입니다. 오차가 0이 아니어도 단순 평균 기준보다 나을 수 있습니다.'}
      </div>
      <div className="dynamic-actions">
        <button className="btn" onClick={save}>
          <Download size={15} /> 가상 거래 CSV 내려받기
        </button>
        <span>60건 · 설명용 합성 자료 · 실제 거래 아님</span>
      </div>
    </Shell>
  );
}
export default function CrawlLab({ type }) {
  const components = {
    selectors: SelectorLab,
    http: HttpLab,
    dynamic: DynamicLab,
    api: ApiLab,
    collection: CollectionLab,
  };
  const C = components[type];
  return <C />;
}
