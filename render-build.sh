#!/bin/bash

# Exit on error
set -e

echo "🔍 Node version:"
node --version

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building TypeScript..."
npm run build

echo "✅ Build completed successfully!"
