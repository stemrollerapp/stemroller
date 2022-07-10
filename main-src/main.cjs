const { app, ipcMain, dialog, shell, Menu, BrowserWindow } = require('electron')
const fs = require('fs/promises')
const path = require('path')
const ytSearch = require('yt-search')
const serve = require('electron-serve')
const Store = require('electron-store')
const processQueue = require('./processQueue.cjs')

const loadURL = serve({ directory: 'renderer-build' })

async function handleYouTubeSearch(event, query) {
  return JSON.parse(JSON.stringify(await ytSearch(query)))
}

async function handleSetProcessQueueItems(event, items) {
  await processQueue.setItems(items)
}

async function handleGetVideoStatus(event, videoId) {
  return processQueue.getVideoStatus(videoId)
}

async function handleGetVideoPath(event, videoId) {
  return processQueue.getVideoPath(videoId)
}

async function handleDeleteVideoStatusAndPath(event, videoId) {
  return processQueue.deleteVideoStatusAndPath(videoId)
}

async function handleOpenStemsPath(event, videoId) {
  const videoPath = processQueue.getVideoPath(videoId)

  let exists = null
  try {
    await fs.access(videoPath)
    exists = true
  } catch (error) {
    processQueue.deleteVideoStatusAndPath(videoId)
    exists = false
  }

  if (exists) {
    await shell.openPath(videoPath)
    return 'found'
  } else {
    const response = dialog.showMessageBoxSync(mainWindow, {
      type: 'warning',
      buttons: ['Yes', 'No'],
      title: 'Folder Not Found',
      message:
        "The folder containing this song's stems has been moved or deleted. Would you like to split this song again?",
    })

    if (response === 0) {
      return 'split'
    } else {
      return 'not-found'
    }
  }
}

let mainWindow = null
function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'StemRoller',
    show: false,
    backgroundColor: '#0F172A',
    minWidth: 640,
    minHeight: 480,
    width: 800,
    height: 600,
    webPreferences: {
      devTools: false,
      preload: path.resolve(path.join(__dirname, 'preload.cjs')),
    },
  })

  processQueue.registerStatusUpdateCallback((message) => {
    mainWindow.webContents.send('videoStatusUpdate', message)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (event) => {
    if (processQueue.isBusy()) {
      const response = dialog.showMessageBoxSync(mainWindow, {
        type: 'warning',
        buttons: ['Yes', 'No'],
        title: 'Confirm Quit',
        message:
          "StemRoller is busy processing your songs. If you quit now, you'll lose any progress on the song currently being processed. Are you sure you want to interrupt the splitting process and quit StemRoller?",
      })

      if (response === 1) {
        event.preventDefault()
      }
    }
  })

  if (process.env.NODE_ENV === 'dev') {
    const port = process.env.PORT || 3000
    mainWindow.loadURL(`http://localhost:${port}`)
  } else {
    loadURL(mainWindow)
  }
}

function main() {
  // No await here because we don't want to slow down application launch time waiting to be able to delete folders...
  processQueue.deleteTmpFolders()

  app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    } else {
      dialog.showMessageBoxSync({
        type: 'info',
        title: 'StemRoller is busy',
        message:
          'An instance of StemRoller is currently busy. Please wait a few moments before attempting to launch StemRoller again, or reboot your device if this problem persists.',
      })
    }
  })

  app.whenReady().then(() => {
    processQueue.setElectronStore(new Store())

    createWindow()

    ipcMain.handle('youtubeSearch', handleYouTubeSearch)
    ipcMain.handle('setProcessQueueItems', handleSetProcessQueueItems)
    ipcMain.handle('getVideoStatus', handleGetVideoStatus)
    ipcMain.handle('getVideoPath', handleGetVideoPath)
    ipcMain.handle('deleteVideoStatusAndPath', handleDeleteVideoStatusAndPath)
    ipcMain.handle('openStemsPath', handleOpenStemsPath)
  })

  app.on('window-all-closed', async () => {
    await processQueue.setItems([])
    await processQueue.deleteTmpFolders()
    app.quit()
  })
}

Menu.setApplicationMenu(null)
if (app.requestSingleInstanceLock()) {
  main()
} else {
  app.quit()
}
