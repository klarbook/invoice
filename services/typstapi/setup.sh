#!/bin/bash
set -e

echo "Setting up TypstAPI service..."

# Install dependencies
echo "Installing dependencies..."
bun install

# Pull the official Typst Docker image
echo "Pulling the official Typst Docker image..."
docker pull ghcr.io/typst/typst:latest

# Create data directory if it doesn't exist
mkdir -p data

echo "Setup complete! You can now start the service with:"
echo "  bun run dev    # Development mode with auto-reload"
echo "  bun run start  # Production mode"
echo 
echo "Or use Docker Compose:"
echo "  docker-compose up -d"