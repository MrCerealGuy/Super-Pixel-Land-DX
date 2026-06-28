#!/bin/sh
git log -1 --format="const BUILD_VERSION = '%h %cd';" --date=format:%Y-%m-%d > version.js
echo "version.js updated: $(cat version.js)"
