#!/bin/bash

# 🏠 STEP 1: LOCAL DEVELOPMENT SETUP SCRIPT
# This script automates the local setup process

echo "🚀 Starting Local Development Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) is installed"

# Check if MySQL is running
print_status "Checking MySQL connection..."
if ! mysql -u root -p -e "SELECT 1;" &> /dev/null; then
    print_warning "MySQL connection failed. Please ensure MySQL is running and accessible."
    print_warning "You may need to start MySQL service or check credentials."
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "MySQL connection successful"
fi

# Install dependencies
print_status "Installing dependencies..."
if npm run install:all; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Create backend .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    print_status "Creating backend .env file..."
    cat > backend/.env << 'EOF'
# ========================================
# LOCAL DEVELOPMENT ENVIRONMENT
# ========================================

# Application Settings
NODE_ENV=development
PORT=5000

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters
JWT_EXPIRE=7d

# Database Configuration - LOCAL MYSQL
DATABASE_URL=mysql://root:your_password@localhost:3306/dashboard_app
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=dashboard_app

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional for local dev)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Settings - LOCAL STORAGE
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads

# Security Settings
HTTPS_ENABLED=false

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log

# Development Settings
DEBUG=true
SEED_DATABASE=true
AUTO_MIGRATE=true
EOF
    print_success "Backend .env file created"
    print_warning "Please edit backend/.env with your actual MySQL password and email credentials"
else
    print_status "Backend .env file already exists"
fi

# Create upload directories
print_status "Creating upload directories..."
mkdir -p backend/uploads/images
mkdir -p backend/uploads/evidence
mkdir -p backend/uploads/profiles
print_success "Upload directories created"

# Setup database
print_status "Setting up database..."
cd backend

# Generate Prisma client
if npx prisma generate; then
    print_success "Prisma client generated"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

# Create database tables
if npx prisma db push; then
    print_success "Database tables created"
else
    print_error "Failed to create database tables"
    print_warning "Please check your MySQL connection and credentials in .env file"
    exit 1
fi

# Seed database (optional)
read -p "Do you want to seed the database with sample data? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if npx prisma db seed; then
        print_success "Database seeded with sample data"
    else
        print_warning "Failed to seed database (this is optional)"
    fi
fi

cd ..

# Create frontend .env file if it doesn't exist
if [ ! -f "frontend/.env.local" ]; then
    print_status "Creating frontend .env.local file..."
    cat > frontend/.env.local << 'EOF'
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:5000/api
EOF
    print_success "Frontend .env.local file created"
else
    print_status "Frontend .env.local file already exists"
fi

print_success "Local development setup completed!"
echo
echo "📋 Next steps:"
echo "1. Edit backend/.env with your MySQL password and email credentials"
echo "2. Start the application: npm run dev"
echo "3. Access frontend at: http://localhost:3000"
echo "4. Access backend at: http://localhost:5000"
echo
echo "📚 For detailed setup instructions, see LOCAL_SETUP_GUIDE.md"
echo
echo "🎯 You are now ready for Step 1: Local Development!"
