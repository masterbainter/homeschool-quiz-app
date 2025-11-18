#!/bin/bash

# Start local development environment
# This script starts Firebase emulators for local development

echo "🚀 Starting Firebase Emulators..."
echo ""
echo "Your local development environment will be available at:"
echo "  📱 App:       http://localhost:5000"
echo "  🎛️  Dashboard: http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop the emulators"
echo ""

firebase emulators:start
