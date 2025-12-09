#!/bin/bash
# SpotMap Docker Stop Script
# ⚠️ PROPRIETARY CODE - DO NOT DISTRIBUTE
# Gracefully stop Docker containers

set -e

echo "╔════════════════════════════════════════════════════╗"
echo "║     SpotMap Docker Stop                           ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Determine which compose file to use
COMPOSE_FILE="docker-compose.yml"
if [ "$1" = "prod" ] || [ "$1" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo "🔧 Using production compose file"
else
    echo "🔧 Using development compose file"
fi

echo ""
echo "⏹️  Stopping containers..."
docker-compose -f "$COMPOSE_FILE" down

echo ""
echo "✓ Containers stopped"

# Optional: Remove volumes
if [ "$2" = "-v" ] || [ "$2" = "--volumes" ]; then
    echo ""
    echo "🗑️  Removing volumes..."
    docker-compose -f "$COMPOSE_FILE" down -v
    echo "✓ Volumes removed"
fi

# Optional: Show remaining images
if [ "$3" = "--clean" ]; then
    echo ""
    echo "🧹 Cleaning up unused Docker resources..."
    docker system prune -f
    echo "✓ Cleanup completed"
fi

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║     ✅ Stop Complete!                             ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "Usage:"
echo "  ./docker-stop.sh              - Stop dev containers"
echo "  ./docker-stop.sh prod         - Stop production containers"
echo "  ./docker-stop.sh -v           - Stop and remove volumes"
echo "  ./docker-stop.sh prod -v      - Stop prod and remove volumes"
echo "  ./docker-stop.sh --clean      - Stop and cleanup unused resources"
echo ""
