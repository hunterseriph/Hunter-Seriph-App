// Gives the app page a safe way to ask the PC wrapper to update itself.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('hsDesktop', {
  canUpdate: () => ipcRenderer.invoke('update:can'),
  install: (url) => ipcRenderer.invoke('update:install', url),
  onProgress: (cb) => ipcRenderer.on('update:progress', (e, p) => cb(p))
});
