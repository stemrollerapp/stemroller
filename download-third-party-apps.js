import process from 'process'
import util from 'util'
import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import { pipeline } from 'stream/promises'
import fetch from 'node-fetch'
import extractZip from 'extract-zip'

let winOrMac = null
let macSuffix = ''
if (process.platform === 'win32') {
  winOrMac = 'win'
} else if (process.platform === 'darwin') {
  winOrMac = 'mac'
  macSuffix = '_sierra'
}

async function downloadFile(url, filePath) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Reponse error: ${response.statusText}`)
  }
  await pipeline(response.body, fs.createWriteStream(filePath))
}

async function fileExists(filePath) {
  try {
    await fsPromises.access(filePath, fs.constants.R_OK)
    return true
  } catch (err) {
    return false
  }
}

async function moveDirChildrenUpAndDeleteDir(dirName) {
  const parentDirName = path.resolve(path.join(dirName, '..'))
  const fileNames = await fsPromises.readdir(dirName)
  for (const fileName of fileNames) {
    const srcPath = path.join(dirName, fileName)
    const destPath = path.join(parentDirName, fileName)
    console.log(`Moving: "${srcPath}" to "${destPath}"`)
    if (await fileExists(destPath)) {
      console.log(`Deleting: "${destPath}"`)
      await fsPromises.rm(destPath, {
        force: true,
        recursive: true,
      })
      console.log(`Delete succeeded: "${destPath}"`)
    }
    await fsPromises.rename(srcPath, destPath)
    console.log(`Move succeeded: "${srcPath}" to "${destPath}"`)
  }

  console.log(`Deleting: "${dirName}"`)
  await fsPromises.rm(dirName, {
    force: true,
    recursive: true,
  })
  console.log(`Delete succeeded: "${dirName}"`)
}

async function main() {
  const downloads = [
    [
      'https://dl.fbaipublicfiles.com/demucs/mdx_final/83fc094f-4a16d450.th',
      path.join('anyos-extra-files', 'Models', '83fc094f-4a16d450.th'),
    ],
    [
      'https://dl.fbaipublicfiles.com/demucs/mdx_final/7fd6ef75-a905dd85.th',
      path.join('anyos-extra-files', 'Models', '7fd6ef75-a905dd85.th'),
    ],
    [
      'https://dl.fbaipublicfiles.com/demucs/mdx_final/14fc6a69-a89dd0ee.th',
      path.join('anyos-extra-files', 'Models', '14fc6a69-a89dd0ee.th'),
    ],
    [
      'https://dl.fbaipublicfiles.com/demucs/mdx_final/464b36d7-e5a9386e.th',
      path.join('anyos-extra-files', 'Models', '464b36d7-e5a9386e.th'),
    ],
    [
      'https://raw.githubusercontent.com/facebookresearch/demucs/main/demucs/remote/mdx_extra_q.yaml',
      path.join('anyos-extra-files', 'Models', 'mdx_extra_q.yaml'),
    ],
    [
      `https://github.com/stemrollerapp/demucs-cxfreeze/releases/download/1.0.0/demucs-cxfreeze-1.0.0-${winOrMac}${macSuffix}.zip`,
      path.join(
        `${winOrMac}-extra-files`,
        'ThirdPartyApps',
        'demucs-cxfreeze',
        `demucs-cxfreeze-1.0.0-${winOrMac}${macSuffix}.zip`
      ),
    ],
  ]

  if (process.platform === 'win32') {
    downloads.push([
      'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip',
      path.join(
        `${winOrMac}-extra-files`,
        'ThirdPartyApps',
        'ffmpeg',
        'ffmpeg-release-essentials.zip'
      ),
    ])
  } else if (process.platform === 'darwin') {
    downloads.push(
      [
        'https://evermeet.cx/ffmpeg/getrelease/zip',
        path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'ffmpeg-release.zip'),
      ],
      [
        'https://evermeet.cx/ffmpeg/getrelease/ffprobe/zip',
        path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'ffprobe-release.zip'),
      ]
    )
  }

  for (const download of downloads) {
    if (!(await fileExists(download[1]))) {
      console.log(`Downloading: "${download[0]}"`)
      await downloadFile(download[0], download[1])
      console.log(`Download successful! Saved "${download[0]}" to "${download[1]}"`)
    }
  }

  for (const download of downloads) {
    if (path.extname(download[1]) === '.zip') {
      console.log(`Extracting: "${download[1]}"`)
      const dirName = path.dirname(download[1])
      await extractZip(download[1], { dir: path.resolve(dirName) })
      console.log(`Extraction successful! Extracted "${download[1]}" to "${dirName}"`)
      console.log(`Deleting: "${download[1]}"`)
      await fsPromises.rm(download[1], {
        force: true,
        recursive: true,
      })
      console.log(`Delete succeeded: "${download[1]}"`)
    }
  }

  await moveDirChildrenUpAndDeleteDir(
    path.join(
      `${winOrMac}-extra-files`,
      'ThirdPartyApps',
      'demucs-cxfreeze',
      `demucs-cxfreeze-1.0.0-${winOrMac}${macSuffix}`
    )
  )

  if (process.platform === 'win32') {
    await moveDirChildrenUpAndDeleteDir(
      path.join(
        `${winOrMac}-extra-files`,
        'ThirdPartyApps',
        'ffmpeg',
        'ffmpeg-5.1-essentials_build'
      )
    )
  } else if (process.platform === 'darwin') {
    console.log('Moving: ffmpeg and ffprobe')
    await fsPromises.rename(
      path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'ffmpeg'),
      path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'bin', 'ffmpeg')
    )
    await fsPromises.rename(
      path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'ffprobe'),
      path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'bin', 'ffprobe')
    )
    console.log('Move successful: ffmpeg and ffprobe')
  }
}

main()
