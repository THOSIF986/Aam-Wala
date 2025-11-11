// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron');

// As an example, here we use the exposeInMainWorld API to expose the browsers 
// and node integration process to the renderer process. This allows us to 
// use the Node.js APIs in the renderer process without enabling nodeIntegration.

contextBridge.exposeInMainWorld('electronAPI', {
  // Dialog operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  
  // Auto-updater
  checkForUpdates: () => ipcRenderer.invoke('app:checkForUpdates'),
  
  // App information
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // System information
  getSystemInfo: () => ipcRenderer.invoke('system:getInfo'),
  
  // Notification
  showNotification: (title, body) => ipcRenderer.invoke('notification:show', title, body),
});

// You can expose other APIs here as needed
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  arch: process.arch,
  versions: process.versions,
});