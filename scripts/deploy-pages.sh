#!/usr/bin/env bash
# Builds the app for GitHub Pages (served from /<repo>/) and force-pushes dist/ to the gh-pages branch.
set -euo pipefail
cd "$(dirname "$0")/.."
REMOTE=$(git remote get-url origin)
REPO=$(basename -s .git "$REMOTE")
BASE_PATH="/$REPO/" npm run build
# SPA fallback: Pages serves 404.html for deep links like /code/<id>.
cp dist/index.html dist/404.html
touch dist/.nojekyll
cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $(git -C .. rev-parse --short HEAD)"
git push -q -f "$REMOTE" gh-pages
rm -rf .git
echo "Deployed: https://$(dirname "$REMOTE" | xargs basename).github.io/$REPO/"
