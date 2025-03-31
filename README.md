# GameBalance Editor

`GameBalance Editor`는 Electron 기반의 데스크톱 애플리케이션으로, Unity 프로젝트에서 사용되는 `GameBalance.ini` 설정 파일을 직관적으로 편집할 수 있는 도구입니다. 게임의 난이도별 설정(예: Low, Medium, High)을 관리하며, 다국어 지원(한국어, 영어, 아랍어)을 통해 다양한 사용자가 접근할 수 있습니다.

## 주요 기능

- INI 파일 편집: 게임 설정값(적 체력, 드론 속도 등)을 테이블 형식으로 표시하고 수정 가능.
- 난이도별 파일 관리: "Low", "Medium", "High" 난이도별 INI 파일을 선택 및 전환.
- 다국어 지원: 한국어("하", "중", "상"), 영어("Low", "Medium", "High"), 아랍어("منخفض", "متوسط", "عالي")로 UI와 설명을 전환.
- 경로 설정: INI 파일이 위치한 디렉토리를 사용자 지정 가능.
- 선택된 난이도 강조: 현재 선택된 난이도 버튼을 색상으로 표시.
- 저장 및 초기화: 수정된 설정을 저장하거나 초기값으로 되돌리는 기능.

## 프로젝트 구조
GameBalance-Editor/
├── index.html        # 메인 UI 파일
├── style.css         # 스타일 정의
├── renderer.js       # 렌더러 프로세스 로직 (UI와 데이터 관리)
├── main.js           # 메인 프로세스 로직 (창 생성 및 IPC)
├── preload.js        # 보안 격리용 프리로드 스크립트 (현재 사용 안 함)
├── path-config.json  # INI 파일 경로 설정 저장
├── package.json      # 프로젝트 의존성 및 빌드 설정
└── icon.ico          # 애플리케이션 아이콘


## 설치 및 실행

### 요구사항
- Node.js (v16 이상 권장)
- npm

### 설치
1. 저장소를 클론합니다:
   bash
   git clone https://github.com/your-username/GameBalance-Editor.git
   cd GameBalance-Editor

2. 의존성을 설치합니다:
npm install


3. 실행
개발 모드에서 실행:
npm start

빌드된 실행 파일 생성:
npm run build

결과물은 dist 폴더에 생성되며, Windows용 ZIP 파일로 제공됩니다.

## 사용 방법
애플리케이션을 실행하면 기본적으로 GameBalance-low.ini가 로드됩니다.
상단 "경로 설정" 버튼을 눌러 INI 파일이 있는 디렉토리를 선택합니다.
"하/Low/منخفض", "중/Medium/متوسط", "상/High/عالي" 버튼으로 원하는 난이도를 선택합니다.
선택된 버튼은 파란색으로 표시됩니다.
테이블에서 값을 수정한 후 "저장" 버튼을 눌러 변경 사항을 저장합니다.
"초기화" 버튼으로 데이터를 초기값으로 되돌릴 수 있습니다.
드롭다운 메뉴로 언어를 변경하여 UI를 한국어, 영어, 아랍어로 전환할 수 있습니다.

## 기술 스택
Electron: 데스크톱 애플리케이션 프레임워크
Node.js: 파일 시스템 및 INI 파싱
JavaScript/HTML/CSS: UI 및 로직 구현
Dependencies:
electron-log: 로깅 기능
ini: INI 파일 파싱 및 생성
빌드 설정
플랫폼: Windows
포맷: ZIP (포터블 실행 파일 포함)
아이콘: icon.ico 사용


## 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은  파일을 참조하세요.