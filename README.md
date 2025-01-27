# StemRoller

StemRoller is the first free app which enables you to separate vocal and instrumental stems from any song with a single click! StemRoller uses Facebook's state-of-the-art [Demucs](https://github.com/facebookresearch/demucs) algorithm for demixing songs and integrates search results from YouTube.

Simply type the name/artist of any song into the search bar and click the **Split** button that appears in the results! You'll need to wait several minutes for splitting to complete. Once stems have been extracted, you'll see an **Open** button next to the song - click that to access your stems!

_We also have a [Discord server](https://www.stemroller.com/chat) with update announcements and support_.

## Quick Start

Using StemRoller couldn't be easier - just head to the [StemRoller website](https://stemroller.com) or the [releases page](https://github.com/stemrollerapp/stemroller/releases) and download the latest version! That bundle includes everything you need to split stems. If, however, you want to get involved in StemRoller development, read on...

## Install Dependencies

```
git clone https://github.com/stemrollerapp/stemroller.git
cd stemroller
npm i -D
```

### Windows/macOS

`npm run download-third-party-apps`

### Linux (Not officially supported)

Install `ffmpeg` globally using your preferred package manager, and install `demucs` globally with `pip`.
If you get "Couldn't find appropriate backend" errors, try installing `libsox-dev`.

## Run in Development Mode

`npm run dev`

## Run in Production Mode

`npm run build:svelte && npm run start`

## Production Build

### Windows

`npm run build:win`

### macOS

`npm run build:mac`

## License

Your choice of Public Domain (Unlicense) or MIT No Attribution - please read the [LICENSE](https://github.com/stemrollerapp/stemroller/blob/main/LICENSE) file for more information.
