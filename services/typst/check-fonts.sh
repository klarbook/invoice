#!/bin/bash
set -e

curl -L -o inter.zip https://github.com/rsms/inter/releases/download/v3.19/Inter-3.19.zip
mkdir -p temp_font
unzip -o -q inter.zip -d temp_font
echo "Listing font directory structure:"
find temp_font -name "*.ttf" -o -name "*.otf"
rm -rf temp_font inter.zip