# StemRoller

StemRoller is the first free app which enables you to separate vocal and instrumental stems from any song with a single click! StemRoller uses Facebook's state-of-the-art [Demucs](https://github.com/facebookresearch/demucs) algorithm for demixing songs and integrates search results from YouTube.

Simply type the name/artist of any song into the search bar and click the **Split** button that appears in the results! You'll need to wait several minutes for splitting to complete. Once stems have been extracted, you'll see an **Open** button next to the song - click that to access your stems!

## Quick Start

Using StemRoller couldn't be easier - just head to the [StemRoller website](https://stemroller.com) or the [releases page](https://github.com/stemrollerapp/stemroller/releases) and download the latest version! That bundle includes everything you need to split stems. If, however, you want to get involved in StemRoller development, read on...

## Install Dependencies

```
git clone https://github.com/stemrollerapp/stemroller.git
cd stemroller
npm i -D
```

### Windows

- Download and extract the latest **release essentials** package from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) and places its contents in `stemroller\win-extra-files\ThirdPartyApps\ffmpeg`
- Download and extract the latest Windows release of [demucs-cxfreeze](https://github.com/stemrollerapp/demucs-cxfreeze/releases) and place its contents in `stemroller\win-extra-files\ThirdPartyApps\demucs-cxfreeze`

Make sure you now have at least these executable files in both the following locations:

- `stemroller\win-extra-files\ThirdPartyApps\ffmpeg\bin\ffmpeg.exe`
- `stemroller\win-extra-files\ThirdPartyApps\ffmpeg\bin\ffprobe.exe`
- `stemroller\win-extra-files\ThirdPartyApps\demucs-cxfreeze\demucs-cxfreeze.exe`

### macOS

- Download and extract the latest ffmpeg snapshot from [evermeet.cx](https://evermeet.cx/ffmpeg/) and place the `ffmpeg` executable inside `stemroller/mac-extra-files/ThirdPartyApps/ffmpeg/bin`
- Download and extract the latest macOS release of [demucs-cxfreeze](https://github.com/stemrollerapp/demucs-cxfreeze/releases) and place its contents in `stemroller/mac-extra-files/ThirdPartyApps/demucs-cxfreeze`

Make sure you now have at least these executable files in both the following locations:

- `stemroller/mac-extra-files/ThirdPartyApps/ffmpeg/bin/ffmpeg`
- `stemroller/mac-extra-files/ThirdPartyApps/ffmpeg/bin/ffprobe`
- `stemroller/mac-extra-files/ThirdPartyApps/demucs-cxfreeze/demucs-cxfreeze`

### Models

Download the following files:

- [https://dl.fbaipublicfiles.com/demucs/mdx_final/83fc094f-4a16d450.th](https://dl.fbaipublicfiles.com/demucs/mdx_final/83fc094f-4a16d450.th)
- [https://dl.fbaipublicfiles.com/demucs/mdx_final/7fd6ef75-a905dd85.th](https://dl.fbaipublicfiles.com/demucs/mdx_final/7fd6ef75-a905dd85.th)
- [https://dl.fbaipublicfiles.com/demucs/mdx_final/14fc6a69-a89dd0ee.th](https://dl.fbaipublicfiles.com/demucs/mdx_final/14fc6a69-a89dd0ee.th)
- [https://dl.fbaipublicfiles.com/demucs/mdx_final/464b36d7-e5a9386e.th](https://dl.fbaipublicfiles.com/demucs/mdx_final/464b36d7-e5a9386e.th)
- [https://raw.githubusercontent.com/facebookresearch/demucs/main/demucs/remote/mdx_extra_q.yaml](https://raw.githubusercontent.com/facebookresearch/demucs/main/demucs/remote/mdx_extra_q.yaml)

Place them inside the following directory: `stemroller/anyos-extra-files/Models`

## Run in Development Mode

`npm run dev`

## Production Build

### Windows

`npm run build:win`

### macOS

`npm run build:mac`

## License

Your choice of Public Domain (Unlicense) or MIT No Attribution - please read the [LICENSE](https://github.com/stemrollerapp/stemroller/blob/main/LICENSE) file for more information.
