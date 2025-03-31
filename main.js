const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const log = require('electron-log')

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 1280,
    webPreferences: {
      nodeIntegration: true, // Node.js 기능 사용 가능
      contextIsolation: false, // 보안 설정 비활성화 (초보자용)
      preload: path.join(__dirname, 'preload.js') // preload 경로
    },
    icon: path.join(__dirname, 'icon.ico'),
    autoHideMenuBar: true, // 메뉴바 자동 숨김
  });
  // 최소 크기 설정 (너비 800px, 높이 600px)
  win.setMinimumSize(800, 600);

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();      
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// "경로 설정" 버튼에 대한 IPC 핸들러
ipcMain.on('open-directory-dialog', (event) => {
  const result = dialog.showOpenDialogSync(win, {
    properties: ['openDirectory']
  });
  event.reply('directory-selected', result ? result[0] : null);
});

// zip 파일 빌드 명령어: npx electron-builder --win zip