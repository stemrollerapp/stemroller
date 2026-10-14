# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: build the Svelte renderer and collect the Electron runtime
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS builder

WORKDIR /src

# youtubei.js is a git dependency locked to an ssh:// URL; fetch it over https instead
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && git config --global url."https://github.com/".insteadOf "ssh://git@github.com/" \
  && git config --global --add url."https://github.com/".insteadOf "git@github.com:"

COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY svelte.config.js vite.config.js postcss.config.js tailwind.config.js ./
COPY renderer-src ./renderer-src
COPY static ./static
RUN NODE_ENV=production npm run build:svelte

# Keep the Electron binaries, then drop everything that is only needed at build time
RUN cp -a node_modules/electron/dist /opt/electron \
  && npm prune --omit=dev

# ---------------------------------------------------------------------------
# Stage 2: runtime (Electron + Demucs + ffmpeg + yt-dlp + virtual display)
# ---------------------------------------------------------------------------
FROM python:3.11-slim-bookworm AS runtime

# The Demucs fork used by StemRoller requires torchaudio<2.2
ARG TORCH_VERSION=2.1.2
# CPU wheels by default; docker-compose.gpu.yml switches this to a CUDA index
ARG TORCH_INDEX_URL=https://download.pytorch.org/whl/cpu
# Same Demucs revision as download-third-party-apps.js
ARG DEMUCS_REF=a9a93426fb354000210451eecf667d8b8e1cf335
ARG UID=1000
ARG GID=1000

ENV DEBIAN_FRONTEND=noninteractive \
  PIP_NO_CACHE_DIR=1 \
  PIP_DISABLE_PIP_VERSION_CHECK=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONUTF8=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    # Audio tooling used by the app
    ffmpeg \
    # Electron/Chromium runtime libraries
    libgtk-3-0 libnss3 libasound2 libgbm1 libdrm2 libxss1 libxtst6 libxkbcommon0 \
    libatk1.0-0 libatk-bridge2.0-0 libcups2 libxcomposite1 libxdamage1 libxfixes3 \
    libxrandr2 libpango-1.0-0 libcairo2 libnotify4 libsecret-1-0 libx11-xcb1 \
    # Virtual display served to the browser through noVNC
    xvfb x11vnc novnc websockify openbox \
    # Lets the "Open" button show the stems folder inside the virtual display
    # (xdg-open needs `file` to detect that a path is a directory)
    xdg-utils pcmanfm file \
    fonts-liberation fonts-noto-cjk \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN pip install "torch==${TORCH_VERSION}" "torchaudio==${TORCH_VERSION}" --index-url "${TORCH_INDEX_URL}" \
  && pip install "numpy<2" soundfile "yt-dlp[default]" \
    "https://github.com/stemrollerapp/demucs/archive/${DEMUCS_REF}.tar.gz"

# JavaScript runtime required by yt-dlp for YouTube (same version the desktop builds bundle)
COPY --from=denoland/deno:bin-2.6.10 /deno /usr/local/bin/deno

RUN groupadd --gid "${GID}" stemroller \
  && useradd --uid "${UID}" --gid "${GID}" --create-home --shell /bin/bash stemroller \
  && mkdir -p \
    /home/stemroller/.config/stemroller \
    /home/stemroller/.cache/torch \
    /home/stemroller/Music/StemRoller \
    /data/input \
  && chown -R stemroller:stemroller /home/stemroller /data \
  # Xvfb runs unprivileged and cannot create its socket directory itself
  && install -d -m 1777 /tmp/.X11-unix

# Run the main window maximized and undecorated so it fills the browser tab
RUN sed -i '0,/<applications>/s||<applications><application class="stemroller" type="normal"><decor>no</decor><maximized>yes</maximized></application>|' \
    /etc/xdg/openbox/rc.xml \
  && printf '%s\n' '<!doctype html><meta http-equiv="refresh" content="0; url=vnc.html?autoconnect=true&resize=scale">' \
    > /usr/share/novnc/index.html

COPY --from=builder /opt/electron /opt/electron
# Fallback for hosts where unprivileged user namespaces are unavailable
RUN chown root:root /opt/electron/chrome-sandbox && chmod 4755 /opt/electron/chrome-sandbox

WORKDIR /app
COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/build ./renderer-build
COPY package.json ./
COPY main-src ./main-src
COPY docker/entrypoint.sh /usr/local/bin/stemroller-entrypoint
RUN chmod +x /usr/local/bin/stemroller-entrypoint

ENV NODE_ENV=production \
  RESOLUTION=1280x800

USER stemroller
EXPOSE 6080
VOLUME ["/home/stemroller/.config/stemroller", "/home/stemroller/.cache/torch", "/home/stemroller/Music/StemRoller"]

ENTRYPOINT ["stemroller-entrypoint"]
