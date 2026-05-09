#!/bin/bash
# download-images.sh
# Run once: ./download-images.sh
# Downloads the 5 home-page images from Unsplash CDN into public/images/
# so the app can run offline 

set -e
mkdir -p public/images
cd public/images

echo "Downloading hero image..."
curl -L -o hero.jpg "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&q=85&auto=format&fit=crop"

echo "Downloading NBA image..."
curl -L -o nba.jpg "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1200&q=85&auto=format&fit=crop"

echo "Downloading NFL image..."
curl -L -o nfl.jpg "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1200&q=85&auto=format&fit=crop"

echo "Downloading MLB image..."
# Picked a different baseball photo since the previous URL was broken.
curl -L -o mlb.jpg "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=1200&q=85&auto=format&fit=crop"

echo "Downloading EPL image..."
curl -L -o epl.jpg "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=85&auto=format&fit=crop"

echo ""
echo "Done. Files saved to public/images/:"
ls -lh
