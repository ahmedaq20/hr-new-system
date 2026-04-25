#!/bin/sh

cd /app

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci
fi

echo "Building React app..."
npm run build

echo "Copying build files to volume..."
cp -r dist/* /output/

echo "Frontend build completed!"
