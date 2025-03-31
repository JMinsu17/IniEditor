const fs = require('fs');
const ini = require('ini');
const path = require('path');
const log = require('electron-log');
const { ipcRenderer } = require('electron');

// path-config.json 파일 읽기: INI 파일 경로 설정을 저장하는 구성 파일
let config;
const configPath = path.join(process.cwd(), 'path-config.json');
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (err) {
  log.error('path-config.json 로드 실패:', err.message);
  config = { iniDir: process.cwd() }; // 기본 경로를 현재 작업 디렉토리로 설정
}

// 전역 변수 선언
let currentVersion = 'low'; // 현재 선택된 INI 파일 버전 (예: 'low', 'high')
let currentFilePath = path.join(config.iniDir, `GameBalance-${currentVersion}.ini`); // 현재 INI 파일 경로
let configData = {}; // INI 파일에서 파싱된 데이터를 저장
let initialConfigData = {}; // 초기 데이터를 저장하여 초기화에 사용
let hasUnsavedChanges = false; // 저장되지 않은 변경 사항 여부
let currentLanguage = 'ko'; // 기본 언어: 한국어

// 언어 팩 정의: UI와 설명을 다국어로 제공
const languagePacks = {
  ko: {
    title: '게임 난이도 편집기',
    section: '섹션',
    variable: '변수',
    value: '값',
    description: '설명',
    save: '저장',
    reset: '초기화',
    path: '경로 설정',
    levels: {
      low: '하',
      medium: '중',
      high: '상'
    },
    currentFile: '현재 파일',
    descriptions: {
      EnemyHp: '적 체력',
      EnemyDamage: '적 공격력',
      RpgDamage: 'RPG 적 공격력',
      EnemySpeed: '적 이동 속도',
      rEnemySpeed: 'RPG 적 이동 속도',
      MaxMoveAfterShots: '최대 사격 후 이동 횟수',
      DroneHp: '드론 체력',
      NumberOfZigs: '드론 좌우 이동 횟수',
      ZigZagAmplitude: '지그재그 폭',
      Duration: '드론 도착 시간',
      DroneDamage: '드론 데미지',
      InitialEnemyCount: '최초 생성 수',
      MaxEnemyCount: '최대 생성 수',
      MinEnemyCount: '최소 유지 수',
      RpgSpawnCount: 'RPG 적 생성 수',
      EnemySpawnWaitTime: '적 생성 대기 시간',
      DroneSpawnWaitTime: '드론 생성 대기 시간',
      CivilSpawnWaitTime: '민간인 생성 대기 시간',
      TrainerHp: '훈련 교관 체력',
      TargetSizeX: '표적지 크기 배율',
      IsRecording: '훈련 녹화 기능 활성화',
      VideoFilePath: '녹화 저장 경로',
      VideoResolution: '해상도 설정. 1: 원본, 2: 절반, 4: 1/4, 8: 1/8'
    }
  },
  en: {
    title: 'GameBalance Editor',
    section: 'Section',
    variable: 'Variable',
    value: 'Value',
    description: 'Description',
    save: 'Save',
    reset: 'Reset',
    path: 'Set Path',
    levels: {
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    },
    currentFile: 'Current File',
    descriptions: {
      EnemyHp: 'Enemy Health',
      EnemyDamage: 'Enemy Damage',
      RpgDamage: 'RPG Enemy Damage',
      EnemySpeed: 'Enemy Speed',
      rEnemySpeed: 'RPG Enemy Speed',
      MaxMoveAfterShots: 'Max Moves After Shots',
      DroneHp: 'Drone Health',
      NumberOfZigs: 'Number of Zigs',
      ZigZagAmplitude: 'Zigzag Amplitude',
      Duration: 'Duration',
      DroneDamage: 'Drone Damage',
      InitialEnemyCount: 'Initial Enemy Count',
      MaxEnemyCount: 'Max Enemy Count',
      MinEnemyCount: 'Min Enemy Count',
      RpgSpawnCount: 'RPG Spawn Count',
      EnemySpawnWaitTime: 'Enemy Spawn Wait Time',
      DroneSpawnWaitTime: 'Drone Spawn Wait Time',
      CivilSpawnWaitTime: 'Civilian Spawn Wait Time',
      TrainerHp: 'Trainer Health',
      TargetSizeX: 'Target Size X',
      IsRecording: 'Recording Enabled',
      VideoFilePath: 'Video File Path',
      VideoResolution: 'Video Resolution. 1: Original, 2: Half, 4: Quarter, 8: Eighth'
    }
  },
  ar: {
    title: 'محرر توازن اللعبة',
    section: 'القسم',
    variable: 'المتغير',
    value: 'القيمة',
    description: 'الوصف',
    save: 'حفظ',
    reset: 'إعادة تعيين',
    path: 'تعيين المسار',
    levels: {
      low: 'منخفض',
      medium: 'متوسط',
      high: 'عالي'
    },
    currentFile: 'الملف الحالي',
    descriptions: {
      EnemyHp: 'صحة العدو',
      EnemyDamage: 'ضرر العدو',
      RpgDamage: 'ضرر العدو RPG',
      EnemySpeed: 'سرعة العدو',
      rEnemySpeed: 'سرعة العدو RPG',
      MaxMoveAfterShots: 'الحد الأقصى للحركات بعد الطلقات',
      DroneHp: 'صحة الطائرة بدون طيار',
      NumberOfZigs: 'عدد الزيجات',
      ZigZagAmplitude: 'سعة الزيجزاج',
      Duration: 'المدة',
      DroneDamage: 'ضرر الطائرة بدون طيار',
      InitialEnemyCount: 'عدد الأعداء الأولي',
      MaxEnemyCount: 'الحد الأقصى لعدد الأعداء',
      MinEnemyCount: 'الحد الأدنى لعدد الأعداء',
      RpgSpawnCount: 'عدد ظهور RPG',
      EnemySpawnWaitTime: 'وقت انتظار ظهور العدو',
      DroneSpawnWaitTime: 'وقت انتظار ظهور الطائرة بدون طيار',
      CivilSpawnWaitTime: 'وقت انتظار ظهور المدنيين',
      TrainerHp: 'صحة المدرب',
      TargetSizeX: 'حجم الهدف X',
      IsRecording: 'تمكين التسجيل',
      VideoFilePath: 'مسار ملف الفيديو',
      VideoResolution: 'دقة الفيديو. 1: الأصلي، 2: النصف، 4: الربع، 8: الثمن'
    }
  }
};

