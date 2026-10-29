const q = (prompt, options, answer, explanation) => ({ prompt, options, answer, explanation });
export const crawlingLessons = [
  {
    id: 'selectors',
    track: 'scraping',
    title: '태그 사이에서 원하는 정보 찾기',
    subtitle: 'HTML · CSS 선택자 · select_one과 select',
    sim: 'selectors',
    time: 20,
    level: '시작',
    source: '07_웹크롤링_기존사이트유지_보강본.ipynb · Quotes to Scrape 정적 페이지',
    steps: [
      [
        '웹페이지도 구조가 있는 문서',
        'HTML은 태그로 내용의 역할과 포함 관계를 나타냅니다. div는 카드 영역, h3는 제목, a는 링크를 나타낼 수 있습니다. class는 여러 요소에 붙일 수 있는 분류 이름, id는 문서 안에서 요소를 식별하는 이름입니다. 화면의 글자를 복사하는 대신 원하는 태그를 찾아 텍스트와 속성을 꺼냅니다.',
        '<a class="news-link" href="/news/1"><h3>기사 제목</h3></a>',
      ],
      [
        '선택자는 주소를 찾아가는 규칙',
        'h3는 h3 태그 전체, .author는 class가 author인 요소, #headline은 id가 headline인 요소입니다. .quote .text는 quote 안의 모든 하위 단계에서 text를 찾고, .quote > .text는 바로 아래 자식만 찾습니다. a[href*="article/"]은 href 속성에 article/ 문자열이 포함된 a를 찾습니다. 어렵다면 카드의 class부터 선택해 안쪽으로 한 단계씩 내려가세요.',
        '카드 .quote → 카드 안의 .text와 .author',
      ],
      [
        '하나와 여러 개는 반환값이 다릅니다',
        'select_one은 첫 번째 태그 하나 또는 None을 돌려줍니다. select는 일치하는 태그들의 목록을 돌려줍니다. 태그의 get_text(strip=True)로 글자만 꺼내고, 링크는 tag["href"]로 속성을 꺼냅니다. 제목 목록과 저자 목록을 각각 뽑아 단순히 zip하면 누락된 항목 때문에 연결이 틀릴 수 있습니다. 카드 단위 반복을 사용하세요.',
        'for card in soup.select(".quote"): card.select_one(".author")',
      ],
      [
        '못 찾았다는 것과 못 받았다는 것은 다릅니다',
        '요청이 성공해도 선택자가 바뀌었거나 원본 HTML에 원하는 태그가 없으면 None 또는 빈 목록이 나옵니다. 받은 HTML 일부를 출력하고 원본 응답과 실행 후 DOM을 구분하세요. JavaScript를 실행하지 않는 BeautifulSoup은 없는 카드를 만들어 주지 않습니다.',
        'HTTP 200 + select 결과 [] → HTML 구조와 동적 렌더링 여부 확인',
      ],
    ],
    formula: '문서 받기 → 카드 선택 → 카드 안에서 글자·속성 추출 → 행 만들기',
    watchout:
      '실험은 이 사이트 안에 준비한 짧은 HTML을 실제 DOMParser·CSS 선택자로 읽습니다. 외부 사이트에 접속하는 실험이 아닙니다. BeautifulSoup의 세부 파서 동작과는 차이가 있을 수 있습니다.',
    mission:
      '선택자에 .quote, .text, .quote > .author, .quote .author를 차례로 넣으세요. 태그의 개수와 포함 관계를 확인하세요.',
    code: `from bs4 import BeautifulSoup\n\nhtml = '''<div class="quote">\n    <span class="text">작은 실험에서 큰 이해가 시작됩니다.</span>\n    <span>by <small class="author">학습자 A</small></span>\n    <a class="tag" href="/tag/learning/">학습</a>\n</div>\n<div class="quote">\n    <span class="text">관찰한 결과를 자기 말로 설명해 보세요.</span>\n    <span>by <small class="author">학습자 B</small></span>\n</div>'''\n\nsoup = BeautifulSoup(html, 'html.parser')\nfirst = soup.select_one('.text')\nif first is not None:\n    print('첫 명언:', first.get_text(strip=True))\n\nrows = []\nfor card in soup.select('.quote'):\n    text = card.select_one('.text')\n    author = card.select_one('.author')\n    rows.append({\n        'text': text.get_text(strip=True) if text else '',\n        'author': author.get_text(strip=True) if author else ''\n    })\nprint(rows)\n`,
    quiz: [
      q(
        'class="author"인 요소를 고르는 선택자는?',
        ['author', '#author', '.author'],
        2,
        '클래스는 점을 앞에 붙입니다. id를 찾을 때는 #을 사용합니다.',
      ),
      q(
        'select_one이 못 찾으면?',
        ['빈 DataFrame', 'None', '항상 오류'],
        1,
        'None을 반환합니다. None에 바로 .text를 사용하면 오류가 나므로 확인하세요.',
      ),
      q(
        '제목과 저자 연결을 안전하게 유지하려면?',
        ['카드 단위로 반복하며 내부 요소 추출', '두 목록을 무조건 zip', '저자 이름순 정렬'],
        0,
        '카드가 한 행의 단위입니다. 서로 대응하는 정보를 같은 카드 안에서 추출합니다.',
      ),
    ],
  },
  {
    id: 'http',
    track: 'scraping',
    title: '요청은 성공했는데 왜 비어 있지?',
    subtitle: 'Requests · 상태 코드 · 인코딩 · 예외 처리',
    sim: 'http',
    time: 18,
    level: '핵심',
    source: '07_웹크롤링_기존사이트유지_보강본.ipynb · 뉴스 본문·이미지 수집',
    steps: [
      [
        'Requests는 응답을 받습니다',
        'requests.get은 HTTP 요청을 보내고 서버의 응답 객체를 받습니다. HTML뿐 아니라 JSON, XML, 이미지, CSV, 오류 페이지도 받을 수 있습니다. 상태 코드와 Content-Type, 실제 내용부터 확인해야 합니다. 주소가 뉴스 페이지라고 해서 응답이 항상 기사 HTML이라는 보장은 없습니다.',
        'response.status_code / response.headers.get("Content-Type")',
      ],
      [
        '200도 내용까지 보장하지 않습니다',
        '200은 요청 처리가 성공했다는 HTTP 수준의 표시입니다. 로그인 안내·빈 껍데기·API 오류 결과도 200으로 올 수 있습니다. 403은 접근 거부, 404는 없는 자원, 429는 요청 과다 등으로 해석합니다. raise_for_status는 4xx·5xx에서 예외를 발생시킵니다. 여러 건 수집에서는 try/except 안에서 기록하고 다음 항목으로 넘어갈 수 있습니다.',
        '한 요청 실패 → 실패 원인 기록 → continue',
      ],
      [
        '텍스트와 바이트를 구분하세요',
        'response.content는 원본 바이트이고 response.text는 추정·설정된 인코딩으로 해석한 문자열입니다. 실제 인코딩이 UTF-8인 것을 확인했다면 response.encoding을 맞출 수 있습니다. 무조건 UTF-8로 decode하면 다른 인코딩의 페이지에서 실패할 수 있습니다. 이미지는 content를 BytesIO로 감싸 PIL로 읽습니다.',
        '문자 깨짐: 실제 인코딩 확인 / CSV: encoding="utf-8-sig"',
      ],
      [
        '기다림에도 한계를 정합니다',
        'timeout이 없으면 수업 중 요청이 길게 대기할 수 있습니다. timeout=20을 지정하고 연결 오류·시간 초과를 처리하세요. timeout은 전체 다운로드의 엄격한 총 시간 제한과 같지 않습니다. 성공 건수와 실패 건수를 함께 확인하고, 실패를 빈 정답처럼 섞지 마세요.',
        'requests.get(url, timeout=20) → 상태 확인 → 내용 파싱',
      ],
    ],
    formula: '네트워크 성공 ≠ 필요한 데이터 존재 ≠ 데이터 품질 확보',
    watchout:
      '이 실험의 상태 코드는 준비한 응답 시나리오입니다. 실제 서버에 반복 요청하지 않습니다. 학습용 오류 사례를 선택해서 처리 흐름을 살펴보세요.',
    mission:
      '200 HTML, 200 JSON, 403, 200 빈 HTML을 바꾸어 보세요. 상태 코드와 선택자 결과를 각각 확인해야 하는 이유를 설명하세요.',
    code: `import requests\nfrom bs4 import BeautifulSoup\n\n# 실제 네트워크 실습: 인터넷 연결이 필요합니다.\nurls = ['https://quotes.toscrape.com/']\nrows = []\nfailed = []\n\nfor url in urls:\n    try:\n        response = requests.get(url, timeout=20)\n        response.raise_for_status()\n        soup = BeautifulSoup(response.content, 'html.parser')\n        cards = soup.select('.quote')\n        if not cards:\n            print('카드 없음: 선택자와 HTML 확인', url)\n            continue\n        for card in cards:\n            rows.append({\n                'text': card.select_one('.text').get_text(strip=True),\n                'author': card.select_one('.author').get_text(strip=True)\n            })\n    except requests.RequestException as error:\n        failed.append({'url': url, 'error': type(error).__name__})\n        continue\n\nprint('수집:', len(rows), '실패:', len(failed))\nprint(rows[:2])\n`,
    quiz: [
      q(
        'requests.get이 받을 수 있는 것은?',
        ['HTML만', 'HTML·JSON·XML·이미지 등', '화면에 보이는 글자만'],
        1,
        'HTTP 응답의 내용은 여러 형식일 수 있습니다. 형식에 맞는 도구로 해석해야 합니다.',
      ),
      q(
        'raise_for_status로 루프 전체가 멈추지 않게 하려면?',
        [
          '무조건 삭제한다',
          'try/except로 오류를 처리하고 다음 요청 진행',
          '200만 기록하고 나머지 숨긴다',
        ],
        1,
        '예외를 처리해 실패를 기록하고 계속할 수 있습니다. 상태 코드만 검사하면 연결 오류나 timeout은 별도로 처리해야 합니다.',
      ),
      q(
        '200인데 .quote가 0개라면?',
        ['반드시 네트워크 장애', '선택자·응답 내용·JS 렌더링을 확인', '무조건 인코딩 오류'],
        1,
        '200은 원하는 태그가 존재한다는 보장이 아닙니다. 응답의 실제 내용을 확인하세요.',
      ),
    ],
  },
  {
    id: 'dynamic',
    track: 'scraping',
    title: '보이는 화면과 받은 HTML은 다를 수 있어요',
    subtitle: '정적 페이지 · JavaScript · Selenium · F12',
    sim: 'dynamic',
    time: 20,
    level: '핵심',
    source: '07_웹크롤링_기존사이트유지_보강본.ipynb · Quotes /js/ · 네이버 금융 뉴스',
    steps: [
      [
        '같은 모습, 다른 생성 과정',
        '정적 Quotes 페이지는 원본 응답 안에 .quote 태그가 들어 있습니다. /js/ 버전은 script 안에 명언 데이터가 있고 JavaScript가 카드 태그를 만듭니다. 브라우저는 코드를 실행하므로 두 화면이 비슷합니다. 데이터가 script에 들어 있는 것과 .quote 요소로 만들어져 있는 것은 다릅니다.',
        '일반 버전: HTML 카드 제공 / JS 버전: 데이터+코드 → 카드 생성',
      ],
      [
        'F12에서 보는 위치가 중요합니다',
        '요소(Elements)는 현재 DOM이라 JavaScript가 만든 카드도 보입니다. 네트워크(Network)에서 문서 요청을 선택하고 응답(Response)을 보면 서버가 처음 준 HTML을 확인할 수 있습니다. 헤더만 비교하면 둘 다 200 text/html일 수 있어 차이를 알기 어렵습니다.',
        'Network → 문서 → Response / Elements → 실행 후 DOM',
      ],
      [
        'BeautifulSoup은 JavaScript 실행기가 아닙니다',
        'BeautifulSoup은 받은 마크업을 구조적으로 탐색합니다. Requests도 JavaScript를 실행하지 않습니다. Selenium으로 브라우저가 태그를 만든 후 page_source를 가져와 BeautifulSoup으로 다시 추출할 수 있습니다. JSON API가 있다면 별도 데이터 경로로 읽을 수도 있습니다. 모든 동적 사이트가 Selenium을 꼭 요구하는 것은 아닙니다.',
        '원본 HTML .quote 0개 → 브라우저 실행 후 .quote 10개',
      ],
      [
        '기다리고, 읽고, 닫습니다',
        'time.sleep은 이해하기 쉽지만 정해진 시간만 기다립니다. 실제 환경에서는 필요한 요소가 생길 때까지 WebDriverWait으로 기다리는 편이 안정적입니다. finally에서 driver.quit()을 호출하면 성공·실패 모두 해당 드라이버 세션과 창을 정리합니다. 같은 변수에 새 드라이버를 덮어쓰면 이전 세션의 참조를 잃을 수 있습니다.',
        '드라이버 하나 생성 → 필요한 작업 → finally: quit()',
      ],
    ],
    formula: '서버 응답 HTML + JavaScript 실행 → 현재 DOM → 화면',
    watchout:
      '사이트 실험은 정적/동적 생성 과정을 재현한 로컬 예시입니다. 실제 Quotes 사이트의 화면을 임베드한 것이 아닙니다. 실제 구조는 외부 사이트 개편에 따라 달라질 수 있습니다.',
    mission:
      '정적/JS 모드를 바꾸고 원본 응답과 실행 후 DOM의 .quote 개수를 비교하세요. JS 모드에서는 실행 버튼을 눌러 보세요.',
    code: `from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\nfrom bs4 import BeautifulSoup\n\n# 실제 브라우저 실습: Chrome·Selenium과 인터넷이 필요합니다.\ndriver = webdriver.Chrome()\ntry:\n    driver.get('https://quotes.toscrape.com/js/')\n    WebDriverWait(driver, 20).until(\n        EC.presence_of_element_located((By.CSS_SELECTOR, '.quote'))\n    )\n    html = driver.page_source\nfinally:\n    driver.quit()\n\nsoup = BeautifulSoup(html, 'html.parser')\nfor card in soup.select('.quote'):\n    print(card.select_one('.text').get_text(strip=True))\n    print(card.select_one('.author').get_text(strip=True))\n`,
    quiz: [
      q(
        'Elements에서 카드가 보이면 Requests로도 반드시 선택 가능한가요?',
        ['항상 가능', '실행 후 DOM이므로 원본 응답은 별도 확인', '둘은 완전히 같은 문서'],
        1,
        'Elements는 현재 DOM입니다. 원본 HTML에 카드가 없고 실행 뒤 만들어졌을 수 있습니다.',
      ),
      q(
        'JS 버전의 원본 script에 텍스트가 있다면?',
        [
          '.quote 태그도 반드시 있다',
          '데이터 존재와 카드 요소 존재는 별개',
          'BeautifulSoup이 자동 실행한다',
        ],
        1,
        'script의 데이터 문자열을 가진 것과 CSS 선택자로 찾는 요소가 있는 것은 다릅니다.',
      ),
      q(
        'driver.quit()을 finally에 두는 이유는?',
        [
          '요청을 두 배 빠르게 함',
          '오류가 나도 해당 세션을 정리',
          '모든 Chrome 프로세스를 강제 종료',
        ],
        1,
        '해당 WebDriver 세션을 정리합니다. 다른 Chrome 세션 전체를 지우는 명령이 아닙니다.',
      ),
    ],
  },
  {
    id: 'api',
    track: 'scraping',
    title: 'HTML 말고, 데이터로 바로 받기',
    subtitle: 'JSON · XML · 공공데이터 API · 페이지 나누기',
    sim: 'api',
    time: 22,
    level: '연결',
    source: '07_웹크롤링_기존사이트유지_보강본.ipynb · 아파트 실거래가·상가정보 OpenAPI',
    steps: [
      [
        'API는 데이터 요청의 약속',
        'API 주소와 요청 파라미터로 지역·기간·페이지를 지정합니다. 아파트 매매 실거래가의 LAWD_CD는 시군구 법정동 코드 앞 5자리, DEAL_YMD는 계약연월 YYYYMM을 사용합니다. 안양시 만안구는 41171, 동안구는 41173으로 구분해 요청합니다. 서비스키는 본인에게 발급된 값을 로컬 환경에서 사용하고 공개 사이트 코드에 넣지 않습니다.',
        'LAWD_CD=41171 / DEAL_YMD=202601',
      ],
      [
        '형식에 맞는 해석기를 사용합니다',
        'JSON이면 response.json()으로 dict·list를 얻고, XML이면 xmltodict.parse 또는 ElementTree로 구조를 읽습니다. type=json을 임의로 붙였다고 지원하지 않는 XML API가 JSON으로 바뀌지는 않습니다. 문서의 응답 형식과 실제 본문을 확인하세요. JSON에서 CSS 선택자를 찾는 대신 키와 목록을 따라갑니다.',
        'JSON: data["response"]["body"] / XML: 태그 트리를 dict로 해석',
      ],
      [
        'HTTP 상태와 API 결과 코드를 모두 확인',
        'HTTP 200이어도 API 내부 resultCode가 실패일 수 있습니다. body, items가 없거나 비어 있는 경우도 처리해야 합니다. XML의 item은 한 건일 때 dict, 여러 건일 때 list로 해석될 수 있어 한 행과 여러 행을 같은 목록 형태로 맞춥니다. 지역·계약연월에 실제 거래가 없을 수도 있습니다.',
        'None → [] / dict → [dict] / list → 그대로',
      ],
      [
        '첫 페이지는 전체 자료가 아닙니다',
        'numOfRows는 페이지당 요청 건수, pageNo는 페이지 번호입니다. totalCount가 230이고 100개씩 받으면 3페이지가 필요합니다. 먼저 1페이지로 구조를 확인한 다음 전체가 필요할 때 반복합니다. 이번 달 자료는 신고·정정·취소로 추가되거나 바뀔 수 있으므로 수집일과 지역·기간을 같이 기록하세요.',
        '전체 페이지 수 = ceil(totalCount / numOfRows)',
      ],
    ],
    formula: '요청 파라미터 → HTTP 응답 → 서비스 결과 확인 → item 정규화 → DataFrame',
    watchout:
      '아래 실험은 7건짜리 가상 거래 자료로 페이지와 JSON/XML 읽기를 연습합니다. 실제 거래가격·서비스 응답을 재현한 자료가 아닙니다.',
    mission:
      '페이지당 건수와 페이지 번호를 바꾸세요. XML과 JSON의 모습은 달라도 같은 행이 만들어지는지 확인하세요.',
    code: `import pandas as pd\nimport xmltodict\n\n# 먼저 고정 XML로 구조 연습: API키·네트워크 없이 실행됩니다.\nxml_text = '''<response><header><resultCode>000</resultCode></header>\n<body><items><item><aptNm>학습아파트</aptNm>\n<excluUseAr>84.9</excluUseAr><dealAmount>60,000</dealAmount>\n</item></items><totalCount>1</totalCount></body></response>'''\ndata = xmltodict.parse(xml_text)\nitems = data['response']['body']['items']\nitems = items.get('item') if items else None\nif items is None:\n    items = []\nelif isinstance(items, dict):\n    items = [items]\n\ndf = pd.DataFrame(items)\nif not df.empty:\n    df['dealAmount'] = pd.to_numeric(\n        df['dealAmount'].str.replace(',', '', regex=False), errors='coerce'\n    )\n    df['excluUseAr'] = pd.to_numeric(df['excluUseAr'], errors='coerce')\nprint(df)\ndf.to_csv('apartment_practice.csv', index=False, encoding='utf-8-sig')\n\n# 실제 요청은 개인 노트북에서 별도로 실행하세요.\n# import requests\n# response = requests.get(\n#     'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade',\n#     params={'serviceKey': serviceKey, 'LAWD_CD': '41171',\n#             'DEAL_YMD': '202601', 'pageNo': 1, 'numOfRows': 100},\n#     timeout=20\n# )\n# response.raise_for_status()\n# data = xmltodict.parse(response.text)\n`,
    quiz: [
      q(
        'XML API에 type=json을 붙이면?',
        ['항상 JSON이 됨', '서버가 해당 옵션을 지원해야 함', 'BeautifulSoup이 JSON으로 바꿈'],
        1,
        '지원되는 응답 형식과 파라미터는 서비스별로 다릅니다. 실제 문서를 확인해야 합니다.',
      ),
      q(
        'XML item이 dict 하나로 나왔다면?',
        ['반드시 잘못된 응답', '[item]으로 감싸 행 목록으로 맞출 수 있음', '문자열로 합쳐야 함'],
        1,
        '단일 item과 복수 item의 구조 차이를 정규화하면 DataFrame 생성이 일관됩니다.',
      ),
      q(
        '230건을 100건씩 요청할 때 필요한 페이지 수는?',
        ['1', '2', '3'],
        2,
        '1페이지 100건, 2페이지 100건, 3페이지 30건입니다. 서버가 페이지 크기를 제한하는지도 확인하세요.',
      ),
    ],
  },
  {
    id: 'collection-model',
    track: 'scraping',
    title: '수집한 표를 예측 모델로 연결하기',
    subtitle: 'CSV · 품질 점검 · 아파트 회귀 · 상권 군집',
    sim: 'collection',
    time: 25,
    level: '실전',
    source: '07_웹크롤링_기존사이트유지_보강본.ipynb · 아파트 매매 회귀·상권 업종 구성 군집',
    steps: [
      [
        '한 행의 의미부터 정합니다',
        '아파트는 한 행이 거래 한 건, 뉴스는 기사 한 건, 상가는 점포 한 곳입니다. 단위가 정해져야 중복을 제거하고 적절하게 묶을 수 있습니다. 금액의 쉼표, 면적의 문자열, 빈 칸, 취소된 거래를 확인하세요. 원자료와 학습에 사용할 정제 자료를 따로 보관하면 결과를 재현하기 쉽습니다.',
        '거래금액은 만원 단위인지, 면적은 ㎡인지 함께 기록',
      ],
      [
        '정답이 있는 문제는 회귀로',
        '면적·층·건축연도·지역으로 거래금액을 예측하면 회귀입니다. 금액을 정답 y로 분리하고, 금액에서 계산된 ㎡당 가격을 입력에 넣으면 정답을 간접적으로 알려주는 누출이 됩니다. 실제 예측 시점에 알 수 있는 특성만 고릅니다. 실제 미래 예측은 시간순 평가가 적절한지 검토하세요.',
        'X = 면적·층·건축연도 / y = 거래금액',
      ],
      [
        '비교 기준과 실패 사례를 함께 봅니다',
        '모든 집값을 학습 평균으로 예측하는 DummyRegressor와 비교해야 모델이 단순 기준보다 나은지 알 수 있습니다. MAE·RMSE를 금액 단위로 해석하고 큰 오차가 난 거래를 확인합니다. 표본 10건으로 만든 시연 결과를 해당 지역 전체의 가격 예측 성능으로 일반화하면 안 됩니다.',
        'RMSE 5,000만원 → 제곱오차 평균의 제곱근이 5,000만원',
      ],
      [
        '같은 수집도 질문이 다르면 군집으로',
        '상가정보는 지역×업종의 점포 개수표로 집계한 다음 비율로 바꾸면 규모보다 구성을 비교할 수 있습니다. 상권 군집에 자동 정답은 없고 음식·소매·서비스 비중을 보고 그룹 의미를 해석합니다. 이미지 저장 시 파일명은 한글을 유지하되 Windows 금지문자와 끝의 점·공백, 중복 이름을 처리해야 합니다.',
        '지역별 업종 비율 → 필요시 스케일링 → 군집 → 구성 해석',
      ],
    ],
    formula: '수집 → 정제 → 질문·정답 정의 → 분할 → 전처리·학습 → 기준 모델과 평가',
    watchout:
      '브라우저 회귀 실험은 면적과 가상 가격으로 만든 자료입니다. 투자·시세 판단용이 아닙니다. 실제 CSV는 수집 범위·수집일·거래 취소·정정·중복 여부를 별도 점검해야 합니다.',
    mission:
      '정답에서 계산한 ㎡당 가격을 입력으로 넣는 누출 예시와 올바른 면적 입력을 비교하세요. 점수만으로 좋은 모델을 판단할 수 있는지 설명하세요.',
    code: `import numpy as np\nimport pandas as pd\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.dummy import DummyRegressor\nfrom sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score\n\n# 가상 거래: 면적·가격의 관계를 연습하기 위한 자료입니다.\nrng = np.random.default_rng(42)\ndf = pd.DataFrame({\n    'area': rng.uniform(40, 130, 120),\n    'floor': rng.integers(1, 25, 120),\n    'month_order': np.arange(120)\n})\ndf['price'] = 5000 + 600 * df['area'] + 100 * df['floor'] + rng.normal(0, 5000, 120)\ndf.to_csv('apartment_demo.csv', index=False, encoding='utf-8-sig')\n\nX = df[['area', 'floor']]\ny = df['price']\n# 앞선 80%로 학습하고 이후 20%를 평가\ncut = int(len(df) * 0.8)\nX_train, X_test = X.iloc[:cut], X.iloc[cut:]\ny_train, y_test = y.iloc[:cut], y.iloc[cut:]\n\nfor name, model in {\n    '평균 기준': DummyRegressor(strategy='mean'),\n    '선형회귀': LinearRegression()\n}.items():\n    model.fit(X_train, y_train)\n    pred = model.predict(X_test)\n    print(name)\n    print('MAE(만원):', round(mean_absolute_error(y_test, pred)))\n    print('RMSE(만원):', round(np.sqrt(mean_squared_error(y_test, pred))))\n    print('R²:', round(r2_score(y_test, pred), 3))\n`,
    quiz: [
      q(
        '거래금액 y로 만든 ㎡당 가격을 X에 넣으면?',
        ['항상 좋은 특성 추가', '정답을 간접적으로 알려주는 누출', '스케일링만 하면 해결'],
        1,
        '거래금액을 아직 모르는 예측 시점에 ㎡당 거래가격도 모릅니다. 정답 유래 특성은 제외해야 합니다.',
      ),
      q(
        '같은 구성인데 점포 수만 10배인 두 지역을 비슷하게 보고 싶다면?',
        ['지역명 숫자로 인코딩', '업종 비율표로 비교', '총점포 수만 사용'],
        1,
        '비율은 규모를 제거하고 상대적 구성에 초점을 맞춥니다. 규모 자체가 질문이면 개수도 의미가 있습니다.',
      ),
      q(
        '모델 RMSE가 작아 보일 때 확인할 것은?',
        ['평가 단위·기준 모델·분할·누출', '그래프 색만', '학습 점수만'],
        0,
        '금액 단위, 평균 기준과의 차이, 실제 사용에 맞는 평가, 정답 유출을 함께 확인해야 합니다.',
      ),
    ],
  },
];
