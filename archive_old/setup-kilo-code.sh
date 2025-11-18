#!/bin/bash

echo "Setting up Kilo Code Codebase Indexing..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Start Qdrant using Docker Compose
echo "Starting Qdrant vector database..."
docker-compose up -d

# Wait for Qdrant to be ready
echo "Waiting for Qdrant to be ready..."
sleep 10

# Check if Qdrant is accessible
if curl -s http://localhost:6333/health > /dev/null; then
    echo "✅ Qdrant is running and accessible at http://localhost:6333"
    echo ""
    echo "Kilo Code codebase indexing should now work properly!"
    echo ""
    echo "Next steps:"
    echo "1. Reload VS Code"
    echo "2. Check Kilo Code extension settings in .vscode/settings.json"
    echo "3. Try using the codebase search feature in Kilo Code"
else
    echo "❌ Failed to connect to Qdrant. Please check the logs:"
    echo "docker-compose logs qdrant"
fi