#!/bin/bash
echo "Setting up QuantumShield development environment..."

# Copy env file
if [ ! -f ../../.env ]; then
    cp ../../.env.example ../../.env
    echo "Created .env from .env.example"
fi

# Build and start Docker containers
echo "Starting Docker Compose..."
docker-compose -f ../../docker-compose.yml up -d --build

echo "Setup complete! QuantumShield is running."
echo "- Frontend: http://localhost"
echo "- API Gateway: http://localhost:8000"
echo "- Grafana: http://localhost:3001"
