#!/bin/bash

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo "Building with BuildKit enabled..."
docker-compose -f docker-compose.yml build "$@"
