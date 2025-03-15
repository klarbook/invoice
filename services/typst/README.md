# typst

A secure HTTP API service to render [Typst](https://typst.app/) templates with JSON data.

## Features

- RESTful API to render Typst templates with provided JSON data
- Secure isolation using Docker containers for each rendering job
- Limited to 10 concurrent rendering jobs by default (configurable)
- Clean job management with automatic container cleanup

## Requirements

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Bun](https://bun.sh/) (for local development)

## Installation

1. Clone this repository
2. Run the setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This will:

- Install dependencies
- Build the Typst renderer Docker image
- Create necessary directories
- Set proper permissions

Alternatively, you can do the setup manually:

```bash
# Install dependencies
bun install

# Build Docker image
docker build -t typst-renderer -f Dockerfile .

# Create data directory
mkdir -p data
```

## Running the API Service

### Using Docker Compose (Recommended for Production)

```bash
docker-compose up -d
```

This will:

- Build the API service container
- Start the API service on port 3000

### Running Locally (Development)

```bash
bun run dev
```

### Troubleshooting

If you encounter a "no such container" error, make sure the Typst renderer Docker image is built:

```bash
docker build -t typst-renderer -f Dockerfile .
```

## API Endpoints

### POST /render

Renders a Typst template with provided JSON data.

**Request Body**:

```json
{
  "template": "Your Typst template content here...",
  "data": {
    "title": "My Document",
    "content": "Hello, world!"
  }
}
```

**Response**:

- On success: The generated PDF document (Content-Type: application/pdf)
- On error: JSON error message

**Template JSON Access**:

Your Typst template should access the JSON data using:

```typst
#let data = json("data.json")

// Then access fields like:
Title: #data.title
Content: #data.content
```

**Example**:

```bash
curl -X POST http://localhost:3001/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "#let data = json(\"data.json\")\n\n= #data.title\n\n#data.content",
    "data": {
      "title": "My Document",
      "content": "Hello, world!"
    }
  }' \
  --output document.pdf
```

### GET /status

Returns the current status of the rendering service.

**Response**:

```json
{
  "activeRenders": 3,
  "maxConcurrentRenders": 10
}
```

### GET /health

Health check endpoint.

**Response**:

"OK" with status code 200 if the service is running.

## Configuration

The service can be configured using environment variables:

- `PORT`: HTTP server port (default: 3000)
- `MAX_CONCURRENT_RENDERS`: Maximum number of concurrent rendering jobs (default: 10)
- `DATA_DIR`: Directory for temporary job files (default: "./data")

## Security Considerations

- Each rendering job runs in its own isolated Docker container
- The official Typst Docker image is used for rendering
- Containers are automatically removed after rendering completes
- Temporary files are cleaned up after rendering

This project was created using `bun init`. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
