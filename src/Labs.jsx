import React, { useMemo, useState } from 'react';
import { Play, RotateCcw, Sparkles, MousePointer2, SlidersHorizontal } from 'lucide-react';
import * as M from './math.js';
import iris from './iris.json';
import CrawlLab from './CrawlLabs.jsx';
import { useTweenGeometry, usePlayback, Playback, HistoryStrip } from './Motion.jsx';

const colors = ['#218675', '#d58a48', '#657bb9', '#b36a89', '#8e9c48', '#65aeb7'];
const f = (v, n = 3) => (v === null || !Number.isFinite(v) ? '계산 불가' : v.toFixed(n));
export function Range({ label, value, onChange, min, max, step = 1, suffix = '' }) {
  return (
    <label className="control">
      <span>
        {label}
        <strong>
          {value}
          {suffix}
        </strong>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
      <small>
        {min}
        {suffix}
        <span>
          {max}
          {suffix}
        </span>
      </small>
    </label>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <label className="control">
      <span>{label}</span>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, t]) => (
          <option value={v} key={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
function Toggle({ label, value, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
function Stats({ items }) {
  return (
    <div className="stats" aria-live="polite">
      {items.map(([label, value, note]) => (
        <div className="stat" key={label}>
          <span>{label}</span>
          <strong key={String(value)} className="metric-value">
            {value}
          </strong>
          {note && <small>{note}</small>}
        </div>
      ))}
    </div>
  );
}
function Frame({ controls, children, note, onInteract }) {
  return (
    <div className="experiment">
      <div className="experiment-top">
        <span>
          <span className="live-dot" /> LIVE EXPERIMENT
        </span>
        <span>값을 바꾸고, 결과를 관찰하세요</span>
      </div>
      <div className="experiment-body">
        <aside
          className="controls"
          onPointerDownCapture={onInteract}
          onKeyDownCapture={(e) => {
            if (
              [
                'ArrowUp',
                'ArrowDown',
                'ArrowLeft',
                'ArrowRight',
                'Home',
                'End',
                'PageUp',
                'PageDown',
              ].includes(e.key)
            )
              onInteract?.();
          }}
        >
          <div className="control-heading">
            <SlidersHorizontal size={15} /> 실험 설정
          </div>
          {controls}
        </aside>
        <div className="lab-result">{children}</div>
      </div>
      {note && (
        <div className="lab-footnote">
          {note}
          <span className="motion-note">
            그래프의 중간 위치는 부드러운 전환 효과입니다. 점수는 현재 설정으로 계산한 결과입니다.
          </span>
        </div>
      )}
    </div>
  );
}
function Plot({
  points = [],
  lines = [],
  centers = [],
  segments = [],
  background = [],
  query,
  onPick,
  xLabel = '특성 1',
  yLabel = '특성 2',
  domain,
  focus,
  children,
}) {
  const W = 600,
    H = 350,
    P = 44;
  const all = [...points, ...lines.flatMap((l) => l.points || []), ...centers];
  let xr = domain?.[0] || [
      Math.min(...all.map((p) => p[0])) - 0.3,
      Math.max(...all.map((p) => p[0])) + 0.3,
    ],
    yr = domain?.[1] || [
      Math.min(...all.map((p) => p[1])) - 0.3,
      Math.max(...all.map((p) => p[1])) + 0.3,
    ];
  if (!all.length && !domain) {
    xr = [-3, 3];
    yr = [-3, 3];
  }
  const x = (v) => P + ((v - xr[0]) / (xr[1] - xr[0])) * (W - P - 18),
    y = (v) => H - P - ((v - yr[0]) / (yr[1] - yr[0])) * (H - P - 18);
  const pick = (e) => {
    if (!onPick) return;
    const box = e.currentTarget.getBoundingClientRect(),
      px = ((e.clientX - box.left) / box.width) * W,
      py = ((e.clientY - box.top) / box.height) * H;
    onPick([
      Math.max(xr[0], Math.min(xr[1], xr[0] + ((px - P) / (W - P - 18)) * (xr[1] - xr[0]))),
      Math.max(yr[0], Math.min(yr[1], yr[0] + ((H - P - py) / (H - P - 18)) * (yr[1] - yr[0]))),
    ]);
  };
  const clipId = React.useId();
  const geometry = useTweenGeometry({
    points: points.map((p) => [x(p[0]), y(p[1])]),
    lines: lines.map((l) => l.points.map((p) => [x(p[0]), y(p[1])])),
    centers: centers.map((p) => [x(p[0]), y(p[1])]),
    segments: segments.map((s) => s.slice(0, 2).map((p) => [x(p[0]), y(p[1])])),
    query: query ? [x(query[0]), y(query[1])] : null,
  });
  const pointAt = (i) => geometry.points[i] || [x(points[i][0]), y(points[i][1])];
  const dragging = React.useRef(false);
  return (
    <svg
      className={'plot ' + (onPick ? 'clickable' : '')}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${xLabel}와 ${yLabel} 산점도${onPick ? (focus ? '. 클릭하거나 드래그해 관찰할 표본 선택' : '. 클릭하거나 드래그해 새 점 이동') : ''}`}
      onPointerDown={(e) => {
        if (onPick) {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          pick(e);
        }
      }}
      onPointerMove={(e) => {
        if (dragging.current) pick(e);
      }}
      onPointerUp={(e) => {
        dragging.current = false;
        if (e.currentTarget.hasPointerCapture(e.pointerId))
          e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={P} y={18} width={W - P - 18} height={H - P - 18} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {background.map((p, i) => (
          <rect
            key={i}
            x={x(p[0])}
            y={y(p[1] + p[3])}
            width={x(p[0] + p[3]) - x(p[0]) + 1}
            height={y(p[1]) - y(p[1] + p[3]) + 1}
            fill={colors[p[2]]}
            className="decision-cell"
            opacity=".1"
          />
        ))}
      </g>
      {Array.from({ length: 5 }, (_, i) => {
        const xv = xr[0] + (i * (xr[1] - xr[0])) / 4,
          yv = yr[0] + (i * (yr[1] - yr[0])) / 4;
        return (
          <g key={i}>
            <line x1={x(xv)} y1={18} x2={x(xv)} y2={H - P} stroke="#e5eae5" strokeDasharray="3 4" />
            <line x1={P} y1={y(yv)} x2={W - 18} y2={y(yv)} stroke="#e5eae5" strokeDasharray="3 4" />
            <text x={x(xv)} y={H - P + 20} textAnchor="middle">
              {f(xv, 1)}
            </text>
            <text x={P - 10} y={y(yv) + 4} textAnchor="end">
              {f(yv, 1)}
            </text>
          </g>
        );
      })}
      <g clipPath={`url(#${clipId})`}>
        {focus && (
          <g className="neighborhood" key={focus.index}>
            <ellipse
              cx={x(focus.center[0])}
              cy={y(focus.center[1])}
              rx={Math.abs(x(focus.center[0] + focus.radius) - x(focus.center[0]))}
              ry={Math.abs(y(focus.center[1] + focus.radius) - y(focus.center[1]))}
              fill="#e1b968"
              fillOpacity=".12"
              stroke="#ba913e"
              strokeDasharray="5 4"
              strokeWidth="1.5"
            />
            {focus.neighbors.map((i) => (
              <circle
                key={i}
                cx={x(points[i][0])}
                cy={y(points[i][1])}
                r="7"
                fill="none"
                stroke="#c29b48"
                strokeWidth="1.5"
              />
            ))}
            <circle
              cx={x(focus.center[0])}
              cy={y(focus.center[1])}
              r="9"
              fill="none"
              stroke="#435c38"
              strokeWidth="2.3"
            />
          </g>
        )}
        {segments.map((s, i) => (
          <line
            key={i}
            x1={geometry.segments[i]?.[0]?.[0] ?? x(s[0][0])}
            y1={geometry.segments[i]?.[0]?.[1] ?? y(s[0][1])}
            x2={geometry.segments[i]?.[1]?.[0] ?? x(s[1][0])}
            y2={geometry.segments[i]?.[1]?.[1] ?? y(s[1][1])}
            stroke={s[2] || '#d69b70'}
            strokeWidth="1"
            opacity=".5"
          />
        ))}
        {lines.map((l, i) => (
          <path
            key={i}
            className="prediction-line"
            d={(geometry.lines[i] || l.points.map((p) => [x(p[0]), y(p[1])]))
              .map((p, j) => `${j ? 'L' : 'M'} ${p[0]} ${p[1]}`)
              .join(' ')}
            stroke={l.color || '#153f36'}
            strokeWidth="2.8"
            fill="none"
            strokeDasharray={l.dash}
          />
        ))}
        {points.map((p, i) =>
          p[2] === -1 ? (
            <path
              key={i}
              d={`M${pointAt(i)[0] - 4},${pointAt(i)[1] - 4}l8,8m-8,0l8,-8`}
              stroke="#89918d"
              strokeWidth="1.6"
            >
              <title>표본 {i + 1}: 잡음</title>
            </path>
          ) : (
            <circle
              key={i}
              cx={pointAt(i)[0]}
              cy={pointAt(i)[1]}
              className="sample-point"
              r={p[4] ? 5 : 4}
              fill={p[3] === 'test' ? '#fff' : colors[(p[2] || 0) % colors.length]}
              stroke={colors[(p[2] || 0) % colors.length]}
              strokeWidth={p[3] === 'test' ? 2 : 1}
              opacity=".85"
            >
              <title>
                표본 {i + 1}: ({f(p[0], 2)}, {f(p[1], 2)}) ·{' '}
                {p[3] === 'test' ? '테스트' : `그룹 ${p[2] || 0}`}
              </title>
            </circle>
          ),
        )}
        {centers.map((p, i) => (
          <g
            key={i}
            className="cluster-center"
            transform={`translate(${geometry.centers[i]?.[0] ?? x(p[0])},${geometry.centers[i]?.[1] ?? y(p[1])})`}
          >
            <circle r="14" fill={colors[i % 6]} opacity=".08" />
            <path d="M-7,-7L7,7M-7,7L7,-7" stroke="white" strokeWidth="7" />
            <path d="M-7,-7L7,7M-7,7L7,-7" stroke={colors[i % 6]} strokeWidth="4" />
            <title>군집 {i} 중심</title>
          </g>
        ))}
        {query && (
          <g
            transform={`translate(${geometry.query?.[0] ?? x(query[0])},${geometry.query?.[1] ?? y(query[1])})`}
          >
            <circle r="10" fill="#f7e2a1" stroke="#463e2c" strokeWidth="2" />
            <text y="4" textAnchor="middle" style={{ fill: '#463e2c', fontWeight: 800 }}>
              ?
            </text>
          </g>
        )}
        {children?.({ x, y })}
      </g>
      <text className="axis-label" x={W / 2} y={H - 4} textAnchor="middle">
        {xLabel}
      </text>
      <text
        className="axis-label"
        transform={`translate(12 ${H / 2}) rotate(-90)`}
        textAnchor="middle"
      >
        {yLabel}
      </text>
    </svg>
  );
}
function Legend({ items }) {
  return (
    <div className="legend">
      {items.map(([t, c]) => (
        <span key={t}>
          <i style={{ background: c }} />
          {t}
        </span>
      ))}
    </div>
  );
}
function CurveLab({ type }) {
  const [slope, setSlope] = useState(1.2),
    [intercept, setIntercept] = useState(0.4),
    [outlier, setOutlier] = useState(false),
    [degree, setDegree] = useState(type === 'regularization' ? 9 : 3),
    [alpha, setAlpha] = useState(0.03),
    [kind, setKind] = useState('ridge'),
    [test, setTest] = useState(true),
    [epoch, setEpoch] = useState(0),
    [history, setHistory] = useState([]);
  const data = useMemo(() => {
    const a = M.syntheticRegression();
    if (outlier) a.push([0.8, -3.8, 'train']);
    return a;
  }, [outlier]);
  const train = data.filter((p) => p[2] === 'train'),
    valid = data.filter((p) => p[2] === 'test');
  const fit = useMemo(
    () => M.polynomialFit(train, degree, type === 'regularization' ? alpha : 0, kind),
    [degree, alpha, kind, type, data],
  );
  const predict = type === 'linear' ? (x) => slope * x + intercept : fit.predict;
  const trainScore = M.regressionMetrics(
      train.map((p) => p[1]),
      train.map((p) => predict(p[0])),
    ),
    testScore = M.regressionMetrics(
      valid.map((p) => p[1]),
      valid.map((p) => predict(p[0])),
    );
  const line = Array.from({ length: 140 }, (_, i) => {
    const x = -1 + (i * 2) / 139;
    return [x, predict(x)];
  });
  const player = usePlayback(
    () => {
      if (type === 'linear') {
        const next = M.linearGradientStep(train, slope, intercept),
          change = Math.abs(next.slope - slope) + Math.abs(next.intercept - intercept);
        if (change < 0.0001 || epoch >= 100) return false;
        const value = M.regressionMetrics(
          train.map((p) => p[1]),
          train.map((p) => next.slope * p[0] + next.intercept),
        ).mse;
        setSlope(next.slope);
        setIntercept(next.intercept);
        setEpoch((v) => v + 1);
        setHistory((h) => [
          ...(h.length ? h : [{ step: 0, value: trainScore.mse }]),
          { step: epoch + 1, value },
        ]);
        return true;
      }
      if (type === 'polynomial') {
        if (degree >= 9) return false;
        setDegree((v) => v + 1);
        return true;
      }
      if (alpha >= 1) return false;
      setAlpha((v) => Math.min(1, +(v + 0.05).toFixed(2)));
      return true;
    },
    () => {
      if (type === 'linear') {
        setSlope(1.2);
        setIntercept(0.4);
        setEpoch(0);
        setHistory([]);
      } else if (type === 'polynomial') setDegree(1);
      else setAlpha(0);
    },
    type === 'linear' ? 450 : 1100,
  );
  const manual = () => {
    player.pause();
    setEpoch(0);
    setHistory([]);
  };
  return (
    <Frame
      onInteract={manual}
      controls={
        <>
          {type === 'linear' ? (
            <>
              <Range
                label="기울기 w"
                value={+slope.toFixed(3)}
                onChange={setSlope}
                min={-2}
                max={5}
                step={0.05}
              />
              <Range
                label="절편 b"
                value={+intercept.toFixed(3)}
                onChange={setIntercept}
                min={-2}
                max={2}
                step={0.05}
              />
              <button
                className="btn primary"
                onClick={() => {
                  const m = M.ols(train);
                  setSlope(+m.slope.toFixed(4));
                  setIntercept(+m.intercept.toFixed(4));
                }}
              >
                <Sparkles size={15} /> 최소제곱 선 찾기
              </button>
              <Toggle label="이상치 한 점 추가" value={outlier} onChange={setOutlier} />
            </>
          ) : (
            <>
              <Range label="다항 차수" value={degree} onChange={setDegree} min={1} max={9} />
              {type === 'regularization' && (
                <>
                  <Select
                    label="규제 방식"
                    value={kind}
                    onChange={setKind}
                    options={[
                      ['ridge', 'Ridge · L2'],
                      ['lasso', 'Lasso · L1'],
                    ]}
                  />
                  <Range
                    label="규제 강도 α"
                    value={alpha}
                    onChange={setAlpha}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                </>
              )}
            </>
          )}
          <Toggle label="테스트 표본 표시" value={test} onChange={setTest} />
          <div className="tiny-note">
            학습 {train.length}개 · 테스트 {valid.length}개<br />
            고정된 합성 데이터 / 동일 분할
          </div>
        </>
      }
      note="직선·다항 모델은 현재 학습점으로 계산합니다. 그래프의 y축 범위는 −5~5로 고정해 큰 진동을 비교하며 범위 밖 곡선은 잘립니다."
    >
      <Playback
        player={player}
        title={
          type === 'linear'
            ? '직선이 학습되는 과정'
            : type === 'polynomial'
              ? '차수에 따른 곡선 비교'
              : '규제 강도에 따른 계수 비교'
        }
        description={
          type === 'linear'
            ? '학습 오차가 줄어드는 방향으로 계수를 조금씩 갱신하는 경사하강 시연입니다. 최소제곱 해에 접근하는 과정을 관찰하세요.'
            : '설정을 순서대로 바꾸며 각각의 모델을 다시 학습합니다. 학습 반복 횟수가 아닌 설정 비교입니다.'
        }
        status={
          type === 'linear'
            ? `${epoch}회 갱신 · 학습 MSE ${f(trainScore.mse)}`
            : type === 'polynomial'
              ? `현재 ${degree}차 다항 모델`
              : `현재 ${kind === 'ridge' ? 'Ridge' : 'Lasso'} · α=${alpha.toFixed(2)}`
        }
      />
      <Plot
        points={data
          .filter((p) => test || p[2] === 'train')
          .map((p) => [p[0], p[1], p[2] === 'test' ? 1 : 0, p[2]])}
        lines={[{ points: line }]}
        segments={
          type === 'linear'
            ? train.map((p) => [
                [p[0], p[1]],
                [p[0], predict(p[0])],
              ])
            : []
        }
        domain={[
          [-1.1, 1.1],
          [-5, 5],
        ]}
        xLabel="입력 x · 합성 광고 특성"
        yLabel="정답 y · 합성 판매량"
      />
      <Legend
        items={[
          ['학습 표본', colors[0]],
          ['테스트 표본 (빈 원)', colors[1]],
          ['예측', '#153f36'],
        ]}
      />
      <Stats
        items={[
          ['학습 MSE', f(trainScore.mse)],
          ['테스트 MSE', f(testScore.mse)],
          ['테스트 R²', f(testScore.r2)],
        ]}
      />
      {type === 'linear' && <HistoryStrip values={history} label="실제 학습 MSE의 변화" />}
      {type === 'regularization' && (
        <div className="coefficients">
          <div className="small-title">
            표준화 다항 계수 · 0이 아닌 항 {fit.weights.filter((w) => Math.abs(w) > 1e-7).length}개
          </div>
          {fit.weights.map((w, i) => (
            <div key={i}>
              <span>
                x<sup>{i + 1}</sup>
              </span>
              <div className="bar-track">
                <i
                  style={{
                    width: `${Math.min(100, (Math.abs(w) / Math.max(...fit.weights.map(Math.abs), 0.01)) * 100)}%`,
                    background: w >= 0 ? colors[0] : colors[1],
                  }}
                />
              </div>
              <strong>{f(w)}</strong>
            </div>
          ))}
        </div>
      )}
      <div className="insight">
        {type === 'linear'
          ? `현재 예측식: ŷ = ${f(slope, 2)}x ${intercept >= 0 ? '+' : '−'} ${f(Math.abs(intercept), 2)}. 점과 선의 세로 차이가 잔차입니다.`
          : trainScore.mse < testScore.mse * 0.6
            ? '학습 오차와 테스트 오차의 차이가 큽니다. 차수나 규제를 바꾸어 일반화가 나아지는지 관찰하세요.'
            : '두 오차를 함께 읽으세요. 낮은 학습 오차만으로 최적 설정이라고 결정할 수는 없습니다.'}
      </div>
    </Frame>
  );
}
function DecisionLab({ type }) {
  const [depth, setDepth] = useState(3),
    [k, setK] = useState(5),
    [threshold, setThreshold] = useState(0.5),
    [nTrees, setTrees] = useState(7),
    [criterion, setCriterion] = useState('gini'),
    [query, setQuery] = useState([0.2, 0]),
    [tourStep, setTourStep] = useState(0);
  const data = useMemo(() => M.classificationData(), []),
    train = data.filter((p) => p[3] === 'train'),
    test = data.filter((p) => p[3] === 'test');
  const model = useMemo(
    () =>
      type === 'tree'
        ? (
            (t) => (p) =>
              M.treePredict(t, p)
          )(M.treeFit(train, depth, criterion))
        : type === 'forest'
          ? M.forestFit(train, depth, nTrees)
          : type === 'logistic'
            ? M.logisticFit(train)
            : (p) => M.knn(train, p, k).score,
    [type, depth, criterion, nTrees, k],
  );
  const boundary = useMemo(
    () =>
      Array.from({ length: 32 * 30 }, (_, i) => {
        const x = -3.5 + (i % 32) * 0.22,
          y = -3.3 + Math.floor(i / 32) * 0.22;
        return [x, y, +(model([x + 0.11, y + 0.11]) >= threshold), 0.22];
      }),
    [model, threshold],
  );
  const metrics = M.classificationMetrics(
    test.map((p) => p[2]),
    test.map((p) => +(model(p) >= threshold)),
  );
  const trainMetrics = M.classificationMetrics(
    train.map((p) => p[2]),
    train.map((p) => +(model(p) >= threshold)),
  );
  const neighbors = type === 'knn' ? M.knn(train, query, k) : null;
  const player = usePlayback(
    () => {
      if (type === 'knn') {
        if (tourStep >= 24) return false;
        const t = ((tourStep + 1) / 24) * Math.PI * 2;
        setQuery([+(Math.cos(t) * 2.3).toFixed(2), +(Math.sin(t) * 1.8).toFixed(2)]);
        setTourStep((v) => v + 1);
        return true;
      }
      if (type === 'logistic') {
        if (threshold >= 0.95) return false;
        setThreshold((v) => Math.min(0.95, +(v + 0.05).toFixed(2)));
        return true;
      }
      if (type === 'tree') {
        if (depth >= 7) return false;
        setDepth((v) => v + 1);
        return true;
      }
      if (nTrees >= 19) return false;
      setTrees((v) => v + 2);
      return true;
    },
    () => {
      setTourStep(0);
      if (type === 'knn') setQuery([2.3, 0]);
      else if (type === 'logistic') setThreshold(0.05);
      else if (type === 'tree') setDepth(1);
      else setTrees(1);
    },
    type === 'knn' ? 650 : 1100,
  );
  return (
    <Frame
      onInteract={player.pause}
      controls={
        <>
          {(type === 'tree' || type === 'forest') && (
            <Range label="최대 깊이" value={depth} onChange={setDepth} min={1} max={7} />
          )}{' '}
          {type === 'tree' && (
            <Select
              label="분할 기준"
              value={criterion}
              onChange={setCriterion}
              options={[
                ['gini', 'Gini'],
                ['entropy', 'Entropy'],
              ]}
            />
          )}{' '}
          {type === 'forest' && (
            <Range
              label="배깅 트리 수"
              value={nTrees}
              onChange={setTrees}
              min={1}
              max={19}
              step={2}
            />
          )}{' '}
          {type === 'knn' && (
            <>
              <Range label="이웃 수 k" value={k} onChange={setK} min={1} max={21} step={2} />
              <Range
                label="새 점 x"
                value={query[0]}
                onChange={(x) => setQuery([x, query[1]])}
                min={-3}
                max={3}
                step={0.1}
              />
              <Range
                label="새 점 y"
                value={query[1]}
                onChange={(y) => setQuery([query[0], y])}
                min={-3}
                max={3}
                step={0.1}
              />
            </>
          )}
          {type === 'logistic' && (
            <Range
              label="양성 임계값"
              value={threshold}
              onChange={setThreshold}
              min={0.05}
              max={0.95}
              step={0.05}
            />
          )}
          <div className="tiny-note">
            합성 표본 100개
            <br />
            훈련 80개 · 테스트 20개
            <br />
            색: 정답 0 / 정답 1<br />
            배경: 모델의 예측 범주
          </div>
        </>
      }
      note={
        type === 'knn'
          ? '차트 클릭 또는 새 점 슬라이더로 이웃을 확인하세요. 이웃은 학습 표본에서만 고릅니다.'
          : '모든 점수는 보류한 동일 테스트 표본으로 계산합니다. 실험으로 테스트를 반복 관찰하는 학습용 환경입니다.'
      }
    >
      <Playback
        player={player}
        title={
          type === 'knn'
            ? '새 점의 이웃 탐험'
            : type === 'logistic'
              ? '임계값 변화 관찰'
              : type === 'tree'
                ? '결정 트리 깊이 비교'
                : '트리 개수별 배깅 비교'
        }
        description={
          type === 'knn'
            ? '새 점이 이동하면 이웃과 예측이 달라집니다. 그래프를 직접 드래그해도 됩니다.'
            : type === 'logistic'
              ? '계수는 그대로 두고 임계값만 바꿉니다. 양성 예측과 precision·recall의 변화를 관찰하세요.'
              : '설정을 단계적으로 바꿔 다시 학습합니다. 영역이 복잡해질 때 학습·테스트 점수를 함께 살펴보세요.'
        }
        status={
          type === 'knn'
            ? `탐색 ${tourStep}/24 · 새 점 (${query[0]}, ${query[1]})`
            : type === 'logistic'
              ? `양성 판정 기준: 확률 ≥ ${threshold.toFixed(2)}`
              : type === 'tree'
                ? `최대 깊이 ${depth}`
                : `배깅 트리 ${nTrees}개`
        }
      />
      <Plot
        points={data}
        background={boundary}
        domain={[
          [-3.5, 3.5],
          [-3.3, 3.3],
        ]}
        query={type === 'knn' ? query : null}
        onPick={
          type === 'knn'
            ? (p) => {
                player.pause();
                setQuery(p.map((v) => +v.toFixed(2)));
              }
            : null
        }
        segments={neighbors ? neighbors.neighbors.map((v) => [query, v.p]) : []}
      />
      <Legend
        items={[
          ['정답 0', colors[0]],
          ['정답 1', colors[1]],
          ['테스트는 빈 원', '#c3c9c4'],
        ]}
      />
      <Stats
        items={[
          ['학습 정확도', f(trainMetrics.accuracy, 2)],
          ['테스트 정확도', f(metrics.accuracy, 2)],
          ['테스트 macro F1', f(metrics.macro, 2)],
        ]}
      />
      {type === 'logistic' && (
        <Stats
          items={[
            ['양성 precision', f(metrics.rows[1].precision, 2)],
            ['양성 recall', f(metrics.rows[1].recall, 2)],
            ['예측 양성', `${metrics.matrix[0][1] + metrics.matrix[1][1]} / 20`],
          ]}
        />
      )}
      <div className="insight">
        {neighbors
          ? `새 점의 예측: 클래스 ${neighbors.label}. 이웃 ${k}개 중 클래스 1 비율은 ${f(neighbors.score, 2)}입니다.`
          : type === 'tree'
            ? '축에 평행한 질문으로 공간을 나눕니다. 깊이를 늘렸을 때 작은 섬 같은 영역이 생기는지 살펴보세요.'
            : type === 'forest'
              ? '표본을 복원추출한 트리들의 확률 평균입니다. 실제 RandomForest의 특성 무작위 선택을 제외한 배깅 원리 실험입니다.'
              : '임계값만 바꿉니다. 학습된 로지스틱 모델의 계수와 각 표본의 확률은 그대로입니다.'}
      </div>
    </Frame>
  );
}
function ClusterLab({ type }) {
  const [dataset, setDataset] = useState(type === 'dbscan' ? 'moons' : 'blobs'),
    [k, setK] = useState(3),
    [eps, setEps] = useState(0.28),
    [minSamples, setMin] = useState(5),
    [iteration, setIteration] = useState(0),
    [seed, setSeed] = useState(type === 'kmeans' ? 65 : 42),
    [converged, setConverged] = useState(false),
    [history, setHistory] = useState([]),
    [trail, setTrail] = useState([]),
    [scan, setScan] = useState(0);
  const X = useMemo(() => M.clusterData(dataset), [dataset]);
  const [centers, setCenters] = useState(() => M.initialCenters(X, 3, seed));
  const reset = (nextX = X, nextK = k, nextSeed = seed) => {
    setCenters(M.initialCenters(nextX, nextK, nextSeed));
    setIteration(0);
    setConverged(false);
    setHistory([]);
    setTrail([]);
    setScan(0);
  };
  const result = useMemo(
    () =>
      type === 'dbscan'
        ? M.dbscan(X, eps, minSamples)
        : type === 'kchoice'
          ? M.kmeans(X, k, seed)
          : M.kmeansStep(X, centers),
    [X, k, seed, centers, eps, minSamples, type],
  );
  // The step preview assigns to current centers; it does not silently move displayed centers.
  const shownCenters = type === 'kmeans' ? centers : type === 'kchoice' ? result.centers : [];
  const mask = X.map((_, i) => i).filter((i) => result.labels[i] !== -1),
    labels = mask.map((i) => result.labels[i]),
    count = new Set(labels).size;
  const sil = M.silhouette(
      mask.map((i) => X[i]),
      labels,
    ),
    inertia = shownCenters.length
      ? M.sum(X.map((p, i) => M.distance2(p, shownCenters[result.labels[i]])))
      : null;
  const comparisons = useMemo(
    () =>
      type === 'kchoice'
        ? Array.from({ length: 5 }, (_, i) => {
            const n = i + 2,
              r = M.kmeans(X, n, seed);
            return { k: n, inertia: r.inertia, s: M.silhouette(X, r.labels).score };
          })
        : [],
    [X, seed, type],
  );
  const inertiaAt = (cs) => M.sum(X.map((p) => Math.min(...cs.map((c) => M.distance2(p, c)))));
  const advance = () => {
    if (type === 'dbscan') {
      if (scan >= X.length - 1) return false;
      setScan((v) => v + 1);
      return true;
    }
    if (type === 'kchoice') {
      if (k >= 6) return false;
      setK((v) => v + 1);
      return true;
    }
    const next = M.kmeansStep(X, centers).centers,
      change = M.sum(centers.map((c, i) => M.distance2(c, next[i])));
    if (change < 1e-12 || iteration >= 50) {
      setConverged(change < 1e-12);
      return false;
    }
    setTrail(centers);
    setCenters(next);
    setIteration((v) => v + 1);
    setHistory((h) => [
      ...(h.length ? h : [{ step: 0, value: inertiaAt(centers) }]),
      { step: iteration + 1, value: inertiaAt(next) },
    ]);
    return true;
  };
  const player = usePlayback(
    advance,
    () => {
      reset();
      if (type === 'kchoice') setK(2);
    },
    type === 'dbscan' ? 650 : 1100,
  );
  const scanNeighbors =
    type === 'dbscan'
      ? X.map((_, i) => i).filter((i) => M.distance2(X[scan], X[i]) <= eps ** 2)
      : [];
  const finish = () => {
    player.pause();
    let cs = centers,
      steps = iteration,
      records = history.length ? history : [{ step: 0, value: inertiaAt(centers) }];
    let settled = false;
    for (let i = 0; i < 50; i++) {
      const next = M.kmeansStep(X, cs).centers;
      if (M.sum(cs.map((c, j) => M.distance2(c, next[j]))) < 1e-12) {
        settled = true;
        break;
      }
      cs = next;
      steps++;
      records = [...records, { step: steps, value: inertiaAt(cs) }];
    }
    setTrail(centers);
    setCenters(cs);
    setIteration(steps);
    setHistory(records);
    setConverged(settled);
  };
  return (
    <Frame
      onInteract={player.pause}
      controls={
        <>
          <Select
            label="데이터 모양"
            value={dataset}
            onChange={(v) => {
              player.pause();
              setDataset(v);
              reset(M.clusterData(v));
            }}
            options={[
              ['blobs', '세 개의 덩어리'],
              ['moons', '두 개의 반달'],
              ['rings', '두 개의 고리'],
            ]}
          />
          {type === 'dbscan' ? (
            <>
              <Range
                label="이웃 반경 eps"
                value={eps}
                onChange={setEps}
                min={0.08}
                max={1.2}
                step={0.02}
              />
              <Range
                label="최소 표본 min_samples"
                value={minSamples}
                onChange={setMin}
                min={2}
                max={12}
              />
            </>
          ) : (
            <>
              <Range
                label="군집 수 k"
                value={k}
                onChange={(v) => {
                  setK(v);
                  reset(X, v);
                }}
                min={2}
                max={6}
              />
              {type === 'kmeans' && (
                <>
                  <button className="btn" onClick={finish}>
                    수렴 결과 보기
                  </button>
                  <div className="step-readout">
                    {converged ? `${iteration}회 갱신 후 수렴` : `${iteration}회 중심 갱신`}
                  </div>
                </>
              )}
              <button
                className="btn subtle"
                onClick={() => {
                  setSeed((s) => s + 1);
                  reset(X, k, seed + 1);
                }}
              >
                <RotateCcw size={14} /> 다른 초기 중심
              </button>
            </>
          )}
          <div className="tiny-note">
            색은 군집 번호입니다.
            <br />X 표시는 중심, 회색 ×는 잡음.
            <br />
            모든 입력은 2차원 합성 좌표입니다.
          </div>
        </>
      }
      note={
        type === 'dbscan'
          ? '실루엣은 잡음 제외 표본만 평가합니다. 점수가 높더라도 제외한 점이 많은지 함께 확인하세요.'
          : '초기화 한 번의 결과입니다. sklearn n_init=10과 동일한 절차를 재현한 것이 아닙니다.'
      }
    >
      <Playback
        player={player}
        title={
          type === 'kmeans'
            ? 'KMeans 중심 이동'
            : type === 'kchoice'
              ? '군집 수를 바꾸며 비교하기'
              : 'DBSCAN 이웃 탐험'
        }
        description={
          type === 'kmeans'
            ? '현재 중심에 할당한 뒤 각 그룹의 평균으로 중심을 옮깁니다. 실제 중심 갱신을 한 번씩 재생합니다.'
            : type === 'kchoice'
              ? '같은 데이터에 k=2~6을 적용합니다. 번호와 색보다 그룹 구성·관성·실루엣을 비교하세요.'
              : '완성된 군집 위에서 표본을 한 점씩 살펴봅니다. 원은 선택한 한 점의 eps 이웃이며, 군집 전체의 범위가 아닙니다. 군집 확장 순서를 재현하는 기능은 아닙니다.'
        }
        status={
          type === 'kmeans'
            ? `${iteration}회 중심 갱신${converged ? ' · 수렴 완료' : ''}`
            : type === 'kchoice'
              ? `현재 군집 수 k=${k}`
              : `${scan + 1}/${X.length}번 표본 · 이웃 ${scanNeighbors.length}개 (자신 포함) · ${result.core[scan] ? '핵심점' : '핵심점 아님'}`
        }
      />
      <Plot
        points={X.map((p, i) => [
          ...p,
          result.labels[i],
          null,
          type === 'dbscan' && result.core[i],
        ])}
        centers={shownCenters}
        segments={type === 'kmeans' ? trail.map((p, i) => [p, centers[i]]) : []}
        focus={
          type === 'dbscan'
            ? { center: X[scan], index: scan, radius: eps, neighbors: scanNeighbors }
            : null
        }
        onPick={
          type === 'dbscan'
            ? (p) => {
                player.pause();
                setScan(
                  X.map((row) => M.distance2(row, p)).reduce(
                    (a, d, i, arr) => (d < arr[a] ? i : a),
                    0,
                  ),
                );
              }
            : null
        }
        xLabel="특성 1"
        yLabel="특성 2"
      />
      <Stats
        items={[
          ['군집 수', count],
          type === 'dbscan' ? ['잡음 수', X.length - mask.length] : ['관성', f(inertia, 2)],
          ['평균 실루엣', f(sil.score)],
        ]}
      />
      {type === 'kmeans' && <HistoryStrip values={history} label="실제 갱신별 관성 변화" />}
      {type === 'dbscan' && (
        <div className="insight">
          평가 포함 {mask.length}/{X.length}개 · 핵심점 {result.core.filter(Boolean).length}개 ·
          경계점 {mask.filter((i) => !result.core[i]).length}개.{' '}
          {sil.score === null
            ? '유효 군집 수 조건을 만족하지 않아 실루엣을 계산할 수 없습니다.'
            : '핵심점 연결로 모양이 만들어집니다. 군집 전체가 eps 원 하나 안에 들어갈 필요는 없습니다.'}
        </div>
      )}
      {type === 'kchoice' && (
        <>
          <div className="comparison-bars">
            <h4>k별 관성 · 엘보우 관찰</h4>
            {comparisons.map((r) => (
              <button key={r.k} onClick={() => setK(r.k)} className={k === r.k ? 'selected' : ''}>
                <span>k={r.k}</span>
                <div className="bar-track">
                  <i style={{ width: `${(r.inertia / comparisons[0].inertia) * 100}%` }} />
                </div>
                <strong>{f(r.inertia, 1)}</strong>
              </button>
            ))}
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>군집 수</th>
                  <th>관성</th>
                  <th>평균 실루엣</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((r) => (
                  <tr key={r.k} className={k === r.k ? 'highlight-row' : ''}>
                    <td>{r.k}</td>
                    <td>{f(r.inertia, 2)}</td>
                    <td>{f(r.s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {type !== 'dbscan' && (
        <div className="cluster-counts">
          {Array.from({ length: k }, (_, i) => (
            <span key={i}>
              <i style={{ background: colors[i] }} />
              군집 {i} · {result.labels.filter((g) => g === i).length}개
            </span>
          ))}
        </div>
      )}
    </Frame>
  );
}
function HierarchyLab() {
  const [k, setK] = useState(3);
  const X = useMemo(() => M.clusterData().slice(0, 24), []),
    merges = useMemo(() => M.ward(X), [X]),
    labels = M.wardLabels(X, merges, k);
  const nodes = new Map(X.map((_, i) => [i, { id: i, ids: [i], height: 0 }]));
  merges.forEach((m) => nodes.set(m.id, m));
  const order = [];
  const walk = (id) => {
    const n = nodes.get(id);
    if (n.left === undefined) order.push(id);
    else {
      walk(n.left);
      walk(n.right);
    }
  };
  walk(merges.at(-1).id);
  const positions = new Map(order.map((id, i) => [id, 30 + i * 22.7]));
  merges.forEach((m) => positions.set(m.id, (positions.get(m.left) + positions.get(m.right)) / 2));
  const max = merges.at(-1).height;
  const yy = (h) => 205 - (h / max) * 180;
  const low = merges[X.length - k - 1]?.height || 0,
    high = merges[X.length - k]?.height || max,
    cut = (low + high) / 2;
  const player = usePlayback(
    () => {
      if (k <= 2) return false;
      setK((v) => v - 1);
      return true;
    },
    () => setK(6),
    1300,
  );
  const cutY = useTweenGeometry([yy(cut)], 650)[0];
  return (
    <Frame
      onInteract={player.pause}
      controls={
        <>
          <Range label="자를 군집 수 k" value={k} onChange={setK} min={2} max={6} />
          <div className="tiny-note">
            Ward 병합 · 표본 24개
            <br />
            모든 잎을 표시합니다.
            <br />
            색은 선택한 k에서의 그룹입니다.
          </div>
        </>
      }
      note="높이는 √(2 × Ward 병합 비용 증가). 이 실험은 2차원 합성 입력의 실제 병합 이력을 계산합니다."
    >
      <Playback
        player={player}
        title="덴드로그램 절단선 이동"
        description="같은 Ward 병합 이력에서 절단 높이를 바꿉니다. 더 높은 곳에서 자르면 어떤 그룹이 합쳐지는지 관찰하세요."
        status={`현재 ${k}개 군집 · 절단 높이 ${f(cut, 2)}`}
      />
      <svg
        viewBox="0 0 600 245"
        className="dendrogram"
        role="img"
        aria-label={`Ward 덴드로그램, ${k}개 군집으로 절단`}
      >
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1="25" x2="585" y1={yy(v * max)} y2={yy(v * max)} stroke="#e0e7df" />
            <text x="3" y={yy(v * max) + 4}>
              {f(v * max, 1)}
            </text>
          </g>
        ))}
        {merges.map((m) => (
          <path
            key={m.id}
            d={`M${positions.get(m.left)},${yy(nodes.get(m.left).height)} V${yy(m.height)} H${positions.get(m.right)} V${yy(nodes.get(m.right).height)}`}
            fill="none"
            stroke={
              new Set(m.ids.map((i) => labels[i])).size === 1 ? colors[labels[m.ids[0]]] : '#a6b4ad'
            }
            strokeWidth="1.7"
          />
        ))}
        <line x1="25" x2="585" y1={cutY} y2={cutY} stroke="#d08442" strokeDasharray="5 4" />
        <text x="580" y={cutY - 6} textAnchor="end" fill="#a76730">
          k={k} 절단
        </text>
        {order.map((i) => (
          <text key={i} x={positions.get(i)} y="225" textAnchor="middle" fill={colors[labels[i]]}>
            {i + 1}
          </text>
        ))}
      </svg>
      <Plot points={X.map((p, i) => [...p, labels[i]])} />
      <Stats
        items={[
          ['군집 수', k],
          ['절단 높이', f(cut, 2)],
          ['평균 실루엣', f(M.silhouette(X, labels).score)],
        ]}
      />
    </Frame>
  );
}
function PcaLab() {
  const [scaled, setScaled] = useState(true),
    [color, setColor] = useState('cluster'),
    [k, setK] = useState(3);
  const X = useMemo(() => (scaled ? M.standardize(iris.data).X : iris.data), [scaled]),
    pca = useMemo(() => M.pca2(X), [X]),
    km = useMemo(() => M.kmeans(X, k), [X, k]);
  return (
    <Frame
      controls={
        <>
          <Toggle label="네 특성 표준화" value={scaled} onChange={setScaled} />
          <Range label="KMeans 군집 수" value={k} onChange={setK} min={2} max={5} />
          <Select
            label="점의 색 기준"
            value={color}
            onChange={setColor}
            options={[
              ['cluster', 'KMeans 군집 번호'],
              ['target', '실제 품종 (사후 비교)'],
            ]}
          />
          <div className="tiny-note">
            실제 Iris 150개 · 특성 4개
            <br />
            4차원에서 학습 → 2차원 투영
            <br />
            품종 정답은 학습에 사용하지 않음
          </div>
        </>
      }
      note="PCA와 KMeans는 같은 전처리 입력을 사용합니다. 중심에는 학습된 PCA 변환만 적용합니다. 축의 부호는 구현에 따라 반대가 될 수 있습니다."
    >
      <Plot
        points={pca.points.map((p, i) => [
          ...p,
          color === 'cluster' ? km.labels[i] : iris.target[i],
        ])}
        centers={color === 'cluster' ? km.centers.map(pca.transform) : []}
        xLabel={`PC1 · ${(pca.ratios[0] * 100).toFixed(1)}%`}
        yLabel={`PC2 · ${(pca.ratios[1] * 100).toFixed(1)}%`}
      />
      <Legend
        items={
          color === 'target'
            ? iris.targetNames.map((v, i) => [v, colors[i]])
            : Array.from({ length: k }, (_, i) => [`군집 ${i}`, colors[i]])
        }
      />
      <Stats
        items={[
          ['두 축 설명분산', `${f(M.sum(pca.ratios) * 100, 1)}%`],
          ['원래 입력 차원', 4],
          ['그림 차원', 2],
        ]}
      />
      <div className="insight">
        {color === 'target'
          ? '같은 좌표에서 실제 품종으로 색만 바꿨습니다. 군집 번호와 품종 번호가 자동 대응하지 않습니다.'
          : '점과 중심에 같은 PCA 기준을 적용했습니다. 이 그림에서 보이지 않는 나머지 축의 정보도 군집 학습에는 사용했습니다.'}
      </div>
    </Frame>
  );
}
function MetricsLab() {
  const [tp, setTp] = useState(8),
    [fn, setFn] = useState(2),
    [fp, setFp] = useState(5),
    [tn, setTn] = useState(85);
  const y = [...Array(tp + fn).fill(1), ...Array(fp + tn).fill(0)],
    pred = [...Array(tp).fill(1), ...Array(fn).fill(0), ...Array(fp).fill(1), ...Array(tn).fill(0)],
    m = M.classificationMetrics(y, pred);
  return (
    <Frame
      controls={
        <>
          <Range label="TP · 양성을 맞힘" value={tp} onChange={setTp} min={0} max={30} />
          <Range label="FN · 양성을 놓침" value={fn} onChange={setFn} min={0} max={30} />
          <Range label="FP · 음성을 오탐" value={fp} onChange={setFp} min={0} max={30} />
          <Range label="TN · 음성을 맞힘" value={tn} onChange={setTn} min={1} max={100} />
          <button
            className="btn"
            onClick={() => {
              setTp(0);
              setFn(5);
              setFp(0);
              setTn(95);
            }}
          >
            95% 정확도의 함정
          </button>
        </>
      }
      note="분모가 0인 precision·recall·F1은 0으로 처리합니다. 양성은 클래스 1입니다."
    >
      <div className="matrix-label">
        혼동행렬 <span>행: 실제 / 열: 예측</span>
      </div>
      <div className="matrix">
        <div />
        <div>예측 0</div>
        <div>예측 1</div>
        <div>실제 0</div>
        <div className="correct-cell">
          <small>TN</small>
          <strong>{tn}</strong>
        </div>
        <div className="wrong-cell">
          <small>FP</small>
          <strong>{fp}</strong>
        </div>
        <div>실제 1</div>
        <div className="wrong-cell">
          <small>FN</small>
          <strong>{fn}</strong>
        </div>
        <div className="correct-cell">
          <small>TP</small>
          <strong>{tp}</strong>
        </div>
      </div>
      <Stats
        items={[
          ['정확도', f(m.accuracy, 2)],
          ['양성 precision', f(m.rows[1].precision, 2)],
          ['양성 recall', f(m.rows[1].recall, 2)],
        ]}
      />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>클래스</th>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1</th>
              <th>Support</th>
            </tr>
          </thead>
          <tbody>
            {m.rows.map((r) => (
              <tr key={r.c}>
                <td>{r.c}</td>
                <td>{f(r.precision, 2)}</td>
                <td>{f(r.recall, 2)}</td>
                <td>{f(r.f1, 2)}</td>
                <td>{r.support}</td>
              </tr>
            ))}
            <tr>
              <td>Macro F1</td>
              <td colSpan="4">{f(m.macro, 3)}</td>
            </tr>
            <tr>
              <td>Weighted F1</td>
              <td colSpan="4">{f(m.weighted, 3)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Frame>
  );
}
function SplitLab() {
  const [ratio, setRatio] = useState(20),
    [mode, setMode] = useState('random');
  const testSet = useMemo(() => {
    const a = Array.from({ length: 100 }, (_, i) => i);
    if (mode === 'random') {
      const r = M.rng(42);
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
    }
    return new Set(a.slice(100 - ratio));
  }, [ratio, mode]);
  return (
    <Frame
      controls={
        <>
          <Range
            label="테스트 비율"
            value={ratio}
            onChange={setRatio}
            min={10}
            max={40}
            suffix="%"
          />
          <Select
            label="분할 방법"
            value={mode}
            onChange={setMode}
            options={[
              ['random', '무작위 분할'],
              ['time', '시간 순 분할'],
            ]}
          />
          <div className="tiny-note">
            왼쪽 위부터 오른쪽 아래로
            <br />
            관측 순서가 흐릅니다.
          </div>
        </>
      }
    >
      <div className="split-heading">
        <span>과거</span>
        <span>최근 →</span>
      </div>
      <div className="sample-grid">
        {Array.from({ length: 100 }, (_, i) => (
          <span
            key={i}
            className={testSet.has(i) ? 'test-sample' : ''}
            title={`${i + 1}번 관측 · ${testSet.has(i) ? '테스트' : '학습'}`}
          >
            {i + 1}
          </span>
        ))}
      </div>
      <Legend
        items={[
          ['학습', colors[0]],
          ['테스트', colors[1]],
        ]}
      />
      <Stats
        items={[
          ['학습 표본', 100 - ratio],
          ['테스트 표본', ratio],
          ['학습에 정답 사용', '훈련만'],
        ]}
      />
      <div className="insight">
        {mode === 'time'
          ? '이후 관측을 평가용으로 남겼습니다. 실제 예측이 미래를 대상으로 한다면 이런 시간 관계를 반영하세요.'
          : '독립적인 표본을 가정한 무작위 분할입니다. 반복 관측·시간 의존성이 있으면 적절하지 않을 수 있습니다.'}
      </div>
    </Frame>
  );
}
function ScaleLab() {
  const [unit, setUnit] = useState(1),
    [scaled, setScaled] = useState(false);
  const base = [
      [1, 4],
      [2, 5],
      [4, 1],
      [5, 2],
      [3, 3],
    ],
    q = [3.8, 4.1],
    raw = base.map((p) => [p[0], p[1] * unit]),
    s = M.standardize(raw),
    X = scaled ? s.X : raw,
    Q = scaled ? s.transform([q[0], q[1] * unit]) : [q[0], q[1] * unit],
    near = X.map((p) => M.distance2(p, Q)).reduce((a, d, i, arr) => (d < arr[a] ? i : a), 0);
  return (
    <Frame
      controls={
        <>
          <Range label="두 번째 특성 단위 배수" value={unit} onChange={setUnit} min={1} max={100} />
          <Toggle label="학습 기준 표준화" value={scaled} onChange={setScaled} />
          <div className="tiny-note">
            원래 표본과 새 점은 고정.
            <br />두 번째 특성 단위만 바꿉니다.
            <br />새 점은 평균 계산에서 제외합니다.
          </div>
        </>
      }
      note="축은 각각 자동 조절됩니다. 그림상의 픽셀 거리가 아니라 실제 좌표의 유클리드 거리로 이웃을 고릅니다."
    >
      <Plot
        points={X.map((p, i) => [...p, i === near ? 1 : 0])}
        query={Q}
        segments={[[Q, X[near]]]}
        xLabel={scaled ? '특성 1 (표준화)' : '특성 1'}
        yLabel={scaled ? '특성 2 (표준화)' : `특성 2 (×${unit})`}
      />
      <Stats
        items={[
          ['가장 가까운 표본', `#${near + 1}`],
          ['최근접 거리', f(Math.sqrt(M.distance2(Q, X[near])), 2)],
          ['표준화', scaled ? '적용' : '미적용'],
        ]}
      />
      <div className="insight">
        {scaled
          ? '양의 단위 배수 변화는 표준화로 상쇄됩니다. 하지만 특성별 상대적 의미를 같게 볼지는 별도 판단입니다.'
          : '같은 값의 단위만 바꿔도 거리의 기준이 달라집니다. 가까운 표본이 바뀌는지 관찰하세요.'}
      </div>
    </Frame>
  );
}
function ValidationLab() {
  const [folds, setFolds] = useState(5),
    [candidates, setCandidates] = useState(3),
    [active, setActive] = useState(0);
  const data = useMemo(() => M.classificationData().filter((p) => p[3] === 'train'), []);
  const results = useMemo(
    () =>
      Array.from({ length: candidates }, (_, n) => {
        const k = n * 2 + 1;
        const groups = [0, 1].flatMap((c) =>
          data
            .map((p, i) => ({ p, i }))
            .filter((r) => r.p[2] === c)
            .map((r, j) => ({ ...r, fold: j % folds })),
        );
        const scores = Array.from({ length: folds }, (_, fold) => {
          const tr = groups.filter((g) => g.fold !== fold).map((g) => g.p),
            te = groups.filter((g) => g.fold === fold).map((g) => g.p);
          return M.mean(te.map((p) => +(M.knn(tr, p, k).label === p[2])));
        });
        return { k, scores, avg: M.mean(scores) };
      }),
    [folds, candidates],
  );
  const best = results.reduce((a, r) => (r.avg > a.avg ? r : a));
  return (
    <Frame
      controls={
        <>
          <Range
            label="fold 수"
            value={folds}
            onChange={(v) => {
              setFolds(v);
              setActive(0);
            }}
            min={2}
            max={5}
          />
          <Range label="k 후보 개수" value={candidates} onChange={setCandidates} min={2} max={6} />
          <button className="btn" onClick={() => setActive((i) => (i + 1) % folds)}>
            다음 검증 fold
          </button>
          <div className="tiny-note">
            합성 훈련 표본 80개에서
            <br />
            클래스 비율을 유지한 CV.
            <br />
            스케일이 비슷한 두 입력 사용.
          </div>
        </>
      }
    >
      <div className="fold-grid">
        {Array.from({ length: folds }, (_, i) => (
          <div key={i} className={i === active ? 'heldout' : ''}>
            <span>FOLD {i + 1}</span>
            <strong>{i === active ? '검증' : '학습'}</strong>
          </div>
        ))}
      </div>
      <Stats
        items={[
          ['검증 학습 횟수', folds * candidates],
          ['refit 포함', folds * candidates + 1],
          ['최적 후보', `k=${best.k}`],
        ]}
      />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>k</th>
              {Array.from({ length: folds }, (_, i) => (
                <th key={i}>Fold {i + 1}</th>
              ))}
              <th>평균 정확도</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.k} className={r.k === best.k ? 'highlight-row' : ''}>
                <td>{r.k}</td>
                {r.scores.map((v, i) => (
                  <td key={i}>{f(v, 2)}</td>
                ))}
                <td>{f(r.avg, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="insight">
        훈련 내부의 실제 KNN 교차검증 결과입니다. 평균이 같으면 먼저 비교한 후보를 선택합니다.
        보류한 테스트 표본은 선택에 사용하지 않습니다.
      </div>
    </Frame>
  );
}
function MultipleLab() {
  const [tv, setTv] = useState(100),
    [radio, setRadio] = useState(20),
    [paper, setPaper] = useState(15);
  const parts = [tv * 0.045, radio * 0.18, paper * 0.002],
    y = 3 + M.sum(parts);
  return (
    <Frame
      controls={
        <>
          <Range label="TV 광고비" value={tv} onChange={setTv} min={0} max={300} />
          <Range label="Radio 광고비" value={radio} onChange={setRadio} min={0} max={50} />
          <Range label="Newspaper 광고비" value={paper} onChange={setPaper} min={0} max={100} />
        </>
      }
      note="설명용 고정 계수: 절편 3, TV 0.045, Radio 0.18, Newspaper 0.002. 실제 광고 데이터에 학습한 계수가 아닙니다."
    >
      <div className="prediction-card">
        <span>모델의 예측 판매량</span>
        <strong>
          {f(y, 2)}
          <small>학습용 단위</small>
        </strong>
        <div className="formula-inline">
          3 + 0.045×{tv} + 0.18×{radio} + 0.002×{paper}
        </div>
      </div>
      <div className="contribution">
        {[
          ['절편', 3],
          ['TV', parts[0]],
          ['Radio', parts[1]],
          ['Newspaper', parts[2]],
        ].map(([t, v], i) => (
          <div key={t}>
            <span>{t}</span>
            <div className="bar-track">
              <i style={{ width: `${(v / 16) * 100}%`, background: colors[i] }} />
            </div>
            <strong>+{f(v, 2)}</strong>
          </div>
        ))}
      </div>
      <div className="insight">
        한 입력만 바꾸면 다른 항은 고정됩니다. 이 변화는 모형 안의 예측 변화이며 광고의 인과 효과를
        입증한 것은 아닙니다.
      </div>
    </Frame>
  );
}
function LogLab() {
  const [value, setValue] = useState(100),
    [logged, setLogged] = useState(false);
  const data = [0, 10, 50, 100, 500, 1000],
    limit = logged ? Math.log1p(1000) : 1000;
  return (
    <Frame
      controls={
        <>
          <Range
            label="원래 대여 수"
            value={value}
            onChange={setValue}
            min={0}
            max={1000}
            step={10}
          />
          <Toggle label="막대를 로그 척도로" value={logged} onChange={setLogged} />
        </>
      }
    >
      <div className="contribution">
        {data.map((v) => (
          <div key={v}>
            <span>{v}</span>
            <div className="bar-track">
              <i style={{ width: `${((logged ? Math.log1p(v) : v) / limit) * 100}%` }} />
            </div>
            <strong>{logged ? f(Math.log1p(v), 2) : v}</strong>
          </div>
        ))}
      </div>
      <Stats
        items={[
          ['원래 값', value],
          ['log1p', f(Math.log1p(value), 3)],
          ['expm1 역변환', f(Math.expm1(Math.log1p(value)), 0)],
        ]}
      />
      <div className="insight">
        큰 값 사이 차이가 압축됩니다. 원 단위로 평가할 때는 예측을 역변환해야 하며 로그 오차 개선이
        원 단위 RMSE 개선을 보장하지 않습니다.
      </div>
    </Frame>
  );
}
function ProblemLab() {
  const [choice, setChoice] = useState(0);
  const items = [
    ['회귀', '광고비 → 판매량', '정답: 연속적인 수량', 'RMSE · MAE · R²'],
    ['분류', '꽃 측정값 → 품종', '정답: 세 품종 중 하나', '정확도 · macro F1 · 혼동행렬'],
    ['군집', '타격 기록 → 비슷한 선수', '학습 정답 없음', '실루엣 · 구성 해석 · 안정성'],
  ];
  return (
    <Frame
      controls={
        <>
          {items.map((r, i) => (
            <button
              key={r[0]}
              className={`problem-option ${choice === i ? 'active' : ''}`}
              onClick={() => setChoice(i)}
            >
              <span>0{i + 1}</span>
              {r[0]}
            </button>
          ))}
        </>
      }
    >
      <div className="problem-flow">
        <span className="eyebrow">QUESTION → DATA → LEARNING</span>
        <h3>{items[choice][1]}</h3>
        <p>{items[choice][2]}</p>
        <div className="flow-nodes">
          <span>입력 X</span>
          <b>→</b>
          <span>{choice === 2 ? '유사성으로 묶기' : '정답 y로 학습'}</span>
          <b>→</b>
          <span>{choice === 2 ? '군집 번호' : '새 표본 예측'}</span>
        </div>
        <div className="insight">확인할 결과: {items[choice][3]}</div>
        <p className="muted">
          숫자로 저장됐다는 이유만으로 회귀가 되지는 않습니다. 0/1 취소 여부는 범주를 예측하는 분류
          문제입니다.
        </p>
      </div>
    </Frame>
  );
}
function ProfileLab() {
  const [ratio, setRatio] = useState(true);
  const names = ['지역 A', '지역 B', '지역 C', '지역 D', '지역 E', '지역 F'],
    counts = [
      [80, 10, 10],
      [800, 100, 100],
      [20, 70, 10],
      [200, 700, 100],
      [25, 15, 60],
      [250, 150, 600],
    ],
    X = ratio ? counts.map((r) => r.map((v) => v / M.sum(r))) : counts,
    km = M.kmeans(X, 3);
  return (
    <Frame
      controls={
        <>
          <Toggle label="개수 대신 업종 비율" value={ratio} onChange={setRatio} />
          <div className="tiny-note">
            A/B, C/D, E/F는 구성은 같고
            <br />
            규모만 10배 차이 납니다.
            <br />
            표준화 없이 KMeans k=3.
          </div>
        </>
      }
    >
      <Legend
        items={[
          ['음식', colors[0]],
          ['소매', colors[1]],
          ['서비스', colors[2]],
        ]}
      />
      <div className="profiles">
        {X.map((row, i) => (
          <div key={i}>
            <span>
              {names[i]}
              <small>군집 {km.labels[i]}</small>
            </span>
            <div className="stack">
              {row.map((v, j) => (
                <i
                  key={j}
                  style={{ width: `${(v / (ratio ? 1 : 1000)) * 100}%`, background: colors[j] }}
                  title={`${v}`}
                />
              ))}
            </div>
            <strong>{ratio ? '100%' : M.sum(row)}</strong>
          </div>
        ))}
      </div>
      <div className="insight">
        {ratio
          ? '같은 구성인 A/B, C/D, E/F가 각각 함께 묶이는지 확인하세요. 번호 자체는 순위가 아닙니다.'
          : '규모가 작은 A/C/E가 구성 차이보다 가까워질 수 있습니다. 질문이 구성인지 규모인지 먼저 정해야 합니다.'}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>지역</th>
              <th>음식</th>
              <th>소매</th>
              <th>서비스</th>
              <th>군집</th>
            </tr>
          </thead>
          <tbody>
            {X.map((r, i) => (
              <tr key={i}>
                <td>{names[i]}</td>
                {r.map((v, j) => (
                  <td key={j}>{ratio ? `${f(v * 100, 0)}%` : v}</td>
                ))}
                <td>{km.labels[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Frame>
  );
}
export default function Lab({ type }) {
  if (['selectors', 'http', 'dynamic', 'api', 'collection'].includes(type))
    return <CrawlLab type={type} />;
  if (['linear', 'polynomial', 'regularization'].includes(type)) return <CurveLab type={type} />;
  if (['tree', 'knn', 'logistic', 'forest'].includes(type)) return <DecisionLab type={type} />;
  if (['kmeans', 'kchoice', 'dbscan'].includes(type)) return <ClusterLab type={type} />;
  const labs = {
    hierarchy: HierarchyLab,
    pca: PcaLab,
    metrics: MetricsLab,
    split: SplitLab,
    scale: ScaleLab,
    validation: ValidationLab,
    multiple: MultipleLab,
    log: LogLab,
    problem: ProblemLab,
    profile: ProfileLab,
  };
  const Component = labs[type];
  return <Component />;
}
