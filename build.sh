set -e

apt-get update && apt-get install -y --no-install-recommends ffmpeg

pip install --upgrade pip
pip install -r requirements.txt

cd Website/frontend
npm install
npm run build
cd ../..
