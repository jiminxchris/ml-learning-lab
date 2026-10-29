import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';

function blend(from, to, t) {
  if (typeof to === 'number') return typeof from === 'number' ? from + (to - from) * t : to;
  if (Array.isArray(to))
    return to.length === from?.length ? to.map((v, i) => blend(from[i], v, t)) : to;
  if (to && typeof to === 'object')
    return Object.fromEntries(Object.entries(to).map(([k, v]) => [k, blend(from?.[k], v, t)]));
  return to;
}
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)'),
      change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  return reduced;
}
// Interpolate only display geometry; the model and metrics always use actual values.
export function useTweenGeometry(target, duration = 420) {
  const signature = JSON.stringify(target),
    [display, setDisplay] = useState(target),
    current = useRef(target),
    reduced = useReducedMotion();
  useEffect(() => {
    const end = JSON.parse(signature);
    if (JSON.stringify(current.current) === signature) return;
    if (reduced || !duration) {
      current.current = end;
      setDisplay(end);
      return;
    }
    const start = current.current,
      begin = performance.now();
    let frame;
    const draw = (now) => {
      const t = Math.min(1, (now - begin) / duration),
        ease = 1 - (1 - t) ** 3,
        value = blend(start, end, ease);
      current.current = value;
      setDisplay(value);
      if (t < 1) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [signature, duration, reduced]);
  return display;
}

export function usePlayback(onStep, onReset, delay = 900) {
  const [running, setRunning] = useState(false),
    [finished, setFinished] = useState(false),
    [speed, setSpeed] = useState(1);
  const latest = useRef({ onStep, onReset });
  latest.current = { onStep, onReset };
  const step = () => {
    if (latest.current.onStep() === false) {
      setRunning(false);
      setFinished(true);
    }
  };
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      if (document.hidden) {
        setRunning(false);
        return;
      }
      if (latest.current.onStep() === false) {
        setRunning(false);
        setFinished(true);
      }
    }, delay / speed);
    return () => clearInterval(timer);
  }, [running, speed, delay]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);
  return {
    running,
    finished,
    speed,
    setSpeed,
    step,
    pause: () => {
      setRunning(false);
      setFinished(false);
    },
    reset: () => {
      setRunning(false);
      setFinished(false);
      latest.current.onReset();
    },
    toggle: () => {
      if (finished) {
        latest.current.onReset();
        setFinished(false);
      }
      setRunning((v) => !v);
    },
  };
}

export function Playback({ player, title, status, description }) {
  return (
    <section className={`playback ${player.running ? 'is-playing' : ''}`} aria-label={title}>
      <div className="playback-heading">
        <span className="playback-dot" />
        <strong>{title}</strong>
        <span>{player.running ? '재생 중' : player.finished ? '완료' : '직접 실험'}</span>
      </div>
      <p>{description}</p>
      <div className="playback-buttons">
        <button
          className="btn primary"
          onClick={player.toggle}
          aria-label={player.running ? '일시정지' : '자동 재생'}
        >
          {player.running ? <Pause size={15} /> : <Play size={15} />}{' '}
          {player.running ? '일시정지' : player.finished ? '다시 재생' : '자동 재생'}
        </button>
        <button
          className="btn"
          aria-label="한 단계 진행"
          onClick={() => {
            player.pause();
            player.step();
          }}
          disabled={player.finished}
        >
          <SkipForward size={15} />
          <span>한 단계</span>
        </button>
        <button className="btn subtle" aria-label="처음부터" onClick={player.reset}>
          <RotateCcw size={15} />
          <span>처음부터</span>
        </button>
        <label>
          속도
          <select
            aria-label="재생 속도"
            value={player.speed}
            onChange={(e) => player.setSpeed(+e.target.value)}
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
          </select>
        </label>
      </div>
      <div className="playback-status" role="status">
        {status}
      </div>
    </section>
  );
}

export function HistoryStrip({ values, label }) {
  if (!values.length) return null;
  const max = Math.max(...values.map((p) => p.value), 0.001),
    points = values.map((p, i) => [
      35 + (i / Math.max(1, values.length - 1)) * 510,
      71 - (p.value / max) * 49,
    ]);
  return (
    <div className="history-strip">
      <div>
        <strong>{label}</strong>
        <span>
          {values[0].value.toFixed(3)} → {values.at(-1).value.toFixed(3)}
        </span>
      </div>
      <svg viewBox="0 0 580 92" role="img" aria-label={`${label}: 실제 단계별 기록`}>
        <line x1="35" x2="545" y1="73" y2="73" stroke="#dfe7d7" />
        <polyline
          points={points.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke="#398b6d"
          strokeWidth="2.5"
        />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#398b6d">
            <title>
              {values[i].step}단계 · {values[i].value.toFixed(4)}
            </title>
          </circle>
        ))}
        <text x="35" y="89">
          시작
        </text>
        <text x="545" y="89" textAnchor="end">
          {values.at(-1).step}단계
        </text>
      </svg>
    </div>
  );
}
