#!/bin/bash
set -e

echo "Starting TypstAPI server..."
cd "$(dirname "$0")"

# Check if server is already running
if pgrep -f "bun run.*index.ts" > /dev/null; then
  echo "Server is already running"
else
  # Start server in background
  nohup bun run index.ts > server.log 2>&1 &
  echo "Server started with PID $!"
  echo "Waiting for server to initialize..."
  sleep 2
fi

# Check if server is responding
curl -s http://localhost:3001/health > /dev/null
if [ $? -eq 0 ]; then
  echo "Server is ready at http://localhost:3001"
  echo "You can test the API with: bun test.js"
  echo "To stop the server: pkill -f 'bun run.*index.ts'"
else
  echo "Server failed to start. Check server.log for details."
  tail -n 20 server.log
fi