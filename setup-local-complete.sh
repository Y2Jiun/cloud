#!/bin/bash

echo "========================================"
echo "🚀 COMPLETE LOCAL SETUP - Scam Prevention System"
echo "========================================"
echo

echo "📋 Checking prerequisites..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

# Check if MySQL is accessible
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not accessible. Please ensure MySQL is running."
    echo "Mac: brew services start mysql"
    echo "Linux: sudo systemctl start mysql"
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo

echo "📦 Installing dependencies..."
echo

# Install root dependencies
echo "Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install root dependencies"
    exit 1
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..
echo "✅ Dependencies installed successfully!"
echo

echo "🔧 Setting up environment..."
echo

# Copy environment template
cd backend
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp env.template .env
    echo
    echo "⚠️  IMPORTANT: Please edit backend/.env file with your database credentials"
    echo
    echo "Required settings:"
    echo "- DATABASE_URL=mysql://root:your_password@localhost:3306/cloud"
    echo "- JWT_SECRET=your_super_secret_jwt_key_here"
    echo
    echo "Press Enter to continue after editing .env file..."
    read
else
    echo ".env file already exists"
fi

echo
echo "🗄️  Setting up database..."
echo

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

# Create database tables
echo "Creating database tables..."
npx prisma db push
if [ $? -ne 0 ]; then
    echo "❌ Failed to create database tables"
    echo "Please check your DATABASE_URL in .env file"
    exit 1
fi

# Seed database with sample data
echo "Seeding database with sample data..."
npx prisma db seed
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

cd ..
echo "✅ Database setup completed!"
echo

echo "🚀 Starting the application..."
echo

# Start backend server in background
echo "📱 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Start frontend server in background
echo "🌐 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

cd ..

echo
echo "========================================"
echo "🎉 SETUP COMPLETED SUCCESSFULLY!"
echo "========================================"
echo
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo
echo "📊 Sample Users:"
echo "- Admin: admin@example.com / admin123"
echo "- Demo: user@example.com / user123"
echo
echo "📁 Database Studio: npx prisma studio"
echo
echo "🎯 Next Steps:"
echo "1. Test the application in your browser"
echo "2. Complete any missing features"
echo "3. Test all functionality thoroughly"
echo "4. Prepare for AWS deployment"
echo
echo "📱 Servers are running in background"
echo "To stop servers: kill $BACKEND_PID $FRONTEND_PID"
echo
echo "Press Enter to exit..."
read

# Cleanup on exit
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
