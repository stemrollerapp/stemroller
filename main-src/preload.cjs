const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('computeLocalFileHash', (path) =>
  ipcRenderer.invoke('computeLocalFileHash', path)
)
contextBridge.exposeInMainWorld('youtubeSearch', (query) =>
  ipcRenderer.invoke('youtubeSearch', query)
)
contextBridge.exposeInMainWorld('setProcessQueueItems', (videoId) =>
  ipcRenderer.invoke('setProcessQueueItems', videoId)
)
contextBridge.exposeInMainWorld('getVideoStatus', (videoId) =>
  ipcRenderer.invoke('getVideoStatus', videoId)
)
contextBridge.exposeInMainWorld('getVideoPath', (videoId) =>
  ipcRenderer.invoke('getVideoPath', videoId)
)
contextBridge.exposeInMainWorld('deleteVideoStatusAndPath', (videoId) =>
  ipcRenderer.invoke('deleteVideoStatusAndPath', videoId)
)
contextBridge.exposeInMainWorld('openStemsPath', (videoId) =>
  ipcRenderer.invoke('openStemsPath', videoId)
)
contextBridge.exposeInMainWorld('openDonate', () => ipcRenderer.invoke('openDonate'))
contextBridge.exposeInMainWorld('openSource', () => ipcRenderer.invoke('openSource'))
contextBridge.exposeInMainWorld('openChat', () => ipcRenderer.invoke('openChat'))
contextBridge.exposeInMainWorld('disableDonatePopup', () =>
  ipcRenderer.invoke('disableDonatePopup')
)
contextBridge.exposeInMainWorld('getOutputPath', () => ipcRenderer.invoke('getOutputPath'))
contextBridge.exposeInMainWorld('browseOutputPath', () => ipcRenderer.invoke('browseOutputPath'))
contextBridge.exposeInMainWorld('getPyTorchBackend', () => ipcRenderer.invoke('getPyTorchBackend'))
contextBridge.exposeInMainWorld('setPyTorchBackend', (backend) =>
  ipcRenderer.invoke('setPyTorchBackend', backend)
)

let handlers = new Map()
contextBridge.exposeInMainWorld(
  'setVideoStatusUpdateHandler',
  (videoId, componentName, handlerFunction) => {
    if (!handlers.has(videoId)) {
      handlers.set(videoId, new Map())
    }

    const components = handlers.get(videoId)
    if (handlerFunction) {
      components.set(componentName, handlerFunction)
    } else if (components.has(componentName)) {
      components.delete(componentName)
    }

    if (components.size === 0) {
      handlers.delete(videoId)
    }
  }
)
ipcRenderer.on('videoStatusUpdate', (event, message) => {
  if (handlers.has('__global')) {
    for (const handler of handlers.get('__global').values()) {
      handler(message)
    }
  }

  if (handlers.has(message.videoId)) {
    for (const handler of handlers.get(message.videoId).values()) {
      handler(message)
    }
  }
})

let donateUpdateHandler = null
contextBridge.exposeInMainWorld('setDonateUpdateHandler', (handlerFunction) => {
  donateUpdateHandler = handlerFunction
})
ipcRenderer.on('donateUpdate', (event, message) => {
  if (donateUpdateHandler) {
    donateUpdateHandler(message)
  }
})
