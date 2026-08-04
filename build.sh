#!/usr/bin/env bash
# Render build script – installs system dependencies and Python packages
set -e

# Install FFmpeg (required for voice audio playback)
apt-get update && apt-get install -y --no-install-recommends ffmpeg

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
