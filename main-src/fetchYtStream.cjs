const { Innertube, UniversalCache, ClientType, Log } = require('youtubei.js')

let innertubeInstance = null

module.exports.fetchYtStream = async (videoId) => {
  Log.setLevel(Log.Level.DEBUG)

  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: false,
      retrieve_player: true,
      client_type: ClientType.WEB,
    })
  }

  const ytStream = await yt.download(videoId, {
    type: 'audio',
    quality: 'best',
    format: 'mp4',
    client: ClientType.WEB,
  })

  return ytStream
}
