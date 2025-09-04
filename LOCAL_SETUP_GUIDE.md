# 🏠 **STEP 1: LOCAL DEVELOPMENT SETUP GUIDE**

This guide will help you set up the entire system to work completely locally, including local file storage instead of cloud services.

## 📋 **Prerequisites**

Before starting, make sure you have:

- **Node.js** (v18 or higher)
- **MySQL** (8.0 or higher) installed and running locally
- **Git** for cloning the repository

## 🚀 **Step-by-Step Local Setup**

### **1. Clone and Install Dependencies**

```bash
# Clone the repository
git clone <your-repo-url>
cd material-kit-react-main

# Install all dependencies
npm run install:all
```

### **2. Database Setup (Local MySQL)**

```bash
# Start MySQL service
# Windows: Start MySQL service from Services
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql

# Connect to MySQL and create database
mysql -u root -p
CREATE DATABASE dashboard_app;
exit
```

### **3. Environment Configuration**

Create `backend/.env` file with local-only settings:

```env
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
# In development mode, OTPs will be logged to console if email not configured
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
# All files will be stored locally in backend/uploads/ directory

# Security Settings
HTTPS_ENABLED=false

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log

# Development Settings
DEBUG=true
SEED_DATABASE=true
AUTO_MIGRATE=true
```

### **4. Database Setup & Seeding**

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Seed with sample data (optional)
npx prisma db seed
```

### **5. Start the Application**

```bash
# From root directory
npm run dev
```

This will start:

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

## 📁 **Local File Storage Structure**

The system automatically creates these directories for local file storage:

```
backend/
├── uploads/
│   ├── images/          # General images
│   ├── evidence/        # Legal case evidence
│   └── profiles/        # User profile pictures
```

### **File Access URLs**

Files are served via these endpoints:

- **Images**: `http://localhost:5000/api/uploads/images/filename.jpg`
- **Evidence**: `http://localhost:5000/api/uploads/evidence/filename.pdf`
- **Profiles**: `http://localhost:5000/api/uploads/profiles/filename.png`

## 🔧 **Local Development Features**

### **What Works Locally:**

✅ **Complete Authentication System**

- User registration and login
- JWT-based authentication
- Password reset (OTP logged to console if email not configured)

✅ **Local File Uploads**

- Image uploads stored locally
- File validation and security
- Automatic directory creation

✅ **Local Database**

- MySQL running on localhost
- Prisma ORM for database operations
- Sample data seeding

✅ **Full Application Features**

- Scam reporting system
- Legal case management
- User role management
- Dashboard and analytics

### **What's Disabled for Local Development:**

❌ **Cloud Storage** - All files stored locally
❌ **Cloud Database** - Using local MySQL instead
❌ **Production Email** - OTPs logged to console
❌ **HTTPS** - HTTP only for local development

## 🧪 **Testing Local Setup**

### **1. Test File Uploads**

1. Go to http://localhost:3000
2. Sign up or log in
3. Try uploading a profile picture
4. Check `backend/uploads/profiles/` directory

### **2. Test Database**

1. Check if tables were created:

```bash
cd backend
npx prisma studio
```

2. Verify sample data exists

### **3. Test API Endpoints**

1. Backend health check: http://localhost:5000/api/health
2. File serving: http://localhost:5000/api/uploads/images/test.jpg

## 🐛 **Common Local Development Issues**

### **Database Connection Error**

```bash
# Check if MySQL is running
# Windows: Check Services app
# Mac: brew services list | grep mysql
# Linux: sudo systemctl status mysql

# Test connection
cd backend
node -e "console.log('Testing DB...'); require('./src/index.ts')"
```

### **Port Already in Use**

```bash
# Kill processes on ports 3000 and 5000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### **File Upload Issues**

```bash
# Check upload directories exist
ls -la backend/uploads/

# Check file permissions
chmod 755 backend/uploads/
```

## 📝 **Next Steps After Local Setup**

Once local development is working:

1. **Test all features** thoroughly
2. **Develop new features** using local setup
3. **Prepare for Step 2** (AWS RDS deployment)
4. **Document any issues** found during local development

## 🔄 **Switching Between Local and Cloud**

### **To Switch to Cloud (Step 2 & 3):**

1. Update `backend/.env` with cloud credentials
2. Change `DATABASE_URL` to AWS RDS endpoint
3. Enable cloud storage (S3/Cloudinary)
4. Update frontend API endpoints

### **To Switch Back to Local:**

1. Update `backend/.env` with local settings
2. Change `DATABASE_URL` to localhost
3. Disable cloud storage
4. Restart both servers

## 📚 **Additional Resources**

- **Backend Documentation**: `backend/README.md`
- **Frontend Documentation**: `frontend/README.md`
- **Database Schema**: `backend/prisma/schema.prisma`
- **API Routes**: `backend/src/routes/`

---

## 🎯 **Current Status: STEP 1 COMPLETE**

✅ **Local Development Environment**: Ready
✅ **Local File Storage**: Configured
✅ **Local Database**: MySQL configured
✅ **Local Authentication**: Working
✅ **No Cloud Dependencies**: All local

**Next**: Ready to develop and test locally before moving to Step 2 (AWS RDS deployment)
