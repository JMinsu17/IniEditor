const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options)
});