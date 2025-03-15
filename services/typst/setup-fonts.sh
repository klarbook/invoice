#!/bin/bash
set -e

echo "Setting up Inter font for Typst development..."

# Create fonts directory if it doesn't exist
mkdir -p resources/formats/typst/fonts

# Check if font already exists
if [ -f "resources/formats/typst/fonts/Inter-Regular.ttf" ]; then
  echo "Inter font already installed. Skipping download."
else
  echo "Downloading Inter font..."
  # Download Inter font
  curl -L -o inter.zip https://github.com/rsms/inter/releases/download/v3.19/Inter-3.19.zip
  
  # Create temporary directory
  mkdir -p temp_inter
  
  # Extract fonts (force overwrite)
  unzip -o -q inter.zip -d temp_inter
  
  # Copy non-variable static fonts to our fonts directory
  cp temp_inter/Inter\ Hinted\ for\ Windows/Desktop/Inter-*.ttf resources/formats/typst/fonts/
  
  # Clean up
  rm -rf temp_inter inter.zip
  
  echo "Inter font installed successfully."
fi

echo "Font setup complete!"