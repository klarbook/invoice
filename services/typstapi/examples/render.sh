#!/bin/bash
set -e

# Configuration
API_URL="http://localhost:3001/render"
OUTPUT_FILE="output.pdf"

# Check if template and data files are provided
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <template_file> <data_file> [output_file]"
  echo "Example: $0 template.typ data.json document.pdf"
  exit 1
fi

TEMPLATE_FILE=$1
DATA_FILE=$2

# Set custom output file if provided
if [ "$#" -eq 3 ]; then
  OUTPUT_FILE=$3
fi

# Check if files exist
if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "Error: Template file '$TEMPLATE_FILE' not found"
  exit 1
fi

if [ ! -f "$DATA_FILE" ]; then
  echo "Error: Data file '$DATA_FILE' not found"
  exit 1
fi

# Read template and data files
TEMPLATE=$(cat "$TEMPLATE_FILE")
DATA=$(cat "$DATA_FILE")

# Create JSON request payload
JSON_PAYLOAD=$(cat <<EOF
{
  "template": $(jq -Rs . <<< "$TEMPLATE"),
  "data": $(cat "$DATA_FILE")
}
EOF
)

echo "Sending request to $API_URL..."

# Send the request to the API
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD" \
  -o "$OUTPUT_FILE" \
  -w "\nStatus: %{http_code}\n"

# Check if the request was successful
if [ $? -eq 0 ] && [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
  echo "PDF successfully generated: $OUTPUT_FILE"
else
  echo "Error: Failed to generate PDF"
  
  # If the file exists but is actually an error JSON message
  if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
    if grep -q "error" "$OUTPUT_FILE"; then
      echo "Error response from server:"
      cat "$OUTPUT_FILE"
    fi
  fi
  
  exit 1
fi