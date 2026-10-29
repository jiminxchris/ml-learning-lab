import { crawlingLessons } from './crawling.js';
export const tracks = [
  {
    id: 'foundation',
    name: '머신러닝의 기초',
    en: 'FOUNDATIONS',
    color: '#60796f',
    desc: '좋은 질문에서 시작하는 데이터와 검증',
    icon: 'Compass',
  },
  {
    id: 'regression',
    name: '회귀',
    en: 'REGRESSION',
    color: '#26836d',
    desc: '숫자를 예측하고, 오차를 줄이는 방법',
    icon: 'TrendingUp',
  },
  {
    id: 'classification',
    name: '분류',
    en: 'CLASSIFICATION',
    color: '#cc8242',
    desc: '경계를 만들고, 판단의 품질을 평가하기',
    icon: 'GitBranch',
  },
  {
    id: 'clustering',
    name: '군집',
    en: 'CLUSTERING',
    color: '#647ab5',
    desc: '정답 없이 데이터 속 구조를 발견하기',
    icon: 'Orbit',
  },
  {
    id: 'scraping',
    name: '웹 크롤링',
    en: 'WEB SCRAPING',
    color: '#94884a',
    desc: '데이터를 모으고 모델로 연결하기',
    icon: 'Globe2',
  },
];
const q = (prompt, options, answer, explanation) => ({ prompt, options, answer, explanation });
const regBase = `import numpy as np\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import mean_squared_error, r2_score\n\nrng = np.random.default_rng(42)\nX = rng.uniform(-1, 1, (100, 1))\ny = 2 * X[:, 0] + np.sin(4 * X[:, 0]) + rng.normal(0, 0.3, 100)\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.25, random_state=42\n)\n`;
const irisBase = `from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import classification_report\n\niris = load_iris()\nX_train, X_test, y_train, y_test = train_test_split(\n    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target\n)\n`;
const clusterBase = `from sklearn.datasets import load_iris\nfrom sklearn.preprocessing import StandardScaler\nimport pandas as pd\n\niris = load_iris()\nX = StandardScaler().fit_transform(iris.data)\n`;
export const lessons = [
  {
    id: 'question',
    track: 'foundation',
    title: '무엇을 예측하고 싶은가요?',
    subtitle: '회귀·분류·군집을 구별하는 가장 쉬운 출발점',
    sim: 'problem',
    time: 12,
    level: '시작',
    source: '01_회귀_광고.ipynb · 03_붓꽃품종예측.ipynb · 05_군집_붓꽃20261023.ipynb',
    steps: [
      [
        '먼저, 질문을 한 문장으로',
        '광고비로 판매량을 예측한다. 꽃의 길이로 품종을 구분한다. 비슷한 타격 기록을 가진 선수를 묶는다. 세 질문은 모두 데이터를 사용하지만 정답의 모습과 학습 목적이 다릅니다. 알고리즘 이름보다 먼저 무엇을 알고 싶은지 정하세요.',
        '한 행은 꽃 한 송이, 입력은 네 측정값, 정답은 품종입니다.',
      ],
      [
        '정답이 숫자인가, 범주인가',
        '판매량·대여 수·거래금액처럼 연속적인 크기를 예측하면 회귀입니다. 취소 여부·품종처럼 정해진 범주를 선택하면 분류입니다. 0과 1로 저장됐어도 취소 여부는 수량이 아닌 범주입니다. 저장 형식만으로 문제를 판단하지 마세요.',
        '취소=1, 유지=0 → 분류 / 대여 수=120대 → 회귀',
      ],
      [
        '정답 없이 구조를 찾는다면',
        '군집은 정답 라벨을 주지 않고 비슷한 입력을 묶습니다. 0번 군집이 가장 좋은 그룹이라는 뜻은 없습니다. 학습 후 그룹별 평균과 대표 사례를 보고 사람이 의미를 해석합니다.',
        '같은 상권 유형 → 업종 비율의 유사성, 매출 성공의 증거는 아님',
      ],
      [
        '예측과 원인은 다릅니다',
        'TV 광고비와 판매량이 함께 증가해도 광고만이 원인이라고 확정할 수 없습니다. 계절, 시장 규모, 다른 매체의 광고가 함께 바뀌었을 수 있습니다. 모델은 관측한 패턴을 이용하며 인과적 효과는 별도 연구 설계가 필요합니다.',
        '예측에 유용하다 ≠ 원인을 입증했다',
      ],
    ],
    formula: '입력 X → 학습한 규칙 → 예측 ŷ',
    watchout: '군집 번호와 분류 정답 번호는 같은 숫자여도 역할이 다릅니다.',
    mission:
      '세 문제 카드를 바꿔 보세요. 정답의 형태와 평가 기준을 먼저 말한 뒤 알고리즘을 선택하세요.',
    code: irisBase + `print('입력 모양:', X_train.shape)\nprint('정답 이름:', iris.target_names)\n`,
    quiz: [
      q(
        '아파트 거래금액을 예측하는 문제는?',
        ['회귀', '분류', '군집'],
        0,
        '연속적인 금액을 예측하므로 회귀입니다. 실제 신고 거래금액을 정답으로 비교할 수 있습니다.',
      ),
      q(
        '군집 번호 2가 의미하는 것은?',
        ['0번보다 성능이 좋은 그룹', '다른 그룹과 구분하는 이름표', '세 번째 품종이라는 정답'],
        1,
        '군집 번호는 임의의 이름표입니다. 실제 품종 라벨과 자동 대응하지 않습니다.',
      ),
      q(
        '취소 여부가 0/1이면 회귀인가요?',
        ['숫자이므로 회귀', '목적이 범주 판별이므로 분류', '정답이 없으므로 군집'],
        1,
        '저장된 숫자보다 의미가 중요합니다. 취소 여부는 두 범주 중 하나를 예측합니다.',
      ),
    ],
  },
  {
    id: 'split',
    track: 'foundation',
    title: '시험지를 미리 보면 안 되는 이유',
    subtitle: '학습·검증·테스트와 데이터 누출',
    sim: 'split',
    time: 15,
    level: '핵심',
    source: '02_회귀_자전거대여수요예측_로그변환없음.ipynb · 04_분류_호텔예약취소예측.ipynb',
    steps: [
      [
        '학습과 시험의 역할',
        '모델은 학습 데이터에서 규칙을 찾습니다. 같은 데이터로만 평가하면 외운 결과를 실력으로 착각할 수 있습니다. 테스트 데이터는 새 표본을 얼마나 잘 예측하는지 알아보는 마지막 시험입니다.',
        'fit(X_train, y_train) → predict(X_test)',
      ],
      [
        '검증으로 선택하고, 테스트로 평가',
        '차수·깊이·k·alpha 같은 설정은 훈련 내부 검증 점수로 선택합니다. 테스트 성능을 보고 설정을 계속 바꾸면 테스트도 선택에 사용한 데이터가 됩니다. 마지막 시험은 모델 선택을 마친 뒤 확인하세요.',
        '훈련 80% 안에서 교차검증 → 최종 학습 → 보류한 20% 평가',
      ],
      [
        '전처리도 학습입니다',
        '평균·표준편차·중앙값·관측한 범주는 데이터에서 배운 정보입니다. 스케일러와 결측 대체를 전체 데이터에 fit하면 검증 부분의 정보를 미리 사용하게 됩니다. Pipeline은 fold마다 전처리를 다시 학습하도록 도와줍니다.',
        'scaler.fit(X_train), scaler.transform(X_test)',
      ],
      [
        '분할은 사용 상황을 닮아야 합니다',
        '독립적인 꽃 표본은 층화 무작위 분할을 사용할 수 있습니다. 미래 거래·예약을 예측한다면 과거로 학습하고 이후로 검증하는 편이 실제 사용에 가깝습니다. 같은 사람·단지의 반복 관측은 그룹 분할도 검토합니다.',
        '호텔: 과거 예약 → 이후 예약 / 같은 고객의 중복 여부 확인',
      ],
    ],
    formula: '훈련: 규칙 학습 / 검증: 설정 선택 / 테스트: 마지막 평가',
    watchout:
      '자전거의 casual + registered는 count입니다. 이 두 열을 count 예측 입력에 넣으면 정답을 사실상 알려줍니다.',
    mission:
      '테스트 비율을 바꾸고 무작위/시간 순 분할을 비교하세요. 어떤 미래를 평가하려는지 설명해 보세요.',
    code:
      irisBase +
      `print('학습:', len(X_train), '테스트:', len(X_test))\nprint('테스트 품종별 수:', __import__('numpy').bincount(y_test))\n`,
    quiz: [
      q(
        'StandardScaler의 fit은 어디에 하나요?',
        ['전체 데이터', '학습 데이터', '테스트 데이터'],
        1,
        '평균과 표준편차를 학습 데이터에서 계산하고 테스트에는 같은 변환을 적용합니다.',
      ),
      q(
        '미래 아파트 가격 평가에 더 가까운 분할은?',
        ['미래로 학습하고 과거 평가', '과거로 학습하고 이후 평가', '가격순 정렬 후 분할'],
        1,
        '예측할 시점에 아직 알 수 없는 미래 거래를 학습에 섞지 않는 시간 순 평가가 목적에 맞습니다.',
      ),
      q(
        '테스트 점수를 보고 alpha를 30번 바꾸면?',
        [
          '테스트도 모델 선택에 사용된다',
          '테스트는 여전히 완전히 독립적이다',
          '규제를 쓰니 괜찮다',
        ],
        0,
        '평가 결과가 의사결정에 반영되어 테스트에 맞춰지므로 별도의 최종 평가가 필요해집니다.',
      ),
    ],
  },
  {
    id: 'scale',
    track: 'foundation',
    title: '스케일링은 정보를 지울까요?',
    subtitle: '평균 0, 표준편차 1이 바꾸는 거리의 기준',
    sim: 'scale',
    time: 18,
    level: '핵심',
    source: '01_회귀_광고_상세설명.md · 05_군집_붓꽃_상세설명.md',
    steps: [
      [
        '큰 숫자가 거리를 지배합니다',
        '거리 기반 알고리즘은 특성 차이를 함께 더합니다. 연봉이 만 단위이고 나이가 십 단위라면 연봉 차이가 거리를 거의 결정할 수 있습니다. 단위를 원에서 천 원으로 바꾸기만 해도 군집이 바뀔 수 있습니다.',
        '(나이 차이)² + (연봉 차이)²',
      ],
      [
        '표준화는 좌표 기준을 바꿉니다',
        '각 값에서 학습 평균을 빼고 학습 표준편차로 나눕니다. 평균보다 얼마나 높은지, 낮은지를 표준편차 단위로 표현합니다. 원래 값의 순서나 상대적인 높고 낮음이 사라지는 것은 아닙니다.',
        'TV 광고비가 평균보다 2 표준편차 높다',
      ],
      [
        '모든 모델의 의무는 아닙니다',
        'KNN·SVM·KMeans·Ward·DBSCAN은 척도가 거리에 반영됩니다. Ridge/Lasso는 계수 크기를 규제하므로 척도를 맞추는 것이 중요합니다. 절편이 있는 무규제 최소제곱 회귀는 일반적으로 스케일 변화에 계수가 대응합니다. 트리는 보통 표준화가 필요하지 않습니다.',
        '다중회귀이기 때문에 무조건 표준화 → 잘못된 일반화',
      ],
      [
        '원래 크기의 의미도 고려하세요',
        '업종 비율처럼 같은 단위로 구성한 특성에 표준화를 적용하면 희귀하고 분산이 작은 업종의 영향이 커질 수 있습니다. 거리에서 무엇을 중요하게 볼지에 따라 결정하세요. 표준화는 이상치를 제거하는 작업도 아닙니다.',
        '같은 단위라도 분산은 다를 수 있고, 표준화가 항상 정답은 아닙니다.',
      ],
    ],
    formula: 'z = (x − 학습 평균 μ) / 학습 표준편차 σ',
    watchout:
      '테스트와 새 입력에 fit_transform을 다시 적용하면 기준이 달라집니다. transform을 사용하세요.',
    mission:
      '두 번째 특성의 단위를 100배로 바꿔 보세요. 표준화 전후 가까운 이웃이 어떻게 바뀌는지 확인하세요.',
    code:
      irisBase +
      `from sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\ntrain_scaled = scaler.fit_transform(X_train)\ntest_scaled = scaler.transform(X_test)\nprint(train_scaled.mean(axis=0).round(3))\nprint(test_scaled.shape)\n`,
    quiz: [
      q(
        '표준화를 하면 TV 지출 정보가 사라지나요?',
        ['예, 모두 0이 된다', '아니요, 표현 단위가 바뀐다', '정답까지 자동 표준화된다'],
        1,
        '각 표본의 상대적 차이는 유지됩니다. 평균이 0인 것은 모든 표본 값이 0이라는 뜻이 아닙니다.',
      ),
      q(
        '다중 LinearRegression에 표준화는?',
        ['항상 필수', '불가능', '목적과 수치 조건에 따라 선택'],
        2,
        '규제 없는 회귀의 필수 조건은 아닙니다. 규제·거리·수치 안정성·해석 목적을 구분합니다.',
      ),
      q(
        '새 입력에는 무엇을 쓰나요?',
        ['기존 scaler.transform', '새 scaler.fit_transform', '기존 scaler.fit'],
        0,
        '학습 때의 기준을 그대로 적용해야 모델이 같은 단위의 입력을 받습니다.',
      ),
    ],
  },
  {
    id: 'validation',
    track: 'foundation',
    title: '교차검증은 왜 여러 번 학습할까요?',
    subtitle: '한 번의 운 좋은 분할을 넘어 설정 선택하기',
    sim: 'validation',
    time: 18,
    level: '확장',
    source: '03_붓꽃품종예측_상세설명.md · 04_RocketLaunch_분할후원핫인코딩.ipynb',
    steps: [
      [
        '한 번의 점수에는 운이 섞입니다',
        '작은 붓꽃 데이터에서 어떤 꽃을 테스트로 뽑았는지에 따라 결과가 달라집니다. 교차검증은 훈련 데이터를 여러 조각으로 나누고, 한 조각씩 검증 역할을 바꿔 평균과 변동을 봅니다.',
        '5-fold: 4조각 학습 + 1조각 검증을 다섯 번',
      ],
      [
        'GridSearchCV의 계산량',
        '후보가 6개이고 fold가 5개면 30번의 검증 학습이 필요합니다. refit=True이면 최적 후보를 전체 훈련 데이터로 한 번 더 학습합니다. 테스트는 이 과정에 들어가지 않습니다.',
        '후보 수 × fold 수 + 최적 설정 재학습',
      ],
      [
        '여러 지표를 함께 읽기',
        'cross_val_score는 한 scoring을 평가합니다. cross_validate는 scoring 딕셔너리로 여러 지표를 같은 fold 학습에서 계산할 수 있습니다. GridSearchCV도 여러 지표를 쓰면 어떤 지표로 최적 모델을 고를지 refit에 이름을 지정합니다.',
        'scoring={"accuracy":"accuracy", "f1_macro":"f1_macro"}',
      ],
      [
        '파이프라인과 함께',
        '각 fold의 학습 조각에서 스케일링·인코딩을 fit해야 합니다. Pipeline을 GridSearchCV에 전달하고 model__n_neighbors처럼 단계 이름으로 설정을 지정합니다. 클래스 비율 유지에는 StratifiedKFold, 시간 흐름에는 시간 기반 분할을 고려합니다.',
        'scoring 생략 시 분류기의 기본 score는 보통 정확도',
      ],
    ],
    formula: 'CV 평균 = 각 검증 fold 점수의 합 / fold 수',
    watchout: 'GridSearchCV의 best_score_는 테스트 점수가 아니라 훈련 내부 교차검증 점수입니다.',
    mission:
      'fold와 후보 수를 움직여 학습 횟수를 계산하세요. 많은 조합보다 적절한 검증 설계가 먼저입니다.',
    code:
      irisBase +
      `from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.model_selection import GridSearchCV, StratifiedKFold\n\npipeline = Pipeline([('scale', StandardScaler()), ('model', KNeighborsClassifier())])\ncv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\nsearch = GridSearchCV(pipeline, {'model__n_neighbors': [3, 5, 7]},\n                      cv=cv, scoring='f1_macro')\nsearch.fit(X_train, y_train)\nprint(search.best_params_, search.best_score_)\nprint(classification_report(y_test, search.predict(X_test)))\n`,
    quiz: [
      q(
        '후보 6개, 5-fold, refit=True이면 총 학습 횟수는?',
        ['6번', '30번', '31번'],
        2,
        '검증을 위한 30번에 최적 후보 전체 훈련 재학습 1번을 더합니다.',
      ),
      q(
        'best_score_는 무엇인가요?',
        ['테스트 정확도', '최적 후보의 평균 CV 점수', '항상 학습 정확도'],
        1,
        '지정한 scoring 기준의 훈련 내부 교차검증 평균입니다.',
      ),
      q(
        'scoring 딕셔너리의 왼쪽 키는?',
        ['결과를 식별할 이름', '같은 모델을 두 번 학습하라는 지시', '입력 열 이름'],
        0,
        '오른쪽 값이 평가 방식이고 왼쪽 키는 결과와 refit 기준을 식별하는 이름입니다.',
      ),
    ],
  },
  {
    id: 'linear',
    track: 'regression',
    title: '점들 사이에 가장 좋은 선 긋기',
    subtitle: '광고비와 판매량으로 이해하는 최소제곱 회귀',
    sim: 'linear',
    time: 20,
    level: '핵심',
    source: '01_회귀_광고.ipynb',
    steps: [
      [
        '기울기와 절편',
        '기울기는 입력이 한 단위 증가할 때 예측이 얼마나 변하는지 나타냅니다. 절편은 입력 0일 때 예측값입니다. 데이터 범위 바깥의 0이 현실적으로 의미 있는지는 별도 판단이 필요합니다.',
        '예측 판매량 = 기울기 × 광고비 + 절편',
      ],
      [
        '잔차가 작아지는 방향',
        '잔차는 실제값에서 예측값을 뺀 차이입니다. 양수면 모델이 작게 예측했고 음수면 크게 예측했습니다. 잔차를 그냥 합하면 양수·음수가 상쇄되므로 제곱한 뒤 합하거나 평균을 냅니다.',
        '실제 12, 예측 10 → 잔차 2, 제곱오차 4',
      ],
      [
        '최소제곱이 하는 일',
        'LinearRegression은 잔차 제곱합을 작게 하는 계수를 찾습니다. 브라우저의 최적 선 버튼은 현재 학습점으로 단순 회귀의 최소제곱 해를 계산합니다. 기울기와 절편을 직접 움직이며 왜 그 선이 선택되는지 관찰하세요.',
        '이상치 한 점은 큰 제곱오차를 만들어 선을 강하게 당길 수 있습니다.',
      ],
      [
        '지표의 단위와 기준',
        'MSE는 오차의 제곱 단위, RMSE는 원래 정답 단위입니다. MAE는 절댓값 평균입니다. R²는 같은 평가 정답의 평균으로 예측한 기준에 비해 오차가 얼마나 줄었는지 나타내며 음수가 될 수도 있습니다.',
        'R²=0.8은 예측 80%가 정확하다는 뜻이 아닙니다.',
      ],
    ],
    formula: 'ŷ = wx + b    ·    MSE = 평균[(y − ŷ)²]',
    watchout:
      '실제값과 예측값을 같은 표본 순서로 비교해야 합니다. y_test와 학습 입력 예측을 섞지 마세요.',
    mission:
      '기울기와 절편을 조절해 MSE를 낮춘 뒤 최적 선과 비교하세요. 이상치를 추가하면 어느 방향으로 움직이나요?',
    code:
      regBase +
      `from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\npred = model.predict(X_test)\nprint('MSE:', mean_squared_error(y_test, pred))\nprint('R2:', r2_score(y_test, pred))\nprint('새 값 예측:', model.predict([[0.5]]))\n`,
    quiz: [
      q(
        '잔차가 +3이면?',
        ['실제보다 3 크게 예측', '실제보다 3 작게 예측', '항상 정확한 예측'],
        1,
        '잔차=y−예측이므로 실제값이 예측보다 3 큽니다.',
      ),
      q(
        'R²가 음수가 될 수 있나요?',
        ['가능하다', '불가능하다', '규제를 쓰면 불가능하다'],
        0,
        '평가 정답의 평균으로 예측한 기준보다 제곱오차가 크면 음수가 됩니다.',
      ),
      q(
        '하나의 특성에 값 100을 넣으려면?',
        ['predict([100])', 'predict([[100]])', 'predict(100)'],
        1,
        'sklearn의 일반적인 입력은 표본 수 × 특성 수인 2차원 배열입니다.',
      ),
    ],
  },
  {
    id: 'multiple',
    track: 'regression',
    title: '입력이 여러 개면 무엇이 달라질까요?',
    subtitle: '다중회귀의 계수와 원핫인코딩',
    sim: 'multiple',
    time: 18,
    level: '핵심',
    source: '01_회귀_광고.ipynb · 02_회귀_자전거대여수요예측_로그변환없음.ipynb',
    steps: [
      [
        '각 입력의 항을 더합니다',
        'TV·Radio·Newspaper를 함께 쓰면 각 입력에 계수를 곱해 더합니다. TV 계수는 다른 입력이 고정된 모형 안에서 TV가 변할 때 예측이 얼마나 변하는지를 나타냅니다. 관측한 상관을 원인으로 단정하지 않습니다.',
        'ŷ = b + w₁TV + w₂Radio + w₃Newspaper',
      ],
      [
        '단위가 다른 계수 비교',
        '광고비를 달러에서 천 달러로 바꾸면 계수도 바뀝니다. 숫자가 큰 계수가 무조건 더 중요한 특성은 아닙니다. 표준화 계수는 입력이 1 표준편차 변할 때 예측의 변화를 뜻합니다.',
        '입력 사이 상관이 높으면 계수 추정이 불안정해질 수 있습니다.',
      ],
      [
        '범주를 숫자로만 바꾸면',
        '맑음=0, 흐림=1, 비=2를 그냥 넣은 선형 모델은 일정한 간격과 방향을 가정합니다. 원핫인코딩은 범주마다 별도 열을 만들어 서로 다른 효과를 표현합니다. holiday처럼 이미 0/1인 열은 그대로 쓸 수 있습니다.',
        '시간 23과 0은 숫자상 멀지만 실제로는 이웃 시간입니다.',
      ],
      [
        '열 순서와 미지 범주',
        '테스트에도 학습과 같은 열 순서가 필요합니다. 분할 후 get_dummies를 각각 했다면 reindex로 맞춥니다. 학습에 없던 범주를 자동으로 이해하는 것은 아니므로 미지 범주 처리 방식을 정해야 합니다.',
        'OneHotEncoder(handle_unknown="ignore")',
      ],
    ],
    formula: 'ŷ = b + w₁x₁ + w₂x₂ + … + wₚxₚ',
    watchout:
      '입력 수가 많아진 것과 다항 차수가 높아진 것은 다릅니다. 다중회귀에도 규제를 적용할 수 있습니다.',
    mission:
      'TV와 Radio 값을 바꾸고 각 항의 기여를 비교하세요. 이 실험의 계수는 설명용 고정 계수라는 점도 확인하세요.',
    code: `import pandas as pd\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import OneHotEncoder\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.pipeline import Pipeline\n\nX = pd.DataFrame({'TV': [10, 30, 50, 70, 90, 110],\n                  'weather': ['sun', 'rain', 'sun', 'rain', 'sun', 'rain']})\ny = [5, 6, 9, 10, 13, 14]\npre = ColumnTransformer([('cat', OneHotEncoder(handle_unknown='ignore'), ['weather'])],\n                        remainder='passthrough')\nmodel = Pipeline([('pre', pre), ('model', LinearRegression())])\nmodel.fit(X, y)\nprint(model.predict(pd.DataFrame({'TV': [60], 'weather': ['sun']})))\n# 문법 이해용 작은 데이터입니다. 실제 성능은 별도 테스트로 평가하세요.\n`,
    quiz: [
      q(
        '표준화 계수 4는 입력이 어떻게 변할 때의 효과인가요?',
        ['원래 단위 4 증가', '입력 1 표준편차 증가', '항상 입력 1달러 증가'],
        1,
        '표준화 입력의 한 단위는 학습 데이터의 표준편차 한 개입니다.',
      ),
      q(
        'holiday가 0/1이면?',
        ['반드시 원핫 열 2개로 늘린다', '그대로 입력할 수 있다', '삭제해야 한다'],
        1,
        '이미 이진 지시변수 역할을 하므로 그대로 사용할 수 있습니다.',
      ),
      q(
        '학습에 없는 범주를 ignore하면?',
        [
          '새 범주의 효과도 학습된다',
          '해당 범주 블록을 0으로 표현한다',
          '항상 가장 흔한 범주로 이름을 바꾼다',
        ],
        1,
        '오류를 피하는 방법이지 새로운 범주의 효과를 학습하는 방법은 아닙니다.',
      ),
    ],
  },
  {
    id: 'polynomial',
    track: 'regression',
    title: '곡선이 복잡할수록 더 좋을까요?',
    subtitle: '다항 특성과 과소적합·과적합',
    sim: 'polynomial',
    time: 20,
    level: '핵심',
    source: '01_회귀_광고.ipynb',
    steps: [
      [
        '입력을 확장하면 곡선을 표현합니다',
        'PolynomialFeatures는 x², x³, x₁x₂ 같은 항을 만듭니다. 이 새로운 항들에 선형 회귀를 적용하면 원래 x에 대해서는 곡선이 됩니다. 계수에 대해 선형인 모델이라는 점은 유지됩니다.',
        '1, x, x² → b + w₁x + w₂x²',
      ],
      [
        '너무 단순하면 놓칩니다',
        '곡선 관계에 직선만 쓰면 학습과 테스트 모두 오차가 큽니다. 이를 과소적합이라고 합니다. 입력 표현을 늘리면 모델이 실제 관계를 따라갈 수 있습니다.',
        '모델의 표현 능력과 데이터 관계가 맞는가?',
      ],
      [
        '너무 복잡하면 잡음까지 외웁니다',
        '높은 차수는 적은 학습점을 지나가도록 크게 휘어질 수 있습니다. 학습 오차가 줄어도 새로운 점에서는 오차가 커질 수 있습니다. 테스트 점을 숨기고 어떤 곡선이 좋을지 예측한 뒤 확인해 보세요.',
        '좋은 학습 점수만으로 좋은 일반화를 보장하지 않습니다.',
      ],
      [
        '전처리 순서의 이유',
        '다항 확장 후 각 항의 크기가 크게 달라집니다. 규제 모델 앞에서 생성한 항을 표준화하면 패널티를 비교하기 쉬워집니다. 매우 큰 입력은 확장 전 스케일도 수치 안정성에 영향을 주므로 목적에 맞춰 설계합니다.',
        'PolynomialFeatures → StandardScaler → Ridge',
      ],
    ],
    formula: 'ŷ = b + w₁x + w₂x² + … + wₙxⁿ',
    watchout:
      '시뮬레이션의 오차는 고정된 합성 학습·테스트 분할에서 계산합니다. 차수가 오를 때 테스트 오차가 항상 단조 증가하는 것은 아닙니다.',
    mission:
      '차수 1, 3, 9를 비교하고 학습 오차와 테스트 오차를 함께 기록하세요. 점들 사이보다 범위 끝에서 무엇이 일어나나요?',
    code:
      regBase +
      `from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import PolynomialFeatures, StandardScaler\nfrom sklearn.linear_model import LinearRegression\n\nmodel = make_pipeline(PolynomialFeatures(5, include_bias=False),\n                      StandardScaler(), LinearRegression())\nmodel.fit(X_train, y_train)\nfor name, X_part, y_part in [('train', X_train, y_train), ('test', X_test, y_test)]:\n    print(name, mean_squared_error(y_part, model.predict(X_part)))\n`,
    quiz: [
      q(
        'PolynomialFeatures가 하는 일은?',
        ['곡선 이미지를 그린다', '제곱·곱 등 입력 항을 만든다', '정답을 로그 변환한다'],
        1,
        '특성 변환 도구입니다. 그 뒤 모델을 학습해야 예측 곡선이 만들어집니다.',
      ),
      q(
        '학습 MSE는 감소하고 테스트 MSE는 증가한다면?',
        ['과적합 신호', '항상 개선', '표준화가 반드시 실패'],
        0,
        '훈련 자료에만 더 잘 맞고 새 표본에 대한 일반화는 나빠지는 신호입니다.',
      ),
      q(
        '다항회귀는 계수에 대해 선형인가요?',
        ['예', '아니요', '차수 2에서만'],
        0,
        '입력은 비선형 변환하지만 변환한 특성과 계수의 선형 결합으로 예측합니다.',
      ),
    ],
  },
  {
    id: 'regularization',
    track: 'regression',
    title: '리지와 라쏘로 복잡함에 제동 걸기',
    subtitle: 'alpha를 움직이며 계수와 오차를 함께 보기',
    sim: 'regularization',
    time: 22,
    level: '확장',
    source: '01_회귀_광고_상세설명.md',
    steps: [
      [
        '오차만 줄이면 생기는 문제',
        '상관된 특성과 높은 차수에서 계수들이 크게 양수·음수로 흔들리며 서로 상쇄할 수 있습니다. 규제는 오차를 줄이는 목표에 계수가 너무 커지지 않게 하는 비용을 더합니다.',
        '설명력이 조금 줄어도 새로운 데이터에 더 안정적일 수 있습니다.',
      ],
      [
        'Ridge와 Lasso',
        'Ridge는 계수 제곱합, Lasso는 절댓값 합에 패널티를 줍니다. Ridge는 보통 계수를 연속적으로 축소하고 Lasso는 일부를 정확히 0으로 만들 수 있습니다. 특성 선택 결과도 데이터 분할과 상관 구조에 따라 바뀔 수 있습니다.',
        '0이 아닌 계수 수를 같이 보세요.',
      ],
      [
        'alpha의 균형',
        'alpha가 작으면 데이터 적합을 더 중시하고, 크면 계수 억제를 더 중시합니다. 너무 크면 필요한 패턴도 억제해 과소적합합니다. 정답 alpha는 데이터와 손실 정의에 따라 달라지므로 교차검증으로 선택합니다.',
        '훈련 오차만 보고 alpha를 고르지 않습니다.',
      ],
      [
        '규제와 스케일을 연결하기',
        '특성 단위가 크면 같은 예측 변화에 작은 계수가 필요해 패널티가 덜 부과될 수 있습니다. 표준화는 이런 단위 차이를 줄입니다. 특정 특성의 규제를 완화하는 것은 중요도를 몇 배로 확정하는 것과 다릅니다.',
        '실험은 MSE + α·패널티를 최소화합니다. sklearn Ridge의 alpha 숫자와 직접 같지 않습니다.',
      ],
    ],
    formula: 'Ridge: MSE + αΣw²    /    Lasso: MSE + αΣ|w|',
    watchout:
      '시뮬레이션은 표준화한 다항 항에 좌표하강법을 적용합니다. sklearn과 목적함수의 정규화·수렴 기준이 달라 같은 alpha가 같은 계수를 보장하지 않습니다.',
    mission:
      '차수를 9로 고정하고 alpha를 0 → 0.1 → 1로 올리세요. 계수 수와 테스트 오차를 비교한 뒤 Ridge와 Lasso를 바꿔 보세요.',
    code:
      regBase +
      `from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import PolynomialFeatures, StandardScaler\nfrom sklearn.linear_model import Ridge, Lasso\n\nfor name, estimator in [('Ridge', Ridge(alpha=1)),\n                        ('Lasso', Lasso(alpha=0.03, max_iter=10000))]:\n    model = make_pipeline(PolynomialFeatures(9, include_bias=False),\n                          StandardScaler(), estimator)\n    model.fit(X_train, y_train)\n    print(name, mean_squared_error(y_test, model.predict(X_test)))\n    print('계수:', estimator.coef_)\n`,
    quiz: [
      q(
        'Lasso의 특징은?',
        ['일부 계수가 0이 될 수 있다', '항상 모든 계수가 커진다', '입력을 자동 원핫인코딩한다'],
        0,
        'L1 패널티는 일부 계수를 정확히 0으로 만들 수 있습니다.',
      ),
      q(
        'alpha가 너무 크면?',
        ['항상 최고 성능', '필요한 패턴까지 억제할 수 있다', '테스트 정답을 학습한다'],
        1,
        '규제가 지나치면 과소적합할 수 있습니다.',
      ),
      q(
        '표준화했으면 규제를 꼭 해야 하나요?',
        ['예', '아니요', '분류에서만 예'],
        1,
        '표준화와 규제는 목적이 다른 선택입니다. 실험과 평가 목적에 맞춰 사용합니다.',
      ),
    ],
  },
  {
    id: 'projects',
    track: 'regression',
    title: '자전거와 아파트, 실제 문제로 연결하기',
    subtitle: '특성 만들기·로그 변환·원 단위 평가',
    sim: 'log',
    time: 18,
    level: '실습 연결',
    source:
      '02_회귀_자전거대여수요예측_로그변환없음.ipynb · 07_웹크롤링_아파트실거래가_수집과회귀.ipynb',
    steps: [
      [
        '날짜는 그대로 숫자가 아닙니다',
        'datetime을 날짜형으로 바꾼 뒤 month, dayofweek, hour를 꺼내면 계절·요일·시간대 패턴을 표현할 수 있습니다. 정답을 알려주는 casual·registered는 입력에서 제외합니다.',
        '한 행: 한 시간의 대여 기록 / 정답: count',
      ],
      [
        'log1p를 쓰는 이유',
        '큰 값이 긴 꼬리를 만드는 경우 log(1+y)는 큰 값 사이 차이를 압축합니다. 큰 절대 오차에 끌려가는 정도가 달라지고 상대적 차이를 반영할 수 있습니다. 반드시 좋아지는 변환은 아니며 수업의 로그 없는 버전으로 먼저 익힐 수 있습니다.',
        'log1p(0)=0, 역변환은 expm1',
      ],
      [
        '평가 단위를 맞춥니다',
        '로그 예측을 원래 대여 수로 평가하려면 expm1로 되돌립니다. 로그 공간 오차와 대여 수 단위 RMSE를 섞지 않습니다. 선형 모델은 음수 수요를 예측할 수 있고, 역변환도 모든 문제를 해결하지 않습니다.',
        '원 단위 RMSE와 로그 오차는 다른 질문입니다.',
      ],
      [
        '아파트는 시간과 신고 상태',
        '거래금액은 만원 단위이고 한 행은 매물이나 단지가 아니라 신고 거래입니다. 해제 거래를 정리하고 면적·층·건물 나이를 만듭니다. 여러 달을 모아 과거로 학습하고 이후를 평가합니다.',
        '단일 월 조회를 미래 가격 보장으로 해석하지 않습니다.',
      ],
    ],
    formula: 'z = log(1 + y)    ↔    y = exp(z) − 1',
    watchout: '입력에 정답의 구성 요소나 예측 시점에 알 수 없는 사후 정보를 넣지 마세요.',
    mission:
      '작은 수와 큰 수가 로그 축에서 얼마나 다르게 압축되는지 관찰하세요. 원래 값으로 돌아오는지도 확인하세요.',
    code: `import numpy as np\nimport pandas as pd\n\ndf = pd.DataFrame({'datetime': ['2026-01-01 08:00', '2026-01-03 18:00'],\n                   'count': [10, 1000]})\ndf['datetime'] = pd.to_datetime(df['datetime'])\ndf['month'] = df['datetime'].dt.month\ndf['dayofweek'] = df['datetime'].dt.dayofweek\ndf['hour'] = df['datetime'].dt.hour\ndf['log_count'] = np.log1p(df['count'])\ndf['restored'] = np.expm1(df['log_count'])\nprint(df)\n`,
    quiz: [
      q(
        'casual + registered = count일 때 두 열을 입력에 넣으면?',
        ['정답 누출 가능성이 크다', '항상 좋은 특성 선택', '군집으로 바뀐다'],
        0,
        '예측할 count를 구성하는 값을 미리 입력하면 실제 사용 상황에서 얻기 어려운 정답 정보를 주게 됩니다.',
      ),
      q(
        'log1p의 역변환은?',
        ['np.exp만 사용', 'np.expm1', 'np.sqrt'],
        1,
        'log(1+y)의 역은 exp(z)−1입니다.',
      ),
      q(
        '실거래가 한 행은?',
        ['현재 판매 중인 매물', '한 건의 신고 거래', '한 도시의 평균'],
        1,
        '같은 단지에서 여러 거래가 발생할 수 있고 해제된 신고도 있을 수 있습니다.',
      ),
    ],
  },
  {
    id: 'tree',
    track: 'classification',
    title: '결정 트리는 질문을 나눕니다',
    subtitle: '불순도·깊이·리프와 과적합',
    sim: 'tree',
    time: 20,
    level: '핵심',
    source: '03_붓꽃품종예측.ipynb · 04_RocketLaunch.ipynb',
    steps: [
      [
        '예/아니오 질문의 연속',
        '꽃잎 길이가 기준보다 작은가? 다음에는 너비가 작은가? 트리는 입력값을 기준으로 공간을 나누고 마지막 리프에서 정답 분포를 봅니다. 실험의 배경색은 각 위치에서 모델이 어떤 범주를 예측하는지 나타냅니다.',
        '한 번의 분할은 한 특성의 임계값 비교',
      ],
      [
        '좋은 분할은 덜 섞이게 합니다',
        'Gini와 entropy는 정답이 얼마나 섞였는지 측정합니다. 두 자식 노드의 표본 수를 고려한 불순도가 작아지는 분할을 찾습니다. 클래스가 하나뿐인 노드는 불순도가 0입니다.',
        '두 범주가 반반일 때 Gini=0.5',
      ],
      [
        '깊이를 늘리면 세밀해집니다',
        '깊은 트리는 작은 구역까지 나눌 수 있지만 잡음에도 맞출 수 있습니다. max_depth, min_samples_split, min_samples_leaf로 복잡함을 조절합니다. 불순도 기준만 바꾼다고 항상 점수가 좋아지지 않습니다.',
        '작은 리프는 우연한 관측을 규칙으로 만들 수 있습니다.',
      ],
      [
        '특성 중요도의 의미',
        '불순도 감소 기반 중요도는 해당 모델이 어떤 특성을 분할에 사용했는지 요약합니다. 원인이나 보편적인 영향력은 아닙니다. 상관된 특성들이 중요도를 나눠 갖거나 한쪽에 몰릴 수 있습니다.',
        '히트맵 상관계수와 모델 특성 중요도는 다른 값',
      ],
    ],
    formula: 'Gini = 1 − Σpₖ²',
    watchout:
      '브라우저 실험은 2차원 합성 데이터의 이진 트리입니다. Python 실습은 실제 붓꽃 네 특성·세 품종을 사용합니다.',
    mission: '깊이를 1에서 7로 늘리세요. 학습과 테스트 정확도, 결정 영역의 크기를 비교하세요.',
    code:
      irisBase +
      `from sklearn.tree import DecisionTreeClassifier\n\nmodel = DecisionTreeClassifier(max_depth=3, min_samples_leaf=2, random_state=42)\nmodel.fit(X_train, y_train)\nprint(classification_report(y_test, model.predict(X_test)))\nprint(dict(zip(iris.feature_names, model.feature_importances_)))\n`,
    quiz: [
      q(
        '트리의 깊이가 깊어질수록?',
        ['항상 테스트 점수가 증가', '작은 영역까지 나눌 수 있다', '무조건 표준화가 필요하다'],
        1,
        '표현력은 늘지만 테스트 일반화는 나빠질 수도 있습니다.',
      ),
      q(
        'Gini가 0인 노드는?',
        ['모든 클래스가 반반', '정답 클래스가 하나로 순수', '표본 수가 반드시 0'],
        1,
        '모든 표본의 정답이 같으면 섞임이 없습니다.',
      ),
      q(
        '특성 중요도가 높다는 것은?',
        ['원인으로 입증됨', '해당 모델의 분할 기여가 큼', '모든 모델에서 항상 중요'],
        1,
        '특정 모델·자료에서의 기여이며 인과 효과나 보편적 순위를 보장하지 않습니다.',
      ),
    ],
  },
  {
    id: 'knn',
    track: 'classification',
    title: '가까운 이웃에게 물어보기',
    subtitle: 'KNN의 거리·k·결정 경계',
    sim: 'knn',
    time: 17,
    level: '핵심',
    source: '03_붓꽃품종예측_상세설명.md',
    steps: [
      [
        '새 점 가까이에 누가 있나요',
        'KNN은 학습 표본을 기억하고 새 입력에서 가까운 k개를 찾습니다. 분류에서는 이웃의 정답으로 투표합니다. k=1이면 가장 가까운 한 점의 정답을 따르므로 작은 변화에도 결과가 바뀔 수 있습니다.',
        '그래프를 클릭해 새 점을 옮겨 보세요.',
      ],
      [
        'k의 크기와 경계',
        '작은 k는 지역적인 패턴에 민감하고 큰 k는 더 넓게 평균을 냅니다. 너무 크면 작은 그룹의 특징을 놓칠 수 있습니다. k는 교차검증으로 선택하며 테스트 점을 이웃으로 사용하지 않습니다.',
        '학습 데이터의 정답만 이웃 투표에 사용',
      ],
      [
        '스케일이 이웃을 바꿉니다',
        '거리 계산에서 어떤 특성의 수치 차이가 큰지 중요합니다. 단위를 바꿨을 뿐인데 이웃이 바뀐다면 표준화가 필요한지 검토하세요. 다만 모든 정보에 동일 가중치가 적절한지도 목적에 따라 판단합니다.',
        '정규화된 네 붓꽃 특성으로 KNN을 검증할 수 있습니다.',
      ],
      [
        '확률처럼 보이는 값',
        '균등 가중 KNN의 비율은 이웃 중 해당 클래스가 차지하는 비중입니다. 이는 실제 사건의 확률이 정확히 보정됐다는 보장은 아닙니다. 작은 k에서는 비율이 거칠게 바뀝니다.',
        '5명 중 3명이 클래스 1 → 비율 0.6',
      ],
    ],
    formula: '거리 = √Σ(xⱼ − 이웃ⱼ)²',
    watchout:
      '이 실험은 이해를 위해 두 특성만 사용합니다. 실제 붓꽃 전체 특성의 성능과 혼동하지 마세요.',
    mission:
      '새 점을 두 그룹 경계에 놓고 k=1, 5, 15를 비교하세요. 이웃과 예측이 왜 바뀌는지 설명하세요.',
    code:
      irisBase +
      `from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.neighbors import KNeighborsClassifier\n\nmodel = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))\nmodel.fit(X_train, y_train)\nprint(classification_report(y_test, model.predict(X_test)))\n`,
    quiz: [
      q(
        'KNN에서 k=5의 의미는?',
        ['클래스가 5개', '가까운 학습 표본 5개로 판단', '교차검증을 반드시 5번'],
        1,
        '새 점과 가까운 이웃의 개수입니다.',
      ),
      q(
        '거리 계산에 스케일이 중요한 이유는?',
        [
          '큰 척도의 특성이 거리를 지배할 수 있어서',
          '표준화하면 정답을 알 수 있어서',
          'KNN은 숫자를 못 받아서',
        ],
        0,
        '단위와 분산이 각 특성 차이의 크기에 영향을 줍니다.',
      ),
      q(
        '큰 k가 항상 좋은가요?',
        ['항상', '아니요, 국소 구조를 놓칠 수 있다', 'k는 변경 불가능하다'],
        1,
        '너무 작은 k의 잡음 민감성과 너무 큰 k의 과소적합 사이를 검증합니다.',
      ),
    ],
  },
  {
    id: 'logistic',
    track: 'classification',
    title: '확률을 결정으로 바꾸는 순간',
    subtitle: '로지스틱 회귀와 임계값의 역할',
    sim: 'logistic',
    time: 18,
    level: '핵심',
    source: '04_RocketLaunch.ipynb · 04_분류_호텔예약취소예측.ipynb',
    steps: [
      [
        '이름에 회귀가 있어도 분류',
        '로지스틱 회귀는 입력의 선형 결합을 sigmoid에 넣어 0~1 사이 점수로 바꿉니다. 이를 클래스 1의 확률 추정값으로 사용하고 기준 이상이면 양성으로 판단합니다. 학습은 분류 손실을 줄입니다.',
        '확률을 추정하는 단계와 범주를 정하는 단계를 구분',
      ],
      [
        '임계값을 바꾸면',
        '임계값을 낮추면 더 많은 표본을 양성으로 분류합니다. 놓치는 양성을 줄일 수 있지만 음성을 잘못 양성으로 판단하는 경우도 늘 수 있습니다. 모든 업무의 기준이 꼭 0.5일 필요는 없습니다.',
        '예약 취소를 놓치는 비용과 정상 예약을 취소로 보는 비용',
      ],
      [
        '점수와 확률의 한계',
        '높은 확률 추정은 확신을 나타내지만 실제 확률과 잘 맞는지는 보정과 검증이 필요합니다. 입력 범위를 벗어나거나 분포가 바뀌면 성능도 변합니다.',
        '0.9 예측인 사례 100개 중 실제 약 90개인지 확인하는 문제',
      ],
      [
        '전처리와 규제',
        '수치형은 스케일링, 문자열 범주는 원핫인코딩으로 연결합니다. sklearn LogisticRegression은 기본적으로 규제를 사용하며 C가 클수록 규제가 약해지는 관례를 가집니다. Ridge alpha와 방향을 혼동하지 않습니다.',
        'Pipeline 안에서 전처리와 학습을 함께 검증',
      ],
    ],
    formula: 'p = 1 / (1 + exp(−z)),  z = b + Σwⱼxⱼ',
    watchout:
      '실험의 확률은 합성 학습 데이터로 실제 학습한 로지스틱 모델의 출력입니다. 임계값 조정은 모델 재학습과 다릅니다.',
    mission: '임계값 0.2, 0.5, 0.8에서 예측 양성 수와 precision·recall을 비교하세요.',
    code:
      irisBase +
      `from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\n\nmodel = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))\nmodel.fit(X_train, y_train)\nprint(model.predict_proba(X_test[:3]).round(3))\nprint(classification_report(y_test, model.predict(X_test)))\n`,
    quiz: [
      q(
        '양성 기준을 낮추면 일반적으로?',
        ['예측 양성 수가 늘어난다', '예측 양성 수가 줄어든다', '모델 계수가 반드시 바뀐다'],
        0,
        '동일 확률 출력에서 더 많은 표본이 기준 이상이 됩니다.',
      ),
      q(
        '임계값 조정은?',
        ['항상 재학습', '확률을 범주로 바꾸는 기준 조정', '표준화 방식 변경'],
        1,
        '모델의 확률 출력은 그대로 두고 의사결정 기준만 바꿀 수 있습니다.',
      ),
      q(
        'sklearn 로지스틱의 C가 커지면?',
        ['규제 강해짐', '규제 약해짐', '클래스 수 증가'],
        1,
        'C는 규제 강도의 역방향으로 작용합니다. Ridge의 alpha와 혼동하지 마세요.',
      ),
    ],
  },
  {
    id: 'metrics',
    track: 'classification',
    title: '정확도 95%, 정말 좋은 모델일까요?',
    subtitle: '혼동행렬·정밀도·재현율·F1을 직접 계산',
    sim: 'metrics',
    time: 20,
    level: '핵심',
    source: '03_붓꽃품종예측_상세설명.md · 04_RocketLaunch_점검결과.md',
    steps: [
      [
        '항상 음성이라고 말해도',
        '양성 5명, 음성 95명에서 모두 음성이라고 예측하면 정확도는 95%입니다. 그러나 양성을 한 명도 찾지 못했습니다. 클래스별 표본 수와 어떤 오류가 중요한지 함께 봐야 합니다.',
        'support는 해당 클래스의 실제 평가 표본 수',
      ],
      [
        '혼동행렬의 네 칸',
        '실제 양성을 양성으로 판단하면 TP, 음성을 양성으로 판단하면 FP입니다. 실제 양성을 놓치면 FN, 음성을 맞히면 TN입니다. 행과 열의 의미를 항상 확인하세요. 이 실험은 행=실제, 열=예측입니다.',
        'TP/FP/FN/TN은 기준으로 삼은 양성 클래스에 따라 정의됩니다.',
      ],
      [
        'precision과 recall',
        'precision은 양성이라고 판단한 것 중 맞은 비율, recall은 실제 양성 중 찾아낸 비율입니다. F1은 둘의 조화평균입니다. 하나만 높고 다른 하나가 낮으면 F1도 높기 어렵습니다.',
        '분모가 0인 경우 실험과 예제는 점수를 0으로 처리합니다.',
      ],
      [
        'macro와 weighted',
        'macro는 클래스별 점수를 같은 비중으로 평균합니다. weighted는 support로 가중평균합니다. 클래스가 불균형하면 weighted가 다수 클래스의 결과를 더 반영할 수 있습니다.',
        '클래스별 support가 같으면 두 평균도 같습니다.',
      ],
    ],
    formula: 'Precision = TP/(TP+FP)   ·   Recall = TP/(TP+FN)',
    watchout:
      'R²는 회귀 지표이고 accuracy는 분류 지표입니다. 분류에서 0.93은 전체 중 약 93% 정답이라는 뜻입니다.',
    mission: 'TP를 0, FN을 5, TN을 95, FP를 0으로 만들고 accuracy와 양성 recall을 비교하세요.',
    code: `from sklearn.metrics import classification_report, confusion_matrix\n\ny_test = [0] * 95 + [1] * 5\npred = [0] * 100\nprint(confusion_matrix(y_test, pred, labels=[0, 1]))\nprint(classification_report(y_test, pred, labels=[0, 1], zero_division=0))\n`,
    quiz: [
      q(
        '실제 양성 중 찾아낸 비율은?',
        ['precision', 'recall', 'support'],
        1,
        'Recall은 TP/(TP+FN)입니다. 놓친 실제 양성 FN이 증가하면 낮아집니다.',
      ),
      q(
        'macro F1은?',
        ['클래스 F1의 동일 비중 평균', '표본 수로 가중한 F1', '정확도와 항상 같다'],
        0,
        '클래스를 동일 비중으로 보므로 작은 클래스의 성능도 반영됩니다.',
      ),
      q(
        '모두 음성으로 예측해 정확도 95%라면?',
        ['반드시 좋은 모델', '클래스별 결과를 더 봐야 한다', 'F1도 반드시 95%'],
        1,
        '불균형 데이터에서는 양성을 모두 놓쳐도 높은 정확도가 나올 수 있습니다.',
      ),
    ],
  },
  {
    id: 'pipeline',
    track: 'classification',
    title: '모델을 비교하기 전에 공정한 절차부터',
    subtitle: '결측치·원핫인코딩·앙상블·Pipeline',
    sim: 'forest',
    time: 22,
    level: '실습 연결',
    source: '04_RocketLaunch_분할후원핫인코딩.ipynb · 04_분류_호텔예약취소예측.ipynb',
    steps: [
      [
        '입력과 정답을 구분하세요',
        '정답 Y/N을 1/0으로 바꾸는 것과 입력 범주에 임의 번호를 붙이는 것은 다릅니다. 방향·날씨에 LabelEncoder를 쓰면 순서가 없는 범주에 숫자 순서를 부여할 수 있습니다. 원핫인코딩의 목적을 먼저 설명합니다.',
        '입력 범주: OneHotEncoder / 정답: 필요하면 map',
      ],
      [
        '결측도 자료 생성 과정의 일부',
        '범주 결측은 Unknown, 수치 결측은 학습 중앙값으로 대체할 수 있습니다. 그러나 발사 실패 기록에만 날씨가 비었다면 결측 패턴이 정답을 알려줄 수 있습니다. 결측을 채웠다고 데이터의 신뢰성이 해결되는 것은 아닙니다.',
        '정답 결측을 N으로 바꾸는 것은 검토해야 할 가정',
      ],
      [
        '연결하면 실수를 줄입니다',
        'ColumnTransformer는 범주와 수치에 서로 다른 변환을 적용하고 Pipeline은 그 결과를 모델로 전달합니다. GridSearchCV 안에 넣으면 각 fold에서 전처리가 fit됩니다. clone은 설정이 같은 미학습 복사본을 만듭니다.',
        '전처리 → 모델을 하나의 학습 단위로',
      ],
      [
        '여러 나무의 판단 모으기',
        '랜덤포레스트는 표본을 복원추출하고 분할에서 특성 무작위성도 사용해 다양한 트리를 만듭니다. 그 예측을 모으면 단일 트리의 변동을 줄일 수 있습니다. 실험은 복원추출한 트리들의 배깅으로 앙상블 원리를 보여주며 실제 RandomForest 전체 구현은 아닙니다.',
        '같은 테스트로 반복 선택하지 않고 CV에서 선택합니다.',
      ],
    ],
    formula: '여러 모델의 예측 → 평균 또는 투표 → 최종 판단',
    watchout:
      '실험은 트리 배깅 시연입니다. 실제 랜덤포레스트의 특성 부분집합 무작위 선택은 Python 코드에서 확인하세요.',
    mission:
      '나무 수와 깊이를 바꾸며 경계가 어떻게 달라지는지 확인하세요. 단일 트리보다 테스트 성능이 항상 좋아야 하는 것은 아닙니다.',
    code:
      irisBase +
      `from sklearn.pipeline import Pipeline\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import GridSearchCV\n\npipeline = Pipeline([('imputer', SimpleImputer(strategy='median')),\n                     ('model', RandomForestClassifier(random_state=42))])\nsearch = GridSearchCV(pipeline, {'model__max_depth': [2, 4, None],\n                                'model__n_estimators': [50, 100]},\n                      scoring='f1_macro', cv=5)\nsearch.fit(X_train, y_train)\nprint(search.best_params_)\nprint(classification_report(y_test, search.predict(X_test)))\n`,
    quiz: [
      q(
        '결측이 정답과 강하게 연결돼 있다면?',
        ['채우기만 하면 해결', '자료 생성 과정과 누출을 검토', '무조건 삭제하면 해결'],
        1,
        '결측 패턴 자체가 실제 예측 상황에서 사용할 수 없는 정답 단서일 수 있습니다.',
      ),
      q(
        'Pipeline의 장점은?',
        ['항상 성능 1.0', '전처리와 학습의 일관성', '테스트를 자동 학습에 포함'],
        1,
        '특히 교차검증 각 fold에서 전처리를 fit하게 하여 실수를 줄일 수 있습니다.',
      ),
      q(
        '랜덤포레스트는?',
        ['한 트리의 깊이만 크게 함', '여러 트리의 예측을 모음', '항상 스케일링을 필수로 요구'],
        1,
        '다양한 트리를 학습해 예측을 모으는 앙상블입니다.',
      ),
    ],
  },
  {
    id: 'kmeans',
    track: 'clustering',
    title: '중심을 옮기며 비슷한 점 묶기',
    subtitle: 'KMeans의 배정과 중심 갱신을 한 단계씩',
    sim: 'kmeans',
    time: 20,
    level: '핵심',
    source: '05_군집_붓꽃20261023.ipynb',
    steps: [
      [
        '가까운 중심으로 배정',
        '먼저 k개의 초기 중심을 정하고 각 점을 가장 가까운 중심에 배정합니다. 이 단계에서 군집 번호가 정해집니다. 같은 데이터라도 초기 중심에 따라 다른 결과로 수렴할 수 있습니다.',
        '번호는 순위나 품종 정답이 아닙니다.',
      ],
      [
        '중심을 평균으로 이동',
        '각 군집에 배정된 점들의 좌표 평균을 새 중심으로 삼습니다. 다시 가까운 중심에 배정하고 평균을 계산하는 일을 반복합니다. 중심은 실제 관측 표본 중 하나일 필요가 없습니다.',
        '배정 → 평균 중심 갱신 → 다시 배정',
      ],
      [
        'n_init과 반복 횟수',
        'n_init은 서로 다른 초기 중심에서 실행하는 횟수, max_iter는 한 실행 안에서 갱신할 최대 횟수입니다. sklearn은 여러 초기화 결과 중 관성이 작은 것을 선택합니다. 실험의 한 단계 버튼은 한 초기화 실행의 갱신을 보여줍니다.',
        'random_state는 재현을 위한 난수 기준',
      ],
      [
        '입력만 따로 관리',
        '군집 번호·품종 정답·PCA 좌표를 DataFrame에 추가한 뒤 표 전체를 다시 fit하면 이 결과 열도 입력에 들어갈 수 있습니다. 원래 측정값을 별도 X로 관리하세요.',
        'kmeans.fit(X), 결과표["cluster"] = kmeans.labels_',
      ],
    ],
    formula: '관성 = Σ 각 점과 배정된 중심 사이의 거리²',
    watchout:
      '실험은 2차원 합성 데이터입니다. 실제 붓꽃 실습은 네 특성을 사용하고 PCA로 표시할 수 있습니다.',
    mission:
      '한 단계씩 실행해 중심 X 표시가 이동하는 모습을 보세요. 초기화를 바꾼 뒤 관성과 결과를 비교하세요.',
    code:
      clusterBase +
      `from sklearn.cluster import KMeans\n\nmodel = KMeans(n_clusters=3, n_init=10, random_state=42)\nlabels = model.fit_predict(X)\nresult = pd.DataFrame(iris.data, columns=iris.feature_names)\nresult['cluster'] = labels\nprint(result.groupby('cluster').mean())\nprint('관성:', model.inertia_)\n`,
    quiz: [
      q(
        '중심점은 반드시 실제 표본인가요?',
        ['예', '아니요, 평균 좌표일 수 있다', '품종 정답 번호다'],
        1,
        '군집의 각 특성 평균이므로 실제로 존재하지 않는 점일 수 있습니다.',
      ),
      q(
        'n_init=10의 의미는?',
        ['군집 10개', '초기 중심을 달리해 10회 실행', '특성 10개'],
        1,
        '한 실행 안의 반복 횟수인 max_iter와 구분합니다.',
      ),
      q(
        '입력에 cluster 열을 넣고 다시 fit해도 되나요?',
        ['항상 권장', '결과가 입력에 섞이므로 의도 확인 필요', '정답 정확도가 보장됨'],
        1,
        '기본 실습은 원래 측정값만 입력으로 사용해야 결과에 의해 거리가 바뀌지 않습니다.',
      ),
    ],
  },
  {
    id: 'kchoice',
    track: 'clustering',
    title: '군집은 몇 개가 적절할까요?',
    subtitle: '엘보우와 실루엣이 답하는 서로 다른 질문',
    sim: 'kchoice',
    time: 20,
    level: '핵심',
    source: '05_군집_붓꽃20261023.ipynb · 06_군집_baseball_player_clustering.ipynb',
    steps: [
      [
        '관성은 k가 커지면 줄기 쉽습니다',
        '중심을 더 많이 두면 점과 중심의 거리를 줄이기 쉽습니다. 관성 최소값만 선택하면 표본 수만큼 군집을 만드는 극단도 가능합니다. 엘보우는 개선 폭이 줄어드는 지점을 후보로 봅니다.',
        '가장 작은 관성만으로 k를 선택하지 않습니다.',
      ],
      [
        '실루엣은 내부와 외부를 비교',
        'a는 같은 군집의 다른 점들과 평균 거리, b는 다른 군집 중 평균 거리가 가장 작은 군집까지의 평균 거리입니다. 중심까지의 거리만 계산하는 지표가 아닙니다. 1에 가까우면 잘 구분되고 음수면 다른 군집이 더 가까울 수 있습니다.',
        'silhouette_samples: 각 점 / silhouette_score: 평균',
      ],
      [
        '점수만 보고 정답을 정하지 않습니다',
        '붓꽃은 실제 세 품종이어도 거리 기준에서 두 묶음이 더 잘 구분될 수 있습니다. 이는 정답 품종이 두 개라는 뜻이 아닙니다. 군집 크기·음수 점·업무 해석과 함께 선택합니다.',
        '실루엣은 둥글고 분리된 군집을 선호할 수 있습니다.',
      ],
      [
        '동일한 입력에서 비교',
        '원 단위와 표준화 입력은 다른 거리 기준입니다. 이 둘의 점수를 같은 실험처럼 이어 붙이지 않습니다. DBSCAN은 잡음을 제외했는지, 남은 표본 수가 얼마인지도 함께 제시해야 합니다.',
        '유효 군집 수는 2 이상, 평가 표본 수보다 작아야 계산 가능',
      ],
    ],
    formula: 's(i) = (b(i) − a(i)) / max(a(i), b(i))',
    watchout:
      '실루엣이 최대인 k는 후보입니다. 외부 정답 클래스 수나 사업적으로 유일한 답을 보장하지 않습니다.',
    mission: 'k=2~6을 비교해 엘보우와 평균 실루엣이 같은 후보를 가리키는지 확인하세요.',
    code:
      clusterBase +
      `from sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score, silhouette_samples\n\nfor k in range(2, 7):\n    model = KMeans(n_clusters=k, n_init=10, random_state=42)\n    labels = model.fit_predict(X)\n    print(k, model.inertia_, silhouette_score(X, labels))\n`,
    quiz: [
      q(
        '실루엣의 a는?',
        ['자기 중심까지 거리', '자기 군집의 다른 표본까지 평균 거리', '전체 원점까지 거리'],
        1,
        '일반적인 실루엣은 표본 사이 거리를 사용합니다.',
      ),
      q(
        '실루엣 최고 k=2이면 붓꽃 품종도 2개인가요?',
        ['예', '아니요', '표준화했으면 예'],
        1,
        '기하학적 묶음의 품질과 알려진 품종 분류는 다른 질문입니다.',
      ),
      q(
        '관성만 최소화해 k를 선택하면?',
        ['k가 클수록 유리해지는 문제가 있다', '항상 k=2', '군집 수와 관계없다'],
        0,
        '중심을 늘리면 오차를 줄일 수 있어 복잡도와 해석을 함께 고려해야 합니다.',
      ),
    ],
  },
  {
    id: 'hierarchy',
    track: 'clustering',
    title: '작은 묶음이 큰 가지가 되기까지',
    subtitle: '계층적 군집화와 덴드로그램 읽기',
    sim: 'hierarchy',
    time: 20,
    level: '확장',
    source: '05_군집_붓꽃_3가지알고리즘_비교.ipynb',
    steps: [
      [
        '각 점에서 시작합니다',
        '병합형 계층적 군집화는 표본 하나를 군집 하나로 시작해 두 묶음씩 합칩니다. AgglomerativeClustering은 이 방식에 속합니다. 병합 이력을 나무로 그린 것이 덴드로그램입니다.',
        '아래쪽 잎 → 위쪽 큰 묶음',
      ],
      [
        '어떤 묶음을 합칠까',
        'single은 가장 가까운 두 점, complete는 가장 먼 두 점, average는 평균 거리를 사용합니다. Ward는 병합으로 군집 내부 제곱오차가 얼마나 증가하는지를 기준으로 삼습니다. 거리와 척도가 결과에 영향을 줍니다.',
        'Ward는 유클리드 공간의 분산 증가를 비교',
      ],
      [
        '나무를 어디서 자를까',
        '군집 수 k로 마지막 묶음을 정하거나 병합 거리 임계값으로 자를 수 있습니다. 덴드로그램에서 큰 높이 간격은 후보를 생각하는 단서입니다. 가로 순서 자체는 원래 데이터의 크기 순위가 아닙니다.',
        '긴 세로 가지를 가로지르는 높이를 살펴보세요.',
      ],
      [
        '시각화와 입력 구분',
        '모든 표본을 표시하면 복잡해져 일부 묶음을 생략하는 truncation을 사용할 수 있습니다. 그림의 압축 여부를 밝혀야 합니다. 실험은 가독성을 위해 합성 표본 24개를 사용하고 모든 잎을 그립니다.',
        '학습한 군집 결과 열을 linkage 입력에 섞지 않습니다.',
      ],
    ],
    formula: 'Ward 비용 증가 = n₁n₂/(n₁+n₂) × 두 중심 사이 거리²',
    watchout:
      '그림의 높이는 √(2 × Ward 비용 증가)입니다. 수평 절단 높이는 선택한 k의 마지막 병합과 다음 병합 사이로 표시합니다.',
    mission: 'k를 2, 3, 5로 바꾸며 절단선 아래 가지 수와 점 색을 비교하세요.',
    code:
      clusterBase +
      `from sklearn.cluster import AgglomerativeClustering\nfrom scipy.cluster.hierarchy import linkage, dendrogram\nimport matplotlib.pyplot as plt\n\nlabels = AgglomerativeClustering(n_clusters=3, linkage='ward').fit_predict(X)\nprint(pd.Series(labels).value_counts())\ndendrogram(linkage(X, method='ward'))\nplt.ylabel('Ward linkage height')\nplt.show()\n`,
    quiz: [
      q(
        'AgglomerativeClustering은?',
        ['병합형 계층적 군집화', 'KMeans의 다른 이름', '지도 분류'],
        0,
        '작은 군집부터 병합하는 계층적 방법입니다.',
      ),
      q(
        'Ward는 무엇을 작게 하는 병합인가요?',
        ['군집 내부 제곱오차 증가', '품종 분류 정확도', '무조건 두 점의 최소 거리'],
        0,
        '각 병합에서 군집 내부 SSE가 늘어나는 정도를 비교합니다.',
      ),
      q(
        '덴드로그램의 높이는?',
        ['항상 실제 꽃 길이', '해당 연결 기준의 병합 높이', '정답 확률'],
        1,
        '사용한 linkage에 따른 병합 기준이며 가로 위치와 다른 의미를 가집니다.',
      ),
    ],
  },
  {
    id: 'dbscan',
    track: 'clustering',
    title: '빽빽한 이웃을 따라 연결하기',
    subtitle: 'DBSCAN의 핵심점·경계점·잡음',
    sim: 'dbscan',
    time: 22,
    level: '확장',
    source: '05_군집_붓꽃_3가지알고리즘_비교.ipynb',
    steps: [
      [
        '원을 그리는 목적',
        'eps는 한 점 주변을 살펴보는 이웃 반경입니다. 반경 안에 min_samples개 이상 표본이 있으면 핵심점입니다. 자기 자신도 개수에 포함합니다. 이는 군집 전체의 최대 크기를 제한하는 원이 아닙니다.',
        '핵심점에서 다른 핵심점으로 연결되어 긴 모양도 형성',
      ],
      [
        '핵심·경계·잡음',
        '핵심점끼리 연결된 영역을 확장합니다. 핵심점의 이웃이지만 스스로 핵심이 아닌 점은 경계점이 될 수 있습니다. 어느 군집에도 속하지 못한 점은 -1 잡음으로 남습니다.',
        '잡음은 자료 오류라는 단정이 아니라 이 설정에서의 분류',
      ],
      [
        '군집 수 대신 밀도를 정합니다',
        'k를 지정하지 않아도 되지만 eps와 min_samples는 지정합니다. eps가 작으면 많은 점이 잡음이 될 수 있고 크면 다른 묶음이 연결될 수 있습니다. 데이터 척도와 밀도 차이에 따라 적절한 범위가 달라집니다.',
        '하이퍼파라미터가 없어진 것이 아닙니다.',
      ],
      [
        '점수를 공정하게 비교',
        '잡음을 빼면 어려운 점을 제외해 실루엣이 높아질 수 있습니다. 군집 수·잡음 수·평가 포함 비율을 함께 봐야 합니다. 유효 군집이 하나이거나 전부 잡음이면 실루엣을 계산할 수 없습니다.',
        '실루엣은 비볼록 모양의 좋은 군집에도 낮을 수 있습니다.',
      ],
    ],
    formula: 'eps 이웃 수 ≥ min_samples → 핵심점',
    watchout:
      '-1은 하나의 의미 있는 군집으로 간주하지 않습니다. 이 실험의 실루엣은 잡음을 제외한 점에서 계산합니다.',
    mission:
      '반달 데이터에서 eps를 조금씩 늘리세요. 잡음이 사라지는 순간과 두 군집이 연결되는 순간을 찾아보세요.',
    code: `import numpy as np\nfrom sklearn.datasets import make_moons\nfrom sklearn.cluster import DBSCAN\nfrom sklearn.metrics import silhouette_score\n\nX, _ = make_moons(n_samples=150, noise=0.05, random_state=42)\nlabels = DBSCAN(eps=0.25, min_samples=5).fit_predict(X)\nmask = labels != -1\nk = len(set(labels[mask]))\nprint('군집 수:', k, '잡음 수:', np.sum(~mask))\nif 2 <= k < np.sum(mask):\n    print('잡음 제외 실루엣:', silhouette_score(X[mask], labels[mask]))\n`,
    quiz: [
      q(
        'eps는 군집 전체의 최대 반지름인가요?',
        ['예', '아니요, 한 점의 이웃 반경', '항상 군집 수'],
        1,
        '핵심점들의 연결로 군집은 eps보다 훨씬 길게 이어질 수 있습니다.',
      ),
      q(
        'min_samples에는 자기 자신도 포함되나요?',
        ['포함', '제외', '경계점만 포함'],
        0,
        'sklearn DBSCAN의 이웃 수에는 자기 자신도 포함합니다.',
      ),
      q(
        '유효 군집 하나, 나머지 잡음이면 실루엣은?',
        ['항상 1', '잡음 제외 기준으로 계산 불가', '항상 0.5'],
        1,
        '잡음 제외 후 두 개 이상의 유효 군집이 필요합니다.',
      ),
    ],
  },
  {
    id: 'pca',
    track: 'clustering',
    title: '네 가지 측정값을 한 장에 담기',
    subtitle: 'PCA의 새 축과 군집 중심의 올바른 변환',
    sim: 'pca',
    time: 20,
    level: '핵심',
    source: '05_군집_붓꽃20261023.ipynb',
    steps: [
      [
        '정보가 많이 변하는 방향',
        'PCA는 입력의 분산을 많이 설명하는 새로운 직교 축을 찾습니다. 첫 번째 축은 가장 큰 변동 방향, 두 번째 축은 첫 축에 수직인 방향 중 다음으로 큰 변동을 담습니다. 품종 정답을 이용해 축을 찾지는 않습니다.',
        'PC1은 특정 꽃잎 길이 그 자체가 아니라 여러 특성의 선형 결합',
      ],
      [
        '표준화하면 질문이 바뀝니다',
        '원래 분산이 큰 특성을 중심으로 압축할지, 각 특성을 표준편차 단위로 맞춰 압축할지 결정합니다. 설명분산비는 선택한 입력 기준에서 각 축이 담는 분산 비율입니다. 2차원 그림에는 나머지 축의 정보가 빠집니다.',
        '2차원에서 겹쳐 보여도 4차원에서는 떨어져 있을 수 있습니다.',
      ],
      [
        '군집은 어디에서 학습했나요',
        '네 특성에서 군집을 만든 뒤 PCA로 그리는 것과 PCA 두 좌표에서 다시 군집화하는 것은 다릅니다. 이 실험은 실제 붓꽃 네 특성에서 KMeans를 학습한 후 두 좌표로 투영합니다.',
        '같은 좌표를 색만 바꿔 비교하려면 동일한 PCA를 사용',
      ],
      [
        '중심도 같은 변환으로',
        '표준화한 입력으로 KMeans와 PCA를 학습했다면 군집 중심은 이미 표준화 공간이므로 pca.transform만 적용합니다. 원 단위 KMeans 중심이라면 기존 scaler.transform을 먼저 적용합니다. 중심 세 개로 PCA를 새로 fit하면 좌표 기준이 달라집니다.',
        'transform은 이미 배운 좌표 기준에 놓는 작업',
      ],
    ],
    formula: '새 좌표 = 중심화한 입력 × 주성분 방향',
    watchout:
      'PCA 축의 부호는 반대로 나와도 같은 해입니다. 좌우가 뒤집혔다고 군집이 잘못된 것은 아닙니다.',
    mission:
      '표준화 여부와 색 기준(군집/실제 품종)을 바꿔 보세요. 중심이 같은 PCA 기준에 놓이는지 확인하세요.',
    code:
      clusterBase +
      `from sklearn.cluster import KMeans\nfrom sklearn.decomposition import PCA\nimport matplotlib.pyplot as plt\n\nmodel = KMeans(n_clusters=3, n_init=10, random_state=42).fit(X)\npca = PCA(n_components=2)\npoints = pca.fit_transform(X)\ncenters = pca.transform(model.cluster_centers_)\nplt.scatter(points[:, 0], points[:, 1], c=model.labels_)\nplt.scatter(centers[:, 0], centers[:, 1], marker='X', s=200, c='magenta')\nplt.show()\nprint('설명분산비:', pca.explained_variance_ratio_)\n`,
    quiz: [
      q(
        'PCA는 품종 정답으로 축을 찾나요?',
        ['예', '아니요', 'KMeans와 함께면 예'],
        1,
        '입력의 분산 구조를 이용합니다. 정답을 이용하는 지도 차원축소와 구분합니다.',
      ),
      q(
        '중심만 PCA에 다시 fit하면?',
        ['같은 그림 좌표가 보장됨', '좌표 기준이 달라짐', '항상 중심이 원점으로만 나옴'],
        1,
        '이미 표본에 학습한 PCA의 transform으로 중심을 같은 기준에 놓아야 합니다.',
      ),
      q(
        '4차원 군집 후 PCA 시각화와 PCA 후 군집은?',
        ['항상 동일', '서로 다른 작업', '둘 다 불가능'],
        1,
        '차원축소로 거리가 달라지므로 군집 결과도 달라질 수 있습니다.',
      ),
    ],
  },
  {
    id: 'profile',
    track: 'clustering',
    title: '그룹에 이름을 붙이는 마지막 단계',
    subtitle: '야구 선수와 상권의 군집 결과 읽기',
    sim: 'profile',
    time: 18,
    level: '실습 연결',
    source:
      '06_군집_baseball_player_clustering_보강본.ipynb · 07_웹크롤링_상가상권_지역별업종군집화.ipynb',
    steps: [
      [
        '한 행의 의미부터',
        '야구 자료는 선수-시즌 하나, 원래 상가 자료는 점포 하나입니다. 지역을 묶으려면 점포 표를 행정동별 업종 구성 표로 바꿔야 합니다. 이름·순위·결과 열을 무작정 입력에 포함하지 마세요.',
        '점포 → 행정동 × 업종별 수 → 업종 비율',
      ],
      [
        '개수와 비율은 다른 질문',
        '점포 개수로 묶으면 규모가 큰 지역과 작은 지역으로 나뉘기 쉽습니다. 각 행의 총수로 나눈 비율은 규모보다 업종 구성에 집중합니다. 점포 수가 적은 지역의 비율은 불안정할 수 있습니다.',
        '음식점 50/100개와 500/1000개는 모두 50%',
      ],
      [
        '표준화도 가중치 선택',
        '모든 업종 비율은 0~1이지만 분산은 다릅니다. 표준화하면 변동이 작은 업종도 상대적으로 더 크게 반영됩니다. 비율 차이 그대로를 비교할지, 업종별 표준화 차이를 비교할지 목적을 정하세요.',
        '같은 단위와 같은 영향력은 다른 개념',
      ],
      [
        '평균과 대표 사례로 설명',
        '군집별 원 단위 평균·전체 대비 차이·표본 수·대표 지역을 함께 보세요. 선수 군집에서는 타격 지표의 중복과 규모/능률을 구분합니다. 상권 군집에 매출·유동인구가 없다면 창업 성공을 예측했다고 말할 수 없습니다.',
        '번호 0 → 음식 비중이 상대적으로 높은 유형처럼 관측 근거로 이름 붙이기',
      ],
    ],
    formula: '업종 비율 = 해당 업종 점포 수 / 지역의 총점포 수',
    watchout:
      '이 실험의 지역 표는 이해를 위한 합성 예시입니다. 실제 서울 상권이나 매출 통계가 아닙니다.',
    mission:
      '개수와 비율 모드를 바꿔 같은 업종 구성·다른 규모의 두 지역이 어떻게 달라지는지 비교하세요.',
    code: `import pandas as pd\nfrom sklearn.cluster import KMeans\n\ncounts = pd.DataFrame({\n    'food': [80, 800, 20, 200, 25, 250],\n    'retail': [10, 100, 70, 700, 15, 150],\n    'service': [10, 100, 10, 100, 60, 600]\n}, index=['A', 'B', 'C', 'D', 'E', 'F'])\nratio = counts.div(counts.sum(axis=1), axis=0)\nlabels = KMeans(n_clusters=3, n_init=10, random_state=42).fit_predict(ratio)\nresult = ratio.copy()\nresult['cluster'] = labels\nprint(result)\nprint(result.groupby('cluster').mean())\n`,
    quiz: [
      q(
        '행정동 업종 구성으로 군집화하려면?',
        ['점포 이름을 숫자로 변환', '지역별 업종 비율 표로 변환', '군집 번호를 입력에 포함'],
        1,
        '분석 단위를 지역으로 바꾸고 규모를 나눠 구성 비율을 비교합니다.',
      ),
      q(
        '업종 비율만으로 창업 성공을 예측했나요?',
        ['예', '아니요', '실루엣이 높으면 예'],
        1,
        '매출·수익·폐업 등의 정답을 학습하거나 검증한 것이 아닙니다.',
      ),
      q(
        '야구 Rank를 입력에 넣으면?',
        [
          '이미 만든 순위가 거리를 지배할 수 있다',
          '순위가 자동 정답이 된다',
          '입력이 항상 개선된다',
        ],
        0,
        '어떤 타격 특성으로 묶으려는지 목적에 맞춰 식별자·순위를 제외하고 평가해야 합니다.',
      ),
    ],
  },
];
lessons.push(...crawlingLessons);
export const glossary = [
  [
    '특성 · Feature',
    '예측이나 군집에 사용하는 입력의 한 항목. TV 광고비, 꽃잎 길이 등이 해당합니다.',
    'question',
  ],
  ['타깃 · Target', '지도학습에서 맞히려는 실제 정답 y. 입력 X와 분리합니다.', 'question'],
  [
    '하이퍼파라미터',
    '깊이·이웃 수·규제 강도처럼 학습 전에 정하는 설정. 검증 자료로 선택합니다.',
    'validation',
  ],
  [
    '잔차 · Residual',
    '실제값 − 예측값. 부호는 작게 예측했는지 크게 예측했는지 나타냅니다.',
    'linear',
  ],
  ['과적합', '훈련 표본의 잡음까지 따라가 새 데이터에 대한 일반화가 나빠지는 현상.', 'polynomial'],
  ['표준화', '학습 평균을 빼고 학습 표준편차로 나눠 좌표 척도를 바꾸는 작업.', 'scale'],
  [
    '정규화와 규제',
    '정규화는 스케일 변환을 뜻하기도 하고 혼용되기도 합니다. 여기서는 패널티를 더하는 regularization을 규제라고 부릅니다.',
    'regularization',
  ],
  [
    '데이터 누출',
    '실제 예측 시 알 수 없는 정답·미래 정보 또는 검증 정보가 학습과 선택에 섞이는 문제.',
    'split',
  ],
  [
    '원핫인코딩',
    '범주를 각각 0/1 열로 표현하는 방법. 임의의 크기·순서 가정을 줄입니다.',
    'multiple',
  ],
  ['Pipeline', '전처리와 모델을 하나의 fit/predict 흐름으로 묶는 sklearn 도구.', 'pipeline'],
  ['정밀도 · Precision', '양성이라고 예측한 것 중 실제 양성의 비율.', 'metrics'],
  ['재현율 · Recall', '실제 양성 중 양성으로 찾아낸 비율.', 'metrics'],
  [
    'Macro F1',
    '클래스별 F1의 동일 가중 평균. 클래스별 표본 수와 무관하게 동일 비중으로 봅니다.',
    'metrics',
  ],
  [
    '관성 · Inertia',
    'KMeans의 군집 내 중심까지 제곱거리 합. 입력 척도와 k에 영향을 받습니다.',
    'kmeans',
  ],
  ['실루엣', '같은 군집 내부 거리와 가장 가까운 다른 군집까지 거리를 비교하는 지표.', 'kchoice'],
  ['핵심점', 'DBSCAN에서 eps 이웃 수가 min_samples 이상인 점. 자기 자신도 포함합니다.', 'dbscan'],
  ['설명분산비', 'PCA 각 축이 원래 입력의 전체 분산 중 담고 있는 비율.', 'pca'],
  ['일반화', '관측한 학습 표본에서 찾은 규칙이 새로운 표본에서도 유용한 성질.', 'split'],
  ['CSS 선택자', '태그·class·id·포함 관계·속성 조건으로 HTML 요소를 찾는 규칙.', 'selectors'],
  [
    'DOM',
    'HTML 문서를 트리 구조로 표현한 객체. JavaScript 실행 뒤 원본 HTML과 달라질 수 있습니다.',
    'dynamic',
  ],
  [
    'JSON · XML',
    '구조화된 데이터 표현 형식. JSON은 dict·list로, XML은 태그 트리로 해석합니다.',
    'api',
  ],
  [
    'HTTP 상태 코드',
    '요청 처리 결과를 나타내는 코드. 200이어도 원하는 데이터가 있는지 확인해야 합니다.',
    'http',
  ],
  [
    '수집 단위',
    '한 행이 나타내는 대상. 기사·거래·점포 단위를 먼저 정해야 중복·집계·정답을 올바르게 다룹니다.',
    'collection-model',
  ],
];
export const references = [
  ['회귀·규제와 선형 모델', 'https://scikit-learn.org/stable/modules/linear_model.html'],
  ['전처리와 스케일링', 'https://scikit-learn.org/stable/modules/preprocessing.html'],
  ['교차검증', 'https://scikit-learn.org/stable/modules/cross_validation.html'],
  ['모델 평가 지표', 'https://scikit-learn.org/stable/modules/model_evaluation.html'],
  ['결정 트리', 'https://scikit-learn.org/stable/modules/tree.html'],
  ['군집화와 실루엣', 'https://scikit-learn.org/stable/modules/clustering.html'],
  ['PCA', 'https://scikit-learn.org/stable/modules/decomposition.html#pca'],
  [
    'Iris 데이터 출처',
    'https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_iris.html',
  ],
  ['BeautifulSoup · 선택자와 텍스트', 'https://www.crummy.com/software/BeautifulSoup/bs4/doc/'],
  ['Requests · HTTP 응답 처리', 'https://requests.readthedocs.io/en/latest/user/quickstart/'],
  ['Selenium · 기다림과 브라우저', 'https://www.selenium.dev/documentation/webdriver/waits/'],
  ['Quotes to Scrape · 정적 실습', 'https://quotes.toscrape.com/'],
  ['Quotes to Scrape · JavaScript 실습', 'https://quotes.toscrape.com/js/'],
  ['교사용 수업 진행안', '/classroom-guide.md'],
  ['공공데이터포털 · 아파트 매매 실거래가 자료', 'https://www.data.go.kr/data/15126469/openapi.do'],
];
