#!/usr/bin/env bash
# Build script for Render deployment

# Install dependencies
npm install

# Build the TypeScript project
npm run build

# Create a .npmrc file to skip installing dev dependencies in production
echo "production=true" > .npmrc

# Clean up any unnecessary files to reduce slug size
rm -rf src/ tsconfig.json .eslintrc .prettierrc
