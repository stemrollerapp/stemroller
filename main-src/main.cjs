const { app, ipcMain, dialog, shell, Menu, BrowserWindow } = require('electron')
const fs = require('fs')
const fsPromises = require('fs/promises')
const path = require('path')
const compareVersions = require('compare-versions')
const fetch = require('electron-fetch').default
const xxhash = require('xxhash-wasm')
const ytSearch = require('yt-search')
const serve = require('electron-serve')
const Store = require('electron-store')
const processQueue = require('./processQueue.cjs')

let electronStore = null

const loadURL = serve({ directory: 'renderer-build' })

function handleComputeLocalFileHash(event, path) {
  return new Promise((resolve, reject) => {
    xxhash().then((hasher) => {
      const h64 = hasher.create64()
      const stream = fs.createReadStream(path)
      stream.on('error', (err) => reject(err))
      stream.on('data', (chunk) => h64.update(chunk))
      stream.on('end', () => resolve(h64.digest().toString(16).padStart(16, 0)))
    })
  })
}

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

async function handleOpenStemsPath(event, video) {
  const videoPath = processQueue.getVideoPath(video.videoId)

  let exists = null
  try {
    await fsPromises.access(videoPath)
    exists = true
  } catch (error) {
    processQueue.deleteVideoStatusAndPath(video.videoId)
    exists = false
  }

  if (exists) {
    await shell.openPath(videoPath)
    return 'found'
  } else {
    if (video.mediaSource === 'youtube') {
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
    } else if (video.mediaSource === 'local') {
      dialog.showMessageBoxSync(mainWindow, {
        type: 'warning',
        title: 'Folder Not Found',
        message: "The folder containing this song's stems has been moved or deleted. If you would like to split this song again, simply select the original local file or drag-and-drop it onto the StemRoller window."
      })

      return 'not-found'
    } else {
      throw new Error(`Invalid mediaSource: ${video.mediaSource}`)
    }
  }
}

async function handleOpenDonate() {
  await shell.openExternal('https://www.stemroller.com/donate')
  electronStore.set('canShowDonatePopup', false)
  mainWindow.webContents.send('donateUpdate', {
    showDonatePopup: false,
  })
}

async function handleOpenSource() {
  await shell.openExternal('https://www.stemroller.com/source')
}

async function handleOpenChat() {
  await shell.openExternal('https://www.stemroller.com/chat')
}

async function handleDisableDonatePopup() {
  electronStore.set('canShowDonatePopup', false)
  mainWindow.webContents.send('donateUpdate', {
    showDonatePopup: false,
  })
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
      sandbox: true,
      devTools: process.env.NODE_ENV === 'dev',
      preload: path.resolve(path.join(__dirname, 'preload.cjs')),
    },
  })

  processQueue.registerStatusUpdateCallback((message) => {
    mainWindow.webContents.send('videoStatusUpdate', message)
  })

  processQueue.registerDonateUpdateCallback((message) => {
    mainWindow.webContents.send('donateUpdate', message)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    checkForUpdates()
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

  if (process.env.STEMROLLER_RUN_FROM_SOURCE) {
    const port = process.env.PORT || 4173
    mainWindow.loadURL(`http://localhost:${port}`)
  } else {
    loadURL(mainWindow)
  }
}

async function checkForUpdates() {
  try {
    const remotePackageReq = await fetch('https://raw.githubusercontent.com/stemrollerapp/stemroller/main/package.json')
    const remotePackageJson = await remotePackageReq.json()

    const versionDifference = compareVersions(remotePackageJson.version, app.getVersion())

    if (versionDifference > 0) {
      const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['Yes', 'No'],
        title: 'Update available!',
        message: `An update is available! Would you like to visit the StemRoller website and download it now?\n\nYou are using: ${app.getVersion()}\nUpdated version: ${remotePackageJson.version}.`,
      })

      if (response === 0) {
        await shell.openExternal('https://www.stemroller.com')
      }
    }
  } catch (err) {
    console.error(`Update check failed: ${err}`)
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
    electronStore = new Store()
    processQueue.setElectronStore(electronStore)

    createWindow()

    ipcMain.handle('computeLocalFileHash', handleComputeLocalFileHash)
    ipcMain.handle('youtubeSearch', handleYouTubeSearch)
    ipcMain.handle('setProcessQueueItems', handleSetProcessQueueItems)
    ipcMain.handle('getVideoStatus', handleGetVideoStatus)
    ipcMain.handle('getVideoPath', handleGetVideoPath)
    ipcMain.handle('deleteVideoStatusAndPath', handleDeleteVideoStatusAndPath)
    ipcMain.handle('openStemsPath', handleOpenStemsPath)
    ipcMain.handle('openDonate', handleOpenDonate)
    ipcMain.handle('openSource', handleOpenSource)
    ipcMain.handle('openChat', handleOpenChat)
    ipcMain.handle('disableDonatePopup', handleDisableDonatePopup)
  })

  app.on('window-all-closed', async () => {
    await processQueue.setItems([])
    await processQueue.deleteTmpFolders()
    app.quit()
  })
}

app.enableSandbox()

if (process.env.NODE_ENV !== 'dev') {
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: 'StemRoller',
          submenu: [
            { label: 'Hide', accelerator: 'CmdOrCtrl+H', role: 'hide' },
            { label: 'Quit', accelerator: 'CmdOrCtrl+Q', role: 'quit' },
          ],
        },
        {
          label: 'Edit',
          submenu: [
            { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
            { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
            { type: 'separator' },
            { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
            { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
            { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
            { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
          ],
        },
      ])
    )
  } else {
    Menu.setApplicationMenu(null)
  }
}

if (app.requestSingleInstanceLock()) {
  main()
} else {
  app.quit()
}
