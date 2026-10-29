import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Code2,
  Compass,
  Copy,
  Download,
  ExternalLink,
  FlaskConical,
  GitBranch,
  GraduationCap,
  LayoutGrid,
  Menu,
  Orbit,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
  AlertCircle,
  Globe2,
  RotateCcw,
} from 'lucide-react';
import { tracks, lessons, glossary, references } from './course.js';
import Lab from './Labs.jsx';
import exampleResults from './example-results.json';
import { interpretations } from './interpretations.js';

const KEY = 'ml-studio-progress-v1';
const icons = { Compass, TrendingUp, GitBranch, Orbit, Globe2 };
const tabs = [
  ['concept', '개념 이해', BookOpen],
  ['lab', '시뮬레이션', FlaskConical],
  ['code', 'Python 실습', Code2],
  ['quiz', '확인 퀴즈', Target],
];
const empty = () => ({ answers: {}, notes: {}, lastLesson: 'question' });
function readProgress() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s.answers === 'object' && s.answers !== null) return { ...empty(), ...s };
  } catch {}
  return empty();
}
function go(path) {
  window.location.hash = path;
}
function download(name, text, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function quizKey(lesson, i) {
  return `${lesson.id}:${i}`;
}
function finished(l, s) {
  return l.quiz.every((q, i) => s.answers[quizKey(l, i)]?.selected === q.answer);
}
function Icon({ track, ...props }) {
  const I = icons[tracks.find((t) => t.id === track)?.icon] || Compass;
  return <I {...props} />;
}
function Code({ code }) {
  const lesson = lessons.find((l) => l.code === code);
  return (
    <>
      <pre className="code-block" tabIndex="0">
        <code>
          {code.split('\n').map((line, i) => (
            <span className="code-line" key={i}>
              <span className="line-number" aria-hidden="true">
                {i + 1}
              </span>
              <span className={line.trim().startsWith('#') ? 'code-comment' : ''}>
                {line || ' '}
              </span>
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
      {lesson && (
        <section className="verified-output">
          <div className="output-heading">
            <CheckCircle2 size={17} />
            <h3>
              {exampleResults.outputs[lesson.id] ? '실제로 실행한 결과' : '실행 결과를 읽는 방법'}
            </h3>
          </div>
          {exampleResults.outputs[lesson.id] && (
            <>
              <p className="output-version">
                Python {exampleResults.python} · scikit-learn {exampleResults.sklearn} ·{' '}
                {exampleResults.date} 검증
              </p>
              <pre tabIndex="0">{exampleResults.outputs[lesson.id]}</pre>
            </>
          )}
          <div className="output-reading">
            <strong>이렇게 해석하세요</strong>
            <p>{interpretations[lesson.id]}</p>
          </div>
          <small>
            {exampleResults.outputs[lesson.id]
              ? '위 결과는 표시된 Python 코드의 실행 기록입니다. 실시간 브라우저 실험과 데이터·알고리즘이 다를 수 있고, 라이브러리 버전에 따라 수치·출력 형식이 조금 달라질 수 있습니다.'
              : '외부 사이트·Chrome이 필요한 코드입니다. 수집 건수와 내용은 실제 실행 시점과 사이트 상태에 따라 달라집니다.'}
          </small>
        </section>
      )}
    </>
  );
}
function Quiz({ lesson, state, update }) {
  const initial = () =>
    Object.fromEntries(lesson.quiz.map((_, i) => [i, state.answers[quizKey(lesson, i)]?.selected]));
  const [selected, setSelected] = useState(initial),
    [checked, setChecked] = useState(() =>
      Object.fromEntries(lesson.quiz.map((_, i) => [i, !!state.answers[quizKey(lesson, i)]])),
    );
  const score = lesson.quiz.filter((q, i) => checked[i] && selected[i] === q.answer).length;
  return (
    <div className="quiz-wrap">
      <div className="section-intro">
        <span className="eyebrow">CHECK YOUR UNDERSTANDING</span>
        <h2>이제, 내 말로 설명할 수 있나요?</h2>
        <p>정답을 고르고 이유까지 확인하세요. 다시 도전해도 괜찮습니다.</p>
      </div>
      <div className="quiz-progress">
        <span>이 단원에서 맞힌 문제</span>
        <strong>
          {score} <small>/ {lesson.quiz.length}</small>
        </strong>
      </div>
      {lesson.quiz.map((q, i) => {
        const isChecked = checked[i],
          correct = selected[i] === q.answer;
        return (
          <fieldset
            className={`quiz-card ${isChecked ? (correct ? 'is-correct' : 'is-wrong') : ''}`}
            key={i}
          >
            <legend>
              <span>QUESTION 0{i + 1}</span>
              {q.prompt}
            </legend>
            <div className="quiz-options">
              {q.options.map((o, j) => (
                <label
                  className={`quiz-option ${selected[i] === j ? 'selected' : ''} ${isChecked && j === q.answer ? 'correct-option' : ''}`}
                  key={j}
                >
                  <input
                    type="radio"
                    name={`${lesson.id}-${i}`}
                    checked={selected[i] === j}
                    onChange={() => {
                      setSelected((s) => ({ ...s, [i]: j }));
                      setChecked((s) => ({ ...s, [i]: false }));
                    }}
                  />
                  <span className="option-letter">{String.fromCharCode(65 + j)}</span>
                  <span>{o}</span>
                  {isChecked && j === q.answer && <Check size={18} />}
                </label>
              ))}
            </div>
            <button
              className="btn primary"
              disabled={selected[i] === undefined || isChecked}
              onClick={() => {
                setChecked((c) => ({ ...c, [i]: true }));
                update((s) => ({
                  ...s,
                  answers: {
                    ...s.answers,
                    [quizKey(lesson, i)]: { selected: selected[i], at: new Date().toISOString() },
                  },
                }));
              }}
            >
              답 확인하기 <ChevronRight size={15} />
            </button>
            {isChecked && (
              <div className={`answer-feedback ${correct ? 'good' : 'retry'}`} role="status">
                <strong>{correct ? '정확합니다.' : '이 부분을 다시 생각해 보세요.'}</strong>
                <p>{q.explanation}</p>
              </div>
            )}
          </fieldset>
        );
      })}
      {score === lesson.quiz.length && (
        <div className="completed-banner">
          <Trophy size={26} />
          <div>
            <strong>한 단원 더, 원리가 선명해졌습니다.</strong>
            <p>세 문제를 모두 맞혀 이 단원을 완료했습니다.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/'),
    [state, setState] = useState(readProgress),
    [mobile, setMobile] = useState(false),
    [query, setQuery] = useState(''),
    [toast, setToast] = useState('');
  const notify = (t) => {
    setToast(t);
    setTimeout(() => setToast(''), 2500);
  };
  useEffect(() => {
    const fn = () => {
      setRoute(window.location.hash.slice(1) || '/');
      setMobile(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      notify('브라우저 저장 공간을 사용할 수 없습니다.');
    }
  }, [state]);
  const parts = route.split('/'),
    lesson = parts[1] === 'lesson' ? lessons.find((l) => l.id === parts[2]) : null,
    tab = tabs.some((t) => t[0] === parts[3]) ? parts[3] : 'concept';
  useEffect(() => {
    document.title = lesson
      ? `${lesson.title} · ML Studio`
      : 'ML Studio · 손으로 이해하는 머신러닝';
    if (lesson) setState((s) => (s.lastLesson === lesson.id ? s : { ...s, lastLesson: lesson.id }));
  }, [lesson]);
  const completed = lessons.filter((l) => finished(l, state)).length,
    percent = Math.round((completed / lessons.length) * 100),
    answered = Object.keys(state.answers).length;
  const allQuestions = lessons.flatMap((l) =>
      l.quiz.map((q, i) => ({ lesson: l, q, i, a: state.answers[quizKey(l, i)] })),
    ),
    wrong = allQuestions.filter((r) => r.a && r.a.selected !== r.q.answer);
  const [filter, setFilter] = useState('all');
  const filtered = lessons.filter(
    (l) =>
      (filter === 'all' || l.track === filter) &&
      `${l.title} ${l.subtitle} ${l.steps.flat().join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      notify('코드를 복사했습니다.');
    } catch {
      notify('코드 영역을 선택해 복사해 주세요.');
    }
  };
  const navLesson = (l, t = 'concept') => go(`/lesson/${l.id}/${t}`);
  const lessonIndex = lesson ? lessons.indexOf(lesson) : 0;
  const reportText = () =>
    JSON.stringify(
      {
        app: 'ML Studio',
        exportedAt: new Date().toISOString(),
        completed: lessons.filter((l) => finished(l, state)).map((l) => l.title),
        ...state,
      },
      null,
      2,
    );

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        본문으로 이동
      </a>
      {mobile && (
        <button
          className="sidebar-overlay"
          aria-label="메뉴 닫기"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? 'open' : ''}`}>
        <a className="brand" href="#/">
          <span className="brand-mark">
            M<span>·</span>
          </span>
          <span>
            ML <b>Studio</b>
            <small>배우고, 실험하고, 이해하다</small>
          </span>
        </a>
        <button
          className="sidebar-close icon-btn"
          aria-label="메뉴 닫기"
          onClick={() => setMobile(false)}
        >
          <X />
        </button>
        <a className={`nav-home ${route === '/' ? 'active' : ''}`} href="#/">
          <LayoutGrid size={17} /> 학습 둘러보기
        </a>
        <div className="sidebar-label">YOUR LEARNING PATH</div>
        <nav aria-label="학습 단원">
          {tracks.map((t, index) => (
            <div className="nav-group" key={t.id}>
              <div className="nav-group-title">
                <Icon track={t.id} size={16} />
                <span>
                  {String(index + 1).padStart(2, '0')} {t.name}
                </span>
              </div>
              {lessons
                .filter((l) => l.track === t.id)
                .map((l) => (
                  <a
                    key={l.id}
                    className={`nav-lesson ${lesson?.id === l.id ? 'active' : ''}`}
                    href={`#/lesson/${l.id}/concept`}
                    title={l.title}
                  >
                    <span className="nav-status">
                      {finished(l, state) ? <CheckCircle2 size={14} /> : <Circle size={7} />}
                    </span>
                    <span>{l.title}</span>
                  </a>
                ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-tools">
          <a href="#/review">
            <Target size={16} /> 퀴즈 복습 {wrong.length > 0 && <b>{wrong.length}</b>}
          </a>
          <a href="#/glossary">
            <BookOpen size={16} /> 개념 사전·참고 자료
          </a>
          <a href="#/progress">
            <Trophy size={16} /> 나의 학습 기록
          </a>
        </div>
        <div className="sidebar-bottom">
          <span>오늘도 한 걸음씩.</span>
          <div>
            <i style={{ width: `${percent}%` }} />
          </div>
          <small>
            {completed} / {lessons.length} 단원 완료 <b>{percent}%</b>
          </small>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-btn menu-btn"
              aria-label="메뉴 열기"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <GraduationCap size={18} />
            <a href="#/">머신러닝 학습실</a>
            {lesson && (
              <>
                <ChevronRight size={14} />
                <span>{tracks.find((t) => t.id === lesson.track)?.name}</span>
              </>
            )}
          </div>
          <div className="topbar-right">
            <span className="course-tag">기초부터 실전까지</span>
            <a href="#/progress" className="top-progress">
              <span
                className="mini-ring"
                style={{ background: `conic-gradient(#278570 ${percent}%, #e3e9e3 0)` }}
              >
                <i />
              </span>
              <b>{percent}%</b>
            </a>
          </div>
        </header>
        <main id="main" tabIndex="-1">
          {route === '/' && (
            <div className="home-page">
              <section className="hero">
                <div className="hero-copy">
                  <span className="eyebrow">
                    <span /> THE INTERACTIVE ML CLASSROOM
                  </span>
                  <h1>
                    숫자를 움직이면,
                    <br />
                    원리가 보입니다<span>.</span>
                  </h1>
                  <p>
                    회귀, 분류, 군집. 그리고 데이터를 모으는 과정까지.
                    <br />
                    직접 바꾸고 관찰하며 머신러닝을 내 것으로 만드세요.
                  </p>
                  <div className="hero-actions">
                    <button
                      className="btn hero-btn"
                      onClick={() =>
                        navLesson(lessons.find((l) => l.id === state.lastLesson) || lessons[0])
                      }
                    >
                      {answered ? '이어서 학습하기' : '첫 실험 시작하기'}
                      <ArrowRight size={17} />
                    </button>
                    <span>
                      {lessons.length}개 단원 · {allQuestions.length}개 퀴즈
                    </span>
                  </div>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="hero-chart-label">
                    <span>FROM DATA TO UNDERSTANDING</span>
                    <i>LIVE</i>
                  </div>
                  <svg viewBox="0 0 350 225">
                    <defs>
                      <linearGradient id="heroGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor="#93d6b9" stopOpacity=".25" />
                        <stop offset="1" stopColor="#93d6b9" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[40, 85, 130, 175].map((y) => (
                      <line key={y} x1="15" y1={y} x2="335" y2={y} stroke="#ffffff" opacity=".1" />
                    ))}
                    <path
                      d="M20 180 Q75 170 100 130 T180 110 T260 55 T330 35 L330 210 L20 210Z"
                      fill="url(#heroGlow)"
                    />
                    <path
                      d="M20 180 Q75 170 100 130 T180 110 T260 55 T330 35"
                      fill="none"
                      stroke="#a7e8c5"
                      strokeWidth="3"
                    />
                    {Array.from({ length: 25 }, (_, i) => {
                      const x = 20 + i * 12.6,
                        y = 187 - i * 5.6 + Math.sin(i * 3.6) * 22;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r={i === 18 ? 6 : 3.5}
                          fill={i === 18 ? '#efba7a' : '#bce7d0'}
                          opacity={i === 18 ? 1 : 0.65}
                        />
                      );
                    })}
                    <circle cx="247" cy="74" r="16" fill="none" stroke="#efba7a" opacity=".3" />
                  </svg>
                  <div className="hero-chart-footer">
                    <span>
                      <i /> 작은 실험이 만드는 큰 이해
                    </span>
                    <span>y = f(X)</span>
                  </div>
                  <div className="floating-chip">
                    <Sparkles size={15} />
                    <span>외우는 공식에서, 이해하는 원리로</span>
                  </div>
                </div>
              </section>
              <div className="welcome-strip">
                <div>
                  <FlaskConical size={18} />
                  <span>슬라이더로 직접 실험</span>
                </div>
                <div>
                  <Code2 size={18} />
                  <span>수업과 연결되는 Python</span>
                </div>
                <div>
                  <Target size={18} />
                  <span>이유까지 알려주는 퀴즈</span>
                </div>
                <div>
                  <CheckCircle2 size={18} />
                  <span>내 브라우저에 진도 저장</span>
                </div>
              </div>
              <section className="learning-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">FIND YOUR STARTING POINT</span>
                    <h2>어떤 원리가 궁금한가요?</h2>
                  </div>
                  <span>작은 개념부터 차근차근</span>
                </div>
                <div className="track-cards">
                  {tracks
                    .filter((t) => t.id !== 'foundation')
                    .map((t, i) => (
                      <button
                        className={`track-card track-${t.id}`}
                        key={t.id}
                        onClick={() => {
                          setFilter(t.id);
                          document
                            .getElementById('curriculum')
                            ?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <div className="track-card-top">
                          <span>
                            {String(i + 1).padStart(2, '0')} / {t.en}
                          </span>
                          <Icon track={t.id} size={24} />
                        </div>
                        <h3>{t.name}</h3>
                        <p>{t.desc}</p>
                        <div>
                          <small>{lessons.filter((l) => l.track === t.id).length}개 단원</small>
                          <ArrowRight size={18} />
                        </div>
                      </button>
                    ))}
                </div>
              </section>
              <section className="learning-section" id="curriculum">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">YOUR LEARNING JOURNEY</span>
                    <h2>오늘의 발견을 시작해요</h2>
                  </div>
                  <label className="search-box">
                    <Search size={16} />
                    <input
                      aria-label="단원 검색"
                      placeholder="궁금한 개념 검색"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                      <button
                        className="icon-btn"
                        aria-label="검색 지우기"
                        onClick={() => setQuery('')}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </label>
                </div>
                <div className="filter-tabs">
                  <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                  >
                    전체 과정
                  </button>
                  {tracks.map((t) => (
                    <button
                      key={t.id}
                      className={filter === t.id ? 'active' : ''}
                      onClick={() => setFilter(t.id)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
                <div className="lesson-grid">
                  {filtered.map((l) => (
                    <button className="lesson-card" key={l.id} onClick={() => navLesson(l)}>
                      <div className="lesson-card-meta">
                        <span style={{ color: tracks.find((t) => t.id === l.track).color }}>
                          <Icon track={l.track} size={14} />
                          {tracks.find((t) => t.id === l.track).name}
                        </span>
                        <span>{l.time}분</span>
                      </div>
                      <h3>{l.title}</h3>
                      <p>{l.subtitle}</p>
                      <div className="lesson-card-bottom">
                        <span>
                          {finished(l, state) ? (
                            <>
                              <CheckCircle2 size={14} /> 학습 완료
                            </>
                          ) : (
                            <>
                              <FlaskConical size={14} /> 실험 + 퀴즈
                            </>
                          )}
                        </span>
                        <ChevronRight size={18} />
                      </div>
                    </button>
                  ))}
                </div>
                {!filtered.length && (
                  <div className="empty-state">검색 결과가 없습니다. 다른 단어로 찾아보세요.</div>
                )}
              </section>
              <section className="closing-note">
                <div className="note-icon">
                  <Compass size={24} />
                </div>
                <div>
                  <h3>처음이라면, 기초부터 함께.</h3>
                  <p>데이터 분할, 스케일링, 교차검증을 알면 모든 모델이 더 잘 보입니다.</p>
                </div>
                <button className="btn" onClick={() => navLesson(lessons[0])}>
                  기초 살펴보기 <ArrowRight size={16} />
                </button>
              </section>
            </div>
          )}
          {lesson && (
            <div className="lesson-page">
              <div className="lesson-heading">
                <div className="lesson-overline">
                  <span className={`track-pill pill-${lesson.track}`}>
                    <Icon track={lesson.track} size={14} />
                    {tracks.find((t) => t.id === lesson.track)?.name}
                  </span>
                  <span>LESSON {String(lessonIndex + 1).padStart(2, '0')}</span>
                  <span>약 {lesson.time}분</span>
                  {finished(lesson, state) && (
                    <span className="done-pill">
                      <CheckCircle2 size={14} /> 완료
                    </span>
                  )}
                </div>
                <h1>{lesson.title}</h1>
                <p>{lesson.subtitle}</p>
              </div>
              <div className="lesson-tabs" role="tablist" aria-label="학습 단계">
                {tabs.map(([id, label, I], i) => (
                  <button
                    key={id}
                    id={`tab-${id}`}
                    role="tab"
                    aria-selected={tab === id}
                    aria-controls="lesson-panel"
                    className={tab === id ? 'active' : ''}
                    onClick={() => navLesson(lesson, id)}
                  >
                    <I size={17} />
                    <span>{label}</span>
                    <small>0{i + 1}</small>
                  </button>
                ))}
              </div>
              <div
                id="lesson-panel"
                role="tabpanel"
                aria-labelledby={`tab-${tab}`}
                key={`${lesson.id}-${tab}`}
              >
                {tab === 'concept' && (
                  <>
                    <div className="lesson-mission">
                      <span>
                        <Target size={18} /> 이번 단원의 목표
                      </span>
                      <p>{lesson.mission}</p>
                    </div>
                    <div className="concept-steps">
                      {lesson.steps.map(([title, text, example], i) => (
                        <article className="concept-step" key={i}>
                          <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
                          <div>
                            <h2>{title}</h2>
                            <p>{text}</p>
                            <div className="example-box">
                              <span>예를 들면</span>
                              {example}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className="formula-card">
                      <span>한 줄로 기억하기</span>
                      <p>{lesson.formula}</p>
                    </div>
                    <div className="watchout">
                      <AlertCircle size={20} />
                      <div>
                        <strong>여기서 헷갈리지 마세요</strong>
                        <p>{lesson.watchout}</p>
                      </div>
                    </div>
                    <button
                      className="btn primary next-tab"
                      onClick={() => navLesson(lesson, 'lab')}
                    >
                      이제 직접 실험해 보기 <ArrowRight size={17} />
                    </button>
                  </>
                )}
                {tab === 'lab' && (
                  <>
                    <div className="section-intro">
                      <span className="eyebrow">LEARN BY DOING</span>
                      <h2>설정을 바꾸면, 무엇이 달라질까요?</h2>
                      <p>{lesson.mission}</p>
                    </div>
                    <Lab key={lesson.id} type={lesson.sim} />
                    <div className="observation">
                      <label htmlFor="observation">
                        <BookOpen size={17} /> 나의 관찰 노트
                      </label>
                      <p>무엇을 바꿨고, 무엇이 달라졌나요? 왜 그런지 한 문장으로 남겨 보세요.</p>
                      <textarea
                        id="observation"
                        placeholder="예: k를 늘리자 경계가 부드러워졌다. 더 많은 이웃의 투표를 반영하기 때문이다."
                        value={state.notes?.[lesson.id] || ''}
                        onChange={(e) =>
                          setState((s) => ({
                            ...s,
                            notes: { ...s.notes, [lesson.id]: e.target.value },
                          }))
                        }
                      />
                      <small>이 브라우저에 자동 저장됩니다.</small>
                    </div>
                    <button
                      className="btn primary next-tab"
                      onClick={() => navLesson(lesson, 'code')}
                    >
                      Python 코드로 연결하기 <ArrowRight size={17} />
                    </button>
                  </>
                )}
                {tab === 'code' && (
                  <>
                    <div className="section-intro">
                      <span className="eyebrow">CONNECT TO YOUR NOTEBOOK</span>
                      <h2>같은 원리를 Python으로</h2>
                      <p>
                        아래 코드는 앞쪽 단원을 실행하지 않아도 됩니다. 로컬 Jupyter·VS Code 또는
                        Colab에 복사해 실행하세요.
                      </p>
                    </div>
                    <div className="code-toolbar">
                      <span>
                        <span className="python-dot" /> Python · 독립 실행 예제
                      </span>
                      <div>
                        <button className="btn small" onClick={() => copy(lesson.code)}>
                          <Copy size={14} /> 복사
                        </button>
                        <button
                          className="btn small"
                          onClick={() => download(`ml_${lesson.id}.py`, lesson.code)}
                        >
                          <Download size={14} /> .py 저장
                        </button>
                      </div>
                    </div>
                    <Code code={lesson.code} />
                    <div className="setup-note">
                      <strong>실행 준비</strong>
                      <code>
                        pip install numpy pandas scikit-learn matplotlib scipy requests
                        beautifulsoup4 selenium xmltodict
                      </code>
                      <p>
                        웹 화면의 그래프는 JavaScript로 계산합니다. 이 코드는 브라우저에서 Python을
                        실행하는 기능이 아닙니다. 예제마다 사용하는 데이터와 전처리를 확인하세요.
                      </p>
                    </div>
                    <div className="source-note">
                      <BookOpen size={16} />
                      <div>
                        <strong>수업과 연결</strong>
                        <p>{lesson.source}</p>
                      </div>
                    </div>
                    <button
                      className="btn primary next-tab"
                      onClick={() => navLesson(lesson, 'quiz')}
                    >
                      퀴즈로 이해 확인하기 <ArrowRight size={17} />
                    </button>
                  </>
                )}
                {tab === 'quiz' && (
                  <Quiz key={lesson.id} lesson={lesson} state={state} update={setState} />
                )}
              </div>
              <nav className="lesson-pagination" aria-label="이전 다음 단원">
                {lessonIndex > 0 ? (
                  <button onClick={() => navLesson(lessons[lessonIndex - 1])}>
                    <ArrowLeft size={17} />
                    <span>
                      <small>이전 단원</small>
                      {lessons[lessonIndex - 1].title}
                    </span>
                  </button>
                ) : (
                  <span />
                )}
                {lessonIndex < lessons.length - 1 && (
                  <button onClick={() => navLesson(lessons[lessonIndex + 1])}>
                    <span>
                      <small>다음 단원</small>
                      {lessons[lessonIndex + 1].title}
                    </span>
                    <ArrowRight size={17} />
                  </button>
                )}
              </nav>
            </div>
          )}
          {parts[1] === 'review' && (
            <div className="utility-page">
              <span className="eyebrow">RETRIEVAL PRACTICE</span>
              <h1>다시 꺼내 보면, 더 오래 남아요.</h1>
              <p className="page-lead">
                틀린 문제를 돌아보고 이유를 설명해 보세요. 각 단원의 퀴즈는 언제든 다시 풀 수
                있습니다.
              </p>
              <div className="summary-cards">
                <div>
                  <span>전체 문제</span>
                  <strong>{allQuestions.length}</strong>
                </div>
                <div>
                  <span>풀어 본 문제</span>
                  <strong>{answered}</strong>
                </div>
                <div>
                  <span>다시 살펴볼 문제</span>
                  <strong>{wrong.length}</strong>
                </div>
              </div>
              <h2>나의 오답 노트</h2>
              {wrong.length ? (
                wrong.map(({ lesson: l, q, i }) => (
                  <div className="review-card" key={quizKey(l, i)}>
                    <span className="eyebrow">{l.title}</span>
                    <h3>{q.prompt}</h3>
                    <p>{q.explanation}</p>
                    <button className="btn" onClick={() => navLesson(l, 'quiz')}>
                      다시 풀기 <ArrowRight size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <CheckCircle2 size={30} />
                  <h3>{answered ? '현재 오답이 없습니다.' : '아직 퀴즈를 풀지 않았어요.'}</h3>
                  <p>아래에서 궁금한 단원을 골라 확인해 보세요.</p>
                </div>
              )}
              <h2>단원별 퀴즈 바로 가기</h2>
              <div className="review-links">
                {lessons.map((l) => (
                  <button key={l.id} onClick={() => navLesson(l, 'quiz')}>
                    <Icon track={l.track} size={18} />
                    <span>{l.title}</span>
                    <small>
                      {
                        l.quiz.filter((q, i) => state.answers[quizKey(l, i)]?.selected === q.answer)
                          .length
                      }
                      /{l.quiz.length}
                    </small>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {parts[1] === 'glossary' && (
            <div className="utility-page">
              <span className="eyebrow">THE CONCEPT COMPANION</span>
              <h1>낯선 단어도, 쉬운 말로.</h1>
              <p className="page-lead">개념을 다시 확인하고 연결된 실험으로 돌아가세요.</p>
              <div className="glossary-grid">
                {glossary.map(([name, description, id]) => (
                  <a className="glossary-card" href={`#/lesson/${id}/concept`} key={name}>
                    <h3>
                      {name}
                      <ArrowRight size={15} />
                    </h3>
                    <p>{description}</p>
                  </a>
                ))}
              </div>
              <h2>공식 문서로 더 깊이</h2>
              <div className="reference-links">
                {references.map(([title, url]) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    {title}
                    <ExternalLink size={15} />
                  </a>
                ))}
              </div>
              <div className="watchout">
                <BookOpen size={20} />
                <div>
                  <strong>데이터와 실험의 기준</strong>
                  <p>
                    Iris 실험은 scikit-learn의 실제 150개 표본을 사용합니다. 나머지 브라우저 실험의
                    합성 데이터와 고정 계수는 각 실험에 표시했습니다. 브라우저의 간단한 알고리즘과
                    Python 라이브러리는 초기화·최적화 방식이 달라 수치가 완전히 일치하지 않을 수
                    있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}
          {parts[1] === 'progress' && (
            <Progress
              state={state}
              setState={setState}
              completed={completed}
              answered={answered}
              wrong={wrong}
              reportText={reportText}
            />
          )}
          {route !== '/' && !lesson && !['review', 'glossary', 'progress'].includes(parts[1]) && (
            <div className="empty-state">
              <h1>단원을 찾을 수 없습니다.</h1>
              <a className="btn primary" href="#/">
                학습실로 돌아가기
              </a>
            </div>
          )}
        </main>
        <footer className="site-footer">
          <span>
            ML Studio <i>·</i> 생각하며 배우는 머신러닝
          </span>
          <span>개념 → 실험 → 코드 → 확인</span>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
function Progress({ state, setState, completed, answered, wrong, reportText }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="utility-page">
      <span className="eyebrow">SMALL STEPS, REAL PROGRESS</span>
      <h1>나의 학습 기록</h1>
      <p className="page-lead">
        퀴즈를 모두 맞히면 단원이 완료됩니다. 관찰한 내용을 다시 읽어 보면 배움의 흔적이 보입니다.
      </p>
      <div className="summary-cards">
        <div>
          <span>완료 단원</span>
          <strong>
            {completed}
            <small>/{lessons.length}</small>
          </strong>
        </div>
        <div>
          <span>풀어 본 문제</span>
          <strong>{answered}</strong>
        </div>
        <div>
          <span>정답인 문제</span>
          <strong>{answered - wrong.length}</strong>
        </div>
      </div>
      <div className="progress-tracks">
        {tracks.map((t) => {
          const ls = lessons.filter((l) => l.track === t.id),
            n = ls.filter((l) => finished(l, state)).length;
          return (
            <div key={t.id}>
              <span>
                <Icon track={t.id} size={18} />
                {t.name}
              </span>
              <div className="bar-track">
                <i style={{ width: `${(n / ls.length) * 100}%`, background: t.color }} />
              </div>
              <strong>
                {n}/{ls.length}
              </strong>
            </div>
          );
        })}
      </div>
      <h2>내가 남긴 관찰</h2>
      {Object.entries(state.notes || {})
        .filter(([, v]) => v.trim())
        .map(([id, note]) => (
          <div className="review-card" key={id}>
            <a href={`#/lesson/${id}/lab`}>
              <h3>{lessons.find((l) => l.id === id)?.title}</h3>
            </a>
            <p className="preserve-lines">{note}</p>
          </div>
        ))}
      {!Object.values(state.notes || {}).some((v) => v.trim()) && (
        <div className="empty-state">시뮬레이션 아래에 나의 관찰을 남겨 보세요.</div>
      )}
      <div className="record-actions">
        <button
          className="btn primary"
          onClick={() =>
            download('ml-studio-learning-record.json', reportText(), 'application/json')
          }
        >
          <Download size={16} /> 학습 기록 내보내기
        </button>
        <button className="btn" onClick={() => setConfirm(true)}>
          <RotateCcw size={15} /> 기록 초기화
        </button>
      </div>
      <p className="privacy-note">
        로그인 없이 사용합니다. 기록은 현재 브라우저에만 저장되며 기기 사이에 자동 동기화되지
        않습니다. 브라우저 데이터를 지우면 기록이 사라지므로 필요하면 내려받으세요. 교사에게 자동
        전송되지 않습니다.
      </p>
      {confirm && (
        <div className="modal-backdrop">
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
          >
            <h2 id="reset-title">학습 기록을 초기화할까요?</h2>
            <p>
              이 브라우저의 퀴즈 답안과 관찰 노트가 모두 지워집니다. 필요한 기록은 먼저 내보내세요.
            </p>
            <div>
              <button className="btn" autoFocus onClick={() => setConfirm(false)}>
                취소
              </button>
              <button
                className="btn danger"
                onClick={() => {
                  setState(empty());
                  setConfirm(false);
                }}
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
