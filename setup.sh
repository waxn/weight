#!/bin/bash

echo "🏋️ Setting up Workout Tracker..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up Convex..."
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not available. Please ensure npm is properly installed."
    exit 1
fi

echo "📝 Creating environment file..."
if [ ! -f .env.local ]; then
    cp env.example .env.local
    echo "✅ Created .env.local file. Please update it with your Convex deployment URL."
else
    echo "⚠️  .env.local already exists. Skipping creation."
fi

echo "🎨 Setting up Tailwind CSS..."
# Tailwind config is already created

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npx convex dev' to set up your Convex project"
echo "2. Update .env.local with your Convex deployment URL"
echo "3. Configure authentication in convex/auth.config.js"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "Happy coding! 💪"
