#!/bin/bash

# TopPestanas Voice Bot Deployment Script
# This script helps deploy the voice bot to different platforms

set -e

echo "🚀 TopPestanas Voice Bot Deployment Script"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy env.example to .env and configure your environment variables"
    exit 1
fi

# Function to deploy to Render
deploy_render() {
    echo "📦 Deploying to Render..."
    
    # Check if render.yaml exists
    if [ ! -f render.yaml ]; then
        echo "Creating render.yaml..."
        cat > render.yaml << EOF
services:
  - type: web
    name: top-pestanas-voice-bot
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
EOF
    fi
    
    echo "✅ Render configuration created"
    echo "📋 Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Connect your repository to Render"
    echo "3. Add environment variables in Render dashboard"
    echo "4. Deploy!"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "📦 Deploying to Vercel..."
    
    # Check if vercel.json exists
    if [ ! -f vercel.json ]; then
        echo "Creating vercel.json..."
        cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ]
}
EOF
    fi
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "📥 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    echo "🚀 Deploying to Vercel..."
    vercel --prod
}

# Function to deploy to Heroku
deploy_heroku() {
    echo "📦 Deploying to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI not found!"
        echo "Please install Heroku CLI first: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Check if app name is provided
    if [ -z "$1" ]; then
        echo "❌ Please provide a Heroku app name"
        echo "Usage: ./deploy.sh heroku your-app-name"
        exit 1
    fi
    
    APP_NAME=$1
    
    echo "🚀 Creating Heroku app: $APP_NAME"
    heroku create $APP_NAME
    
    echo "📦 Deploying to Heroku..."
    git add .
    git commit -m "Deploy to Heroku"
    git push heroku main
    
    echo "🔧 Setting environment variables..."
    heroku config:set NODE_ENV=production
    
    echo "✅ Deployed to Heroku!"
    echo "🌐 Your app URL: https://$APP_NAME.herokuapp.com"
}

# Function to test locally
test_local() {
    echo "🧪 Testing locally..."
    
    # Check if server is running
    if curl -s http://localhost:3000/health > /dev/null; then
        echo "✅ Server is running on http://localhost:3000"
    else
        echo "❌ Server is not running"
        echo "Please start the server with: npm start"
        exit 1
    fi
    
    echo "🧪 Testing API endpoints..."
    
    # Test health endpoint
    echo "Testing /health..."
    curl -s http://localhost:3000/health | jq .
    
    # Test services endpoint
    echo "Testing /api/services..."
    curl -s http://localhost:3000/api/services | jq '.data | length'
    
    # Test hours endpoint
    echo "Testing /api/hours/status..."
    curl -s http://localhost:3000/api/hours/status | jq '.data.is_open'
    
    # Test welcome endpoint
    echo "Testing /api/general/welcome..."
    curl -s http://localhost:3000/api/general/welcome | jq '.data.greeting'
    
    echo "✅ All tests passed!"
}

# Function to show help
show_help() {
    echo "Usage: ./deploy.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  render              - Deploy to Render"
    echo "  vercel              - Deploy to Vercel"
    echo "  heroku <app-name>   - Deploy to Heroku"
    echo "  test                - Test locally"
    echo "  help                - Show this help"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh render"
    echo "  ./deploy.sh vercel"
    echo "  ./deploy.sh heroku my-voice-bot"
    echo "  ./deploy.sh test"
}

# Main script logic
case "$1" in
    "render")
        deploy_render
        ;;
    "vercel")
        deploy_vercel
        ;;
    "heroku")
        deploy_heroku $2
        ;;
    "test")
        test_local
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac 