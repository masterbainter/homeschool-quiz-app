#!/bin/bash

# Deployment script for AI Quiz Generation

echo "🚀 Deploying AI Quiz Generation to Firebase..."
echo ""

# Check if logged in
echo "Step 1: Checking Firebase login..."
if ! firebase projects:list > /dev/null 2>&1; then
    echo "❌ Not logged in to Firebase"
    echo "Running: firebase login"
    firebase login
fi

echo "✅ Firebase login confirmed"
echo ""

# Set API key
echo "Step 2: Configuring API key..."
echo "Enter your Anthropic API key:"
read -r API_KEY

if [ -z "$API_KEY" ]; then
    echo "❌ No API key provided. Exiting."
    exit 1
fi

firebase functions:config:set anthropic.key="$API_KEY"

echo ""
echo "Step 3: Deploying function..."
firebase deploy --only functions

echo ""
echo "✨ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://school.bainter.xyz/admin"
echo "2. Click 'Add New Quiz'"
echo "3. Enter a book title and click 'Generate Quiz'"
echo "4. Wait 15-30 seconds for AI to generate questions"
echo "5. Review and edit as needed, then save!"
echo ""
echo "Cost: ~$0.015 per quiz (~1.5 cents)"
