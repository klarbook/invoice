# TypstAPI Examples

This directory contains examples for using the TypstAPI service.

## Files

- `template.typ`: A complex Typst template that uses JSON data
- `data.json`: Example JSON data for the template
- `simple.typ`: A minimal Typst template
- `simple.json`: Minimal JSON data for the simple template
- `demo.ts`: TypeScript example for calling the API
- `render.sh`: Bash script example for calling the API

## Using the Bash Script

The `render.sh` script provides a simple way to render Typst documents through the API:

```bash
# Make the script executable
chmod +x render.sh

# Basic usage
./render.sh simple.typ simple.json output.pdf

# With custom output file
./render.sh template.typ data.json complex_document.pdf
```

## Dependencies

The bash script requires:
- `jq` for JSON processing
- `curl` for making HTTP requests

Install them if not already available:

```bash
# On Debian/Ubuntu
apt-get install jq curl

# On macOS with Homebrew
brew install jq curl
```