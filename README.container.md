# Running StemRoller in a Container

StemRoller can run inside Docker. The container runs the Electron app on a virtual display (Xvfb) and serves it to your browser through [noVNC](https://novnc.com/), so you don't need a desktop environment, Python, or Demucs installed on the host.

## Requirements

- Docker Engine 23+ (or Docker Desktop) with BuildKit enabled
- Docker Compose v2 (`docker compose`)
- Several GB of free disk space for the image (PyTorch is large), plus room for Demucs models (downloaded on first use) and your stems

## Quick Start

From the repository root:

```sh
docker compose up --build
```

The first build takes a while because it installs PyTorch, Demucs, and the Electron runtime. When the container prints `StemRoller UI: http://localhost:6080`, open that URL in your browser.

To run it in the background instead:

```sh
docker compose up --build -d
docker compose logs -f stemroller   # follow the logs
docker compose down                 # stop it
```

## Using the App

- **YouTube links / search** work just like the desktop app. `yt-dlp` and its Deno runtime are bundled in the image.
- **Local files**: put audio files in `./docker-data/input` on the host. In the app's file dialog, open `/data/input` to select them.
- **Output**: split stems are written to `./docker-data/output` on the host.
- **Models**: the first split of each model downloads it into the `stemroller-models` volume. Later runs reuse it.

## Configuration

Set these environment variables in your shell or in a `.env` file next to `docker-compose.yml`:

| Variable                | Default                 | Description                                                         |
| ----------------------- | ----------------------- | ------------------------------------------------------------------- |
| `STEMROLLER_PORT`       | `6080`                  | Host port for the noVNC web UI                                      |
| `STEMROLLER_RESOLUTION` | `1280x800`              | Size of the virtual display (`WIDTHxHEIGHT`)                        |
| `VNC_PASSWORD`          | _(empty)_               | Password for the VNC session. If empty, no password is required.    |
| `STEMROLLER_OUTPUT`     | `./docker-data/output`  | Host directory where stems are saved                                |
| `STEMROLLER_INPUT`      | `./docker-data/input`   | Host directory mounted at `/data/input` for local songs             |
| `STEMROLLER_UID`        | `1000`                  | UID the app runs as. Match your host user so output files are yours |
| `STEMROLLER_GID`        | `1000`                  | GID the app runs as                                                 |

Example `.env`:

```sh
STEMROLLER_PORT=8080
STEMROLLER_RESOLUTION=1600x900
STEMROLLER_OUTPUT=/home/me/Music/Stems
STEMROLLER_UID=1001
STEMROLLER_GID=1001
```

Changing `STEMROLLER_UID` or `STEMROLLER_GID` requires a rebuild (`docker compose up --build`).

## Persistent Data

| Location                               | Contents                             |
| -------------------------------------- | ------------------------------------ |
| `STEMROLLER_OUTPUT` (bind mount)       | Split stems                          |
| `STEMROLLER_INPUT` (bind mount)        | Songs you want to split              |
| `stemroller-config` (named volume)     | App settings and finished-song list  |
| `stemroller-models` (named volume)     | Downloaded Demucs models             |

To reset settings and delete downloaded models:

```sh
docker compose down -v
```

## Security Notes

- The web UI is bound to `127.0.0.1` only, because the VNC session has no password by default. Anyone who can reach the port can control the app.
- If you expose it beyond localhost (for example by changing the port mapping to `0.0.0.0`), set `VNC_PASSWORD` and preferably put it behind a reverse proxy with TLS. VNC passwords are limited to 8 characters and are not strong protection on their own.
- The container is granted `SYS_ADMIN` so Chromium can create its renderer sandbox. If your environment forbids that capability, Electron falls back to its setuid `chrome-sandbox` helper.

## Troubleshooting

- **Blank or black screen**: wait a few seconds after startup and reload the page. Check `docker compose logs stemroller` for Electron errors.
- **App window is too small or cropped**: change `STEMROLLER_RESOLUTION` and restart the container. noVNC scales the display to fit the browser tab.
- **`Permission denied` writing stems**: the output directory on the host must be writable by `STEMROLLER_UID`/`STEMROLLER_GID`. Set them to your user's `id -u` / `id -g` and rebuild.
- **Splits crash or hang**: the compose file sets `shm_size: 2gb` for Chromium and PyTorch. Increase it, and make sure Docker has enough memory (Docker Desktop defaults can be too low; give it 8 GB or more).
- **Slow splits**: the default image runs Demucs on the CPU. Expect each song to take several minutes.
