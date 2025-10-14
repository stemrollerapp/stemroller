import { Innertube } from 'youtubei.js'

let searchInnertube = null

const setupSearchInnertube = async () => {
  if (searchInnertube) {
    return
  }

  searchInnertube = await Innertube.create({ retrieve_player: false })
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

export const fetchYtStream = async (videoId) => {
  //
  // TODO
  //
}
