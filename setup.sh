#!/bin/bash

echo "========================================="
echo "JIRA MetalCloud EM-MIS Setup"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  Please edit .env file and add your JIRA credentials:"
    echo "   - VITE_JIRA_BASE_URL"
    echo "   - VITE_JIRA_EMAIL"
    echo "   - VITE_JIRA_API_TOKEN"
    echo ""
else
    echo "ℹ️  .env file already exists"
    echo ""
fi

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "🔧 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
    echo ""
else
    echo "ℹ️  Git repository already initialized"
    echo ""
fi

echo "========================================="
echo "Setup Complete! 🎉"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your JIRA credentials"
echo "2. Run 'npm run dev' to start development server"
echo "3. Access http://localhost:3000 (password: metalcloud)"
echo ""
echo "To deploy to Vercel:"
echo "1. Push code to GitHub"
echo "2. Connect repository to Vercel"
echo "3. Add environment variables in Vercel dashboard"
echo ""
