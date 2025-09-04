@echo off
REM 🏠 STEP 1: LOCAL DEVELOPMENT SETUP SCRIPT (Windows)
REM This script automates the local setup process for Windows

echo 🚀 Starting Local Development Setup...

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

for /f "tokens=1,2,3 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% lss 18 (
    echo [ERROR] Node.js version must be 18 or higher. Current version: 
    node --version
    pause
    exit /b 1
)

echo [SUCCESS] Node.js is installed
node --version

REM Check if MySQL is accessible
echo [INFO] Checking MySQL connection...
echo Please enter your MySQL root password when prompted...
mysql -u root -p -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MySQL connection failed. Please ensure MySQL is running and accessible.
    echo [WARNING] You may need to start MySQL service or check credentials.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" (
        pause
        exit /b 1
    )
) else (
    echo [SUCCESS] MySQL connection successful
)

REM Install dependencies
echo [INFO] Installing dependencies...
call npm run install:all
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

REM Create backend .env file if it doesn't exist
if not exist "backend\.env" (
    echo [INFO] Creating backend .env file...
    (
        echo # ========================================
        echo # LOCAL DEVELOPMENT ENVIRONMENT
        echo # ========================================
        echo.
        echo # Application Settings
        echo NODE_ENV=development
        echo PORT=5000
        echo.
        echo # JWT Authentication
        echo JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters
        echo JWT_EXPIRE=7d
        echo.
        echo # Database Configuration - LOCAL MYSQL
        echo DATABASE_URL=mysql://root:your_password@localhost:3306/dashboard_app
        echo DB_HOST=localhost
        echo DB_PORT=3306
        echo DB_USER=root
        echo DB_PASSWORD=your_mysql_password
        echo DB_NAME=dashboard_app
        echo.
        echo # Frontend Configuration
        echo FRONTEND_URL=http://localhost:3000
        echo.
        echo # Email Configuration (Optional for local dev)
        echo EMAIL_HOST=smtp.gmail.com
        echo EMAIL_PORT=587
        echo EMAIL_USER=your_email@gmail.com
        echo EMAIL_PASS=your_app_password
        echo.
        echo # Rate Limiting
        echo RATE_LIMIT_WINDOW_MS=900000
        echo RATE_LIMIT_MAX_REQUESTS=100
        echo.
        echo # File Upload Settings - LOCAL STORAGE
        echo MAX_FILE_SIZE=5242880
        echo UPLOAD_DIR=uploads
        echo.
        echo # Security Settings
        echo HTTPS_ENABLED=false
        echo.
        echo # Logging
        echo LOG_LEVEL=info
        echo LOG_FILE_PATH=logs/app.log
        echo.
        echo # Development Settings
        echo DEBUG=true
        echo SEED_DATABASE=true
        echo AUTO_MIGRATE=true
    ) > backend\.env
    echo [SUCCESS] Backend .env file created
    echo [WARNING] Please edit backend\.env with your actual MySQL password and email credentials
) else (
    echo [INFO] Backend .env file already exists
)

REM Create upload directories
echo [INFO] Creating upload directories...
if not exist "backend\uploads\images" mkdir "backend\uploads\images"
if not exist "backend\uploads\evidence" mkdir "backend\uploads\evidence"
if not exist "backend\uploads\profiles" mkdir "backend\uploads\profiles"
echo [SUCCESS] Upload directories created

REM Setup database
echo [INFO] Setting up database...
cd backend

REM Generate Prisma client
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)
echo [SUCCESS] Prisma client generated

REM Create database tables
call npx prisma db push
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create database tables
    echo [WARNING] Please check your MySQL connection and credentials in .env file
    pause
    exit /b 1
)
echo [SUCCESS] Database tables created

REM Seed database (optional)
set /p SEED_DB="Do you want to seed the database with sample data? (y/n): "
if /i "%SEED_DB%"=="y" (
    call npx prisma db seed
    if %errorlevel% neq 0 (
        echo [WARNING] Failed to seed database (this is optional)
    ) else (
        echo [SUCCESS] Database seeded with sample data
    )
)

cd ..

REM Create frontend .env file if it doesn't exist
if not exist "frontend\.env.local" (
    echo [INFO] Creating frontend .env.local file...
    (
        echo # Frontend Environment Variables
        echo NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ) > frontend\.env.local
    echo [SUCCESS] Frontend .env.local file created
) else (
    echo [INFO] Frontend .env.local file already exists
)

echo.
echo [SUCCESS] Local development setup completed!
echo.
echo 📋 Next steps:
echo 1. Edit backend\.env with your MySQL password and email credentials
echo 2. Start the application: npm run dev
echo 3. Access frontend at: http://localhost:3000
echo 4. Access backend at: http://localhost:5000
echo.
echo 📚 For detailed setup instructions, see LOCAL_SETUP_GUIDE.md
echo.
echo 🎯 You are now ready for Step 1: Local Development!
echo.
pause
