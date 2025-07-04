// This file is partially copied from: https://github.com/LuanRT/BgUtils/blob/main/examples/node/index.ts

import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { Innertube, ProtoUtils, Utils, UniversalCache, Log } from 'youtubei.js'
import { BG, USER_AGENT } from 'bgutils-js'
import { JSDOM } from 'jsdom'

let cacheDir = null
let searchInnertube = null
let downloadInnertube = null
let downloadPoToken = null

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

  const visitorData = ProtoUtils.encodeVisitorData(
    Utils.generateRandomString(11),
    Math.floor(Date.now() / 1000)
  )
  downloadPoToken = await getPo(visitorData)

  await createYtCacheDir()

  downloadInnertube = await Innertube.create({
    po_token: downloadPoToken,
    visitor_data: visitorData,
    cache: new UniversalCache(true, cacheDir),
    generate_session_locally: true,
  })
}

export const fetchYtStream = async (videoId) => {
  await setupDownloadInnertube()

  const ytStream = await downloadInnertube.download(videoId, {
    type: 'audio',
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

const getPo = async (identifier) => {
  const dom = new JSDOM(
    '<!DOCTYPE html><html lang="en"><head><title></title></head><body></body></html>',
    {
      url: 'https://www.youtube.com/',
      referrer: 'https://www.youtube.com/',
      userAgent: USER_AGENT,
    }
  )
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    location: dom.window.location,
    origin: dom.window.origin,
  })
  if (!Reflect.has(globalThis, 'navigator')) {
    Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator })
  }

  const requestKey = 'O43z0dpjhgX20SCx4KAo'

  const bgConfig = {
    fetch,
    globalObj: globalThis,
    requestKey,
    identifier,
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

  return poTokenResult.poToken
}
