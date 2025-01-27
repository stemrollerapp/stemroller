import process from 'process'
import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import { pipeline } from 'stream/promises'
import fetch from 'node-fetch'
import extractZip from 'extract-zip'
import sevenBin from '7zip-bin'
import node7z from 'node-7z'

function extract7z(archivePath, outPath) {
  return new Promise((resolve, reject) => {
    const pathTo7zip = sevenBin.path7za
    const seven = node7z.extractFull(archivePath, outPath, {
      $bin: pathTo7zip,
    })
    seven.on('end', resolve)
    seven.on('error', reject)
  })
}

let winOrMac = null
let cudaSuffix = ''
let demucsZipOr7z = null
if (process.platform === 'win32') {
  winOrMac = 'win'
  cudaSuffix = '-cuda'
  demucsZipOr7z = '7z'
} else if (process.platform === 'darwin') {
  winOrMac = 'mac'
  demucsZipOr7z = 'zip'
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
      'https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/f7e0c4bc-ba3fe64a.th',
      path.join('anyos-extra-files', 'Models', 'f7e0c4bc-ba3fe64a.th'),
    ],
    [
      'https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/d12395a8-e57c48e6.th',
      path.join('anyos-extra-files', 'Models', 'd12395a8-e57c48e6.th'),
    ],
    [
      'https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/92cfc3b6-ef3bcb9c.th',
      path.join('anyos-extra-files', 'Models', '92cfc3b6-ef3bcb9c.th'),
    ],
    [
      'https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/04573f0d-f3cf25b2.th',
      path.join('anyos-extra-files', 'Models', '04573f0d-f3cf25b2.th'),
    ],
    [
      'https://raw.githubusercontent.com/facebookresearch/demucs/main/demucs/remote/htdemucs_ft.yaml',
      path.join('anyos-extra-files', 'Models', 'htdemucs_ft.yaml'),
    ],
    [
      'https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/955717e8-8726e21a.th',
      path.join('anyos-extra-files', 'Models', '955717e8-8726e21a.th'),
    ],
    [
      'https://raw.githubusercontent.com/facebookresearch/demucs/main/demucs/remote/htdemucs.yaml',
      path.join('anyos-extra-files', 'Models', 'htdemucs.yaml'),
    ],
    [
      'https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/5c90dfd2-34c22ccb.th',
      path.join('anyos-extra-files', 'Models', '5c90dfd2-34c22ccb.th'),
    ],
    [
      'https://raw.githubusercontent.com/facebookresearch/demucs/main/demucs/remote/htdemucs_6s.yaml',
      path.join('anyos-extra-files', 'Models', 'htdemucs_6s.yaml'),
    ],
    [
      `https://github.com/stemrollerapp/demucs-cxfreeze/releases/download/release-26a2baeb0058444b3cf87028d9df721d37c78dfb/demucs-cxfreeze-${winOrMac}${cudaSuffix}.${demucsZipOr7z}`,
      path.join(
        `${winOrMac}-extra-files`,
        'ThirdPartyApps',
        'demucs-cxfreeze',
        `demucs-cxfreeze-${winOrMac}${cudaSuffix}.${demucsZipOr7z}`
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
    const ext = path.extname(download[1])
    if (ext === '.zip' || ext === '.7z') {
      console.log(`Extracting: "${download[1]}"`)
      const dirName = path.dirname(download[1])
      const outDir = path.resolve(dirName)
      if (ext === '.zip') {
        await extractZip(download[1], { dir: outDir })
      } else {
        await extract7z(download[1], outDir)
      }
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
      `demucs-cxfreeze-${winOrMac}${cudaSuffix}`
    )
  )

  if (process.platform === 'win32') {
    await moveDirChildrenUpAndDeleteDir(
      path.join(
        `${winOrMac}-extra-files`,
        'ThirdPartyApps',
        'ffmpeg',
        'ffmpeg-7.1-essentials_build'
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
