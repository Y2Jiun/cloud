@echo off
echo ========================================
echo 🚀 COMPLETE LOCAL SETUP - Scam Prevention System
echo ========================================
echo.

echo 📋 Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MySQL is running
echo 🔍 Checking MySQL connection...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL is not accessible. Please ensure MySQL is running.
    echo Windows: Start MySQL from Services
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!
echo.

echo 📦 Installing dependencies...
echo.

REM Install root dependencies
echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..
echo ✅ Dependencies installed successfully!
echo.

echo 🔧 Setting up environment...
echo.

REM Copy environment template
cd backend
if not exist .env (
    echo Creating .env file from template...
    copy env.template .env
    echo.
    echo ⚠️  IMPORTANT: Please edit backend/.env file with your database credentials
    echo.
    echo Required settings:
    echo - DATABASE_URL=mysql://root:your_password@localhost:3306/cloud
    echo - JWT_SECRET=your_super_secret_jwt_key_here
    echo.
    echo Press any key to continue after editing .env file...
    pause
) else (
    echo .env file already exists
)

echo.
echo 🗄️  Setting up database...
echo.

REM Generate Prisma client
echo Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

REM Create database tables
echo Creating database tables...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Failed to create database tables
    echo Please check your DATABASE_URL in .env file
    pause
    exit /b 1
)

REM Seed database with sample data
echo Seeding database with sample data...
call npx prisma db seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

cd ..
echo ✅ Database setup completed!
echo.

echo 🚀 Starting the application...
echo.

echo 📱 Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo 🌐 Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo 🎉 SETUP COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo 📊 Sample Users:
echo - Admin: admin@example.com / admin123
echo - Demo: user@example.com / user123
echo.
echo 📁 Database Studio: npx prisma studio
echo.
echo 🎯 Next Steps:
echo 1. Test the application in your browser
echo 2. Complete any missing features
echo 3. Test all functionality thoroughly
echo 4. Prepare for AWS deployment
echo.
echo Press any key to exit...
pause >nul
