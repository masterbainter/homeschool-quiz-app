#!/bin/bash

# Check Firebase Usage Script
# Run this monthly to see your usage stats

echo "=================================================="
echo "Firebase & Anthropic Usage Check"
echo "=================================================="
echo ""

echo "📊 Firebase Functions List:"
firebase functions:list
echo ""

echo "📈 Recent Function Logs (last 10):"
firebase functions:log --limit 10
echo ""

echo "💰 To check detailed billing:"
echo "   Google Cloud: https://console.cloud.google.com/billing/$(gcloud config get-value project)/reports"
echo "   Anthropic: https://console.anthropic.com/settings/usage"
echo ""

echo "⚠️  Budget Alerts:"
echo "   Set up at: https://console.cloud.google.com/billing/budgets"
echo ""

echo "📝 Estimated costs per quiz: $0.03-$0.05"
echo "   Free Firebase tier should cover all hosting/database needs"
echo ""