// 경로 설정 함수: INI 파일이 위치한 디렉토리를 사용자 선택으로 변경
function setPath() {
  ipcRenderer.send('open-directory-dialog'); // 메인 프로세스에 디렉토리 선택 요청
  ipcRenderer.once('directory-selected', (event, newPath) => {
    if (newPath) {
      config.iniDir = newPath;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
      console.log(`경로 설정됨: ${newPath}`);
      currentFilePath = path.join(config.iniDir, `GameBalance-${currentVersion}.ini`);
      loadIni(currentVersion); // 새 경로로 파일 로드
    } else {
      console.log('경로 선택 취소됨');
    }
  });
}

// INI 파일 로드 함수: 지정된 버전의 INI 파일을 읽거나 기본값으로 생성
function loadIni(version) {
  currentVersion = version;
  currentFilePath = path.join(config.iniDir, `GameBalance-${currentVersion}.ini`);
  log.info(`파일 로드 시도: ${currentFilePath}`);

  try {
    const data = fs.readFileSync(currentFilePath, 'utf-8');
    configData = ini.parse(data);
    if (Object.keys(configData).length === 1 && configData[Object.keys(configData)[0]]) {
      configData = configData[Object.keys(configData)[0]]; // 단일 섹션일 경우 내부 객체로 이동
    }
    log.info(`파일 로드 성공: ${currentFilePath}`);
  } catch (err) {
    log.info(`파일 없음, 기본값으로 생성: ${currentFilePath}`);
    configData = {
      Enemy: {
        EnemyHp: '100',
        EnemyDamage: '10',
        RpgDamage: '10',
        EnemySpeed: '4',
        rEnemySpeed: '5',
        MaxMoveAfterShots: '8'
      },
      Drone: {
        DroneHp: '100',
        NumberOfZigs: '6',
        ZigZagAmplitude: '2',
        Duration: '8',
        DroneDamage: '10'
      },
      Spawn: {
        InitialEnemyCount: '20',
        MaxEnemyCount: '50',
        MinEnemyCount: '10',
        RpgSpawnCount: '10',
        EnemySpawnWaitTime: '2',
        DroneSpawnWaitTime: '10',
        CivilSpawnWaitTime: '10'
      },
      Trainer: {
        TrainerHp: '100'
      },
      Video: {
        IsRecording: 'False',
        VideoFilePath: 'C:/Users/USER/Unity Project/SaudiProject_2024/Assets',
        VideoResolution: '1'
      }
    };
    saveIni(); // 기본값으로 파일 생성
  }
  initialConfigData = JSON.parse(JSON.stringify(configData)); // 초기 데이터 백업
  hasUnsavedChanges = false;
  displayIni(); // UI에 데이터 표시
  updateCurrentFileDisplay(); // 현재 파일 정보 업데이트
}

