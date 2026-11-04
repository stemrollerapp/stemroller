#!/usr/bin/env bash
set -euo pipefail

# A stale Chromium singleton lock from a previous container would make the app quit immediately
rm -f "${HOME}/.config/stemroller"/Singleton*

# If DISPLAY is provided (e.g. host X11 socket mounted), use it; otherwise start a virtual display
if [ -z "${DISPLAY:-}" ]; then
  export DISPLAY=:99
  rm -f /tmp/.X99-lock /tmp/.X11-unix/X99

  Xvfb "${DISPLAY}" -screen 0 "${RESOLUTION:-1280x800}x24" -nolisten tcp &
  for _ in $(seq 1 50); do
    [ -S /tmp/.X11-unix/X99 ] && break
    sleep 0.1
  done

  openbox &

  vnc_auth=(-nopw)
  if [ -n "${VNC_PASSWORD:-}" ]; then
    x11vnc -storepasswd "${VNC_PASSWORD}" /tmp/.vncpasswd >/dev/null 2>&1
    vnc_auth=(-rfbauth /tmp/.vncpasswd)
  fi
  x11vnc -display "${DISPLAY}" -forever -shared -localhost -rfbport 5900 -quiet "${vnc_auth[@]}" &

  websockify --web /usr/share/novnc 6080 localhost:5900 &

  echo "StemRoller UI: http://localhost:${STEMROLLER_PORT:-6080}"
fi

exec /opt/electron/electron /app --disable-gpu "$@"
