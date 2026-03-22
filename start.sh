#!/bin/bash

# This script runs Docker Compose and automatically opens the web app in your browser

PORT=8088
URL="http://localhost:${PORT}/"

# Function to run in the background that waits for the server to be healthy
open_browser_when_ready() {
  echo "Waiting for the server to be ready..."
  for i in {1..30}; do
    # Check if the health endpoint is responding
    if curl -s http://localhost:${PORT}/api/health >/dev/null; then
      echo -e "\n✅ Server is ready! Opening ${URL} in your browser...\n"
      xdg-open "${URL}"
      return
    fi
    sleep 1
  done
  echo -e "\n⚠️ Timed out waiting for the server to start."
}

# Start the browser-opening function in the background
open_browser_when_ready &

# Start Docker Compose in the foreground (so you can see logs and stop it with Ctrl+C)
docker compose up