// UI 표시 함수: INI 데이터를 테이블 형식으로 렌더링
function displayIni() {
  const pack = languagePacks[currentLanguage];
  let html = `<table><tr><th>${pack.section}</th><th>${pack.variable}</th><th>${pack.value}</th><th>${pack.description}</th></tr>`;
  for (const section in configData) {
    for (const key in configData[section]) {
      const value = configData[section][key];
      const description = pack.descriptions[key] || '설명 없음';
      let inputHtml = '';

      if (key === 'IsRecording') {
        inputHtml = `<input type="checkbox" ${value === 'True' ? 'checked' : ''} onchange="updateValue('${section}', '${key}', this.checked ? 'True' : 'False')">`;
      } else if (key === 'VideoResolution') {
        inputHtml = `
          <select onchange="updateValue('${section}', '${key}', this.value)">
            <option value="1" ${value === '1' ? 'selected' : ''}>1 (original)</option>
            <option value="2" ${value === '2' ? 'selected' : ''}>2 (1/2)</option>
            <option value="4" ${value === '4' ? 'selected' : ''}>4 (1/4)</option>
            <option value="8" ${value === '8' ? 'selected' : ''}>8 (1/8)</option>
          </select>`;
      } else {
        inputHtml = `<input type="text" value="${String(value)}" onchange="updateValue('${section}', '${key}', this.value)">`;
      }

      html += `
        <tr>
          <td>${section}</td>
          <td>${key}</td>
          <td>${inputHtml}</td>
          <td>${description}</td>
        </tr>`;
    }
  }
  html += '</table>';
  document.getElementById('content').innerHTML = html; // HTML 콘텐츠 업데이트
}

const buttons = {
  low: document.getElementById('lowBtn'),
  medium: document.getElementById('mediumBtn'),
  high: document.getElementById('highBtn')
};

// 선택된 버튼의 스타일을 업데이트하는 함수
function setSelectedButton(version) {
  // 모든 버튼에서 'selected' 클래스 제거 (기본 색상으로 돌아감)
  for (const btn in buttons) {
      buttons[btn].classList.remove('selected');
  }
  // 선택된 버튼에 'selected' 클래스 추가 (색상 변경)
  buttons[version].classList.add('selected');
}

// 버튼 클릭 이벤트 추가
buttons.low.addEventListener('click', () => {
  setSelectedButton('low'); // low 버튼 선택
  // 여기에 low 파일을 여는 로직 추가 가능
});

buttons.medium.addEventListener('click', () => {
  setSelectedButton('medium'); // medium 버튼 선택
  // 여기에 medium 파일을 여는 로직 추가 가능
});

buttons.high.addEventListener('click', () => {
  setSelectedButton('high'); // high 버튼 선택
  // 여기에 high 파일을 여는 로직 추가 가능
});

// 값 변경 함수: 사용자가 입력한 값으로 데이터를 업데이트하고 변경 상태 추적
function updateValue(section, key, value) {
  configData[section][key] = value;
  hasUnsavedChanges = true;
}

// INI 파일 저장 함수: 현재 데이터를 파일에 저장
function saveIni() {
  try {
    fs.writeFileSync(currentFilePath, ini.stringify(configData, { section: '' }), 'utf-8');
    log.info(`${currentFilePath}에 저장되었습니다!`);
  } catch (err) {
    log.error(`저장 실패: ${err.message}`);
  }
  hasUnsavedChanges = false;
}

// 초기화 함수: 데이터를 초기 상태로 되돌림
function resetIni() {
  configData = JSON.parse(JSON.stringify(initialConfigData));
  hasUnsavedChanges = false;
  displayIni();
  log.info('초기 값으로 되돌렸습니다!');
}

// 파일 전환 함수: 버전 변경 시 저장 여부를 확인 후 파일 로드
async function switchFile(version) {
  if (hasUnsavedChanges) {
    const result = await dialog.showMessageBoxSync({
      type: 'question',
      buttons: ['저장', '저장하지 않음', '취소'],
      message: '변경 사항을 저장하시겠습니까?',
      detail: `현재 파일: GameBalance-${currentVersion}.ini`
    });
    if (result === 0) { // 저장
      saveIni();
      loadIni(version);
    } else if (result === 1) { // 저장하지 않음
      loadIni(version);
    } else { // 취소
      return;
    }
  } else {
    loadIni(version);
  }
}

// 언어 변경 함수: 선택된 언어로 UI를 업데이트
function changeLanguage(lang) {
  currentLanguage = lang;
  const pack = languagePacks[lang];
  document.getElementById('title').textContent = pack.title;
  document.getElementById('saveBtn').textContent = pack.save;
  document.getElementById('resetBtn').textContent = pack.reset;
  document.getElementById('pathBtn').textContent = pack.path;
  document.getElementById('lowBtn').textContent = pack.levels.low;
  document.getElementById('mediumBtn').textContent = pack.levels.medium;
  document.getElementById('highBtn').textContent = pack.levels.high;
  document.getElementById('current-file').textContent = `${pack.currentFile}: GameBalance-${currentVersion}.ini`;
  displayIni(); // 테이블을 새 언어로 업데이트
}

// 현재 파일 정보 표시 함수
function updateCurrentFileDisplay() {
  const pack = languagePacks[currentLanguage];
  document.getElementById('current-file').textContent = `${pack.currentFile}: GameBalance-${currentVersion}.ini`;
}

// 초기 로드: 애플리케이션 시작 시 기본 설정으로 초기화
loadIni(currentVersion);
changeLanguage(currentLanguage);
setSelectedButton('low');