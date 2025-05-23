// This file is partially copied from: https://github.com/LuanRT/BgUtils/blob/main/examples/node/index.ts

import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { Innertube, UniversalCache, Log } from 'youtubei.js'
import { BG } from 'bgutils-js'
import { JSDOM } from 'jsdom'
import electronFetch from 'electron-fetch'
const fetch = electronFetch.default

const REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo'

let cacheDir = null
let searchInnertube = null
let downloadInnertube = null

const createYtCacheDir = async () => {
  if (cacheDir) {
    return
  }

  cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), 'StemRoller-cache-'))
}

export const deleteYtCacheDir = async () => {
  if (!cacheDir) {
    return
  }

  try {
    await fs.rm(cacheDir, {
      recursive: true,
      maxRetries: 5,
      retryDelay: 1000,
    })
    console.log(`Deleted cache folder "${cacheDir}"`)
  } catch (error) {
    console.trace(error)
  }
}

const setupSearchInnertube = async () => {
  if (searchInnertube) {
    return
  }

  searchInnertube = await Innertube.create({ retrieve_player: false })
}

const setupDownloadInnertube = async () => {
  if (downloadInnertube) {
    return
  }

  await setupSearchInnertube()

  if (process.env.NODE_ENV === 'dev') {
    Log.setLevel(Log.Level.INFO)
  } else {
    Log.setLevel(Log.Level.WARNING)
  }

  const visitorData = searchInnertube.session.context.client.visitorData
  if (!visitorData) {
    throw new Error('Could not get visitorData')
  }

  const dom = new JSDOM()
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
  })

  const bgConfig = {
    fetch,
    globalObj: globalThis,
    identifier: visitorData,
    requestKey: REQUEST_KEY,
  }

  const bgChallenge = await BG.Challenge.create(bgConfig)
  if (!bgChallenge) {
    throw new Error('Could not get challenge')
  }

  const interpreterJavascript =
    bgChallenge.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue
  if (interpreterJavascript) {
    new Function(interpreterJavascript)()
  } else {
    throw new Error('Could not load VM')
  }

  const poTokenResult = await BG.PoToken.generate({
    program: bgChallenge.program,
    globalName: bgChallenge.globalName,
    bgConfig,
  })

  await createYtCacheDir()

  downloadInnertube = await Innertube.create({
    po_token: poTokenResult.poToken,
    visitor_data: visitorData,
    cache: new UniversalCache(true, cacheDir),
    generate_session_locally: true,
  })
}

export const fetchYtStream = async (videoId) => {
  await setupDownloadInnertube()

  const ytStream = await downloadInnertube.download(videoId, {
    type: 'audio',
    quality: 'best',
  })

  return ytStream
}

export const searchYt = async (query) => {
  await setupSearchInnertube()

  const innertubeResults = await searchInnertube.search(query, {
    type: 'video',
  })

  const plainResults = []

  for (const result of innertubeResults.results) {
    if (
      result.type !== 'Video' ||
      typeof result.video_id === 'undefined' ||
      typeof result.title === 'undefined' ||
      typeof result.title.text === 'undefined' ||
      typeof result.author === 'undefined' ||
      typeof result.author.name === 'undefined' ||
      typeof result.length_text === 'undefined' ||
      typeof result.length_text.text === 'undefined'
    ) {
      continue
    }

    plainResults.push({
      videoId: result.video_id,
      title: result.title.text,
      length_text: result.length_text.text,
      author: {
        name: result.author.name,
      },
    })
  }

  return plainResults
}
