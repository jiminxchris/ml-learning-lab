# ML Studio · 손으로 이해하는 머신러닝

한국어 머신러닝 수업을 위한 독립형 학습 사이트입니다. 회귀·분류·군집·웹 크롤링을 **개념 → 시뮬레이션 → Python 코드와 실행 결과 → 퀴즈** 순서로 학습합니다.

- 학생용 사이트: https://ml-learning-lab-chrislin.vercel.app
- 소스: https://github.com/jiminxchris/ml-learning-lab
- 교사용 진행안: [public/classroom-guide.md](public/classroom-guide.md)
- 구현·검증 기준: [docs/implementation.md](docs/implementation.md)

## 학습 과정

| 영역 | 단원 수 | 주제 |
|---|---:|---|
| 기초 | 4 | 문제 정의, 데이터 분할·누출, 스케일링, 교차검증 |
| 회귀 | 5 | 최소제곱, 다중회귀, 다항회귀, Ridge·Lasso, 자전거·아파트 연결 |
| 분류 | 5 | 결정 트리, KNN, 로지스틱, 평가 지표, Pipeline·GridSearchCV |
| 군집 | 6 | KMeans, k 선택, Ward·덴드로그램, DBSCAN, PCA, 군집 해석 |
| 웹 크롤링 | 5 | CSS 선택자, HTTP, 정적·동적, JSON·XML API, 수집에서 모델까지 |

25개 단원에 75개 퀴즈와 해설이 있습니다. 퀴즈 세 문제를 모두 맞히면 해당 단원이 완료됩니다. 오답 복습, 관찰 노트, 코드 복사·다운로드, 기록 JSON 내보내기를 지원합니다. 모바일에서도 사용할 수 있습니다.

## 로컬 실행

Node.js 22 이상을 권장합니다.

```bash
npm ci
npm run dev
```

표시되는 로컬 주소로 접속합니다. 정적 배포 파일을 만들려면:

```bash
npm run build
npm run preview
```

## Python 실습

웹의 Python 탭은 코드와 검증 당시의 출력 기록을 보여줍니다. 브라우저 안에서 Python을 실행하지는 않습니다. 학생은 Jupyter·VS Code·Colab에서 예제를 실행합니다.

```bash
pip install numpy pandas scikit-learn matplotlib scipy requests beautifulsoup4 selenium xmltodict
```

오프라인 예제 23개는 Python 3.13.15·scikit-learn 1.9.1에서 독립 실행을 검증했습니다. HTTP·Selenium 예제 2개는 외부 사이트와 Chrome이 필요합니다. API 코드는 고정 XML로 연습하며 실제 서비스 요청은 별도 주석에 있습니다. API키와 실제 학생 개인정보는 이 프로젝트에 포함하지 않습니다.

## 진도 저장

`localStorage`의 `ml-studio-progress-v1` 키에 답안·노트·마지막 단원을 저장합니다. 서버 저장, 회원가입, 교사용 학생 성적 대시보드, 기기 간 자동 동기화는 없습니다. 브라우저 데이터를 지우면 기록이 없어집니다. 학생은 필요한 기록을 JSON으로 내려받아 보관할 수 있습니다.

## 수정할 파일

| 파일 | 역할 |
|---|---|
| `src/course.js` | 기초·회귀·분류·군집 설명, 코드, 퀴즈 |
| `src/crawling.js` | 웹 크롤링 설명, 코드, 퀴즈 |
| `src/Labs.jsx` | 머신러닝 실험 화면 |
| `src/CrawlLabs.jsx` | 선택자·동적 DOM·API·누출 실험 |
| `src/math.js` | 재현 가능한 교육용 수치 알고리즘 |
| `src/example-results.json` | Python 실제 실행 출력 기록 |
| `src/interpretations.js` | 실행 결과 해석 |
| `src/App.jsx` | 탐색·퀴즈·진도·노트 |
| `src/styles.css` | 반응형 디자인 |
| `src/reading.css` | 화면별 글자 크기와 읽기 간격 |

기존 수업의 노트북을 수정하거나 전체 업로드하지 않고 이 프로젝트만 별도 저장소로 관리합니다.

## 검증

```bash
npm test
node tests/export-code.mjs
python -X utf8 tests/python-smoke.py
```

Python 검증 스크립트는 Python 3.13을 요구하고 23개 오프라인 예제의 실행 결과를 갱신합니다. 임시 작업 폴더에서 실행하므로 수업 폴더에 CSV를 만들지 않습니다. 외부 사이트 검증은 별도 명령입니다.

```bash
python -X utf8 tests/live-python.py
```

로컬 서버가 열린 상태에서 실제 Chrome으로 100개 탭 화면·모바일·퀴즈·진도 저장을 확인합니다.

```bash
node tests/browser-check.mjs
```

검증 스크린샷과 임시 파일은 `.qa/`에 저장하며 Git에 포함하지 않습니다. Chrome이 필요합니다. 수학 테스트는 손으로 확인 가능한 예제와 scikit-learn PCA 참조값을 사용합니다.

## 게시

Vercel 프로젝트 `chrislin-projects/ml-learning-lab`은 GitHub 저장소에 연결되어 있습니다. `main` 브랜치 변경은 Vercel에서 빌드·게시합니다. Framework는 Vite, 빌드는 `npm run build`, 출력은 `dist`입니다.

수동 배포가 필요한 경우:

```bash
npx vercel --prod
```

API키는 프런트엔드에 넣지 않습니다. 실제 데이터 수집은 학생의 로컬 Python에서 수행하고, 웹사이트는 준비된 예시로 구조와 원리를 실험합니다.
