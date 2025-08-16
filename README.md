# Material Kit React Dashboard

A modern, full-stack dashboard application built with React, Node.js, and MySQL with complete authentication system including password reset functionality.

## Project Structure

```
├── frontend/          # React.js frontend application
├── backend/           # Node.js Express backend API
├── shared/            # Shared types and utilities
└── docs/              # Documentation
```

## Tech Stack

### Frontend

- React.js 19
- Material-UI (MUI)
- TypeScript
- Vite (for faster development)

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication

### Database

- PlanetScale MySQL
- Prisma as ORM

### File Storage

- Cloudinary for image uploads

## ⚡ Quick Start (For Experienced Developers)

```bash
# 1. Clone and install
git clone https://github.com/Y2Jiun/cloud.git
cd cloud
npm install && cd backend && npm install && cd ../frontend && npm install && cd ..

# 2. Setup environment
cd backend && cp .env.example .env
# Edit .env with your database, Gmail, and Cloudinary credentials

# 3. Setup database
npx prisma generate && npx prisma db push

# 4. Start development servers
# Terminal 1:
cd backend && npm run dev
# Terminal 2:
cd frontend && npm run dev
```

**Access:** Frontend at http://localhost:3000, Backend at http://localhost:5000

**Need detailed setup?** See the complete guide below ⬇️

## Development Commands

- `npm run dev` - Run both frontend and backend
- `npm run dev:backend` - Run only backend
- `npm run dev:frontend` - Run only frontend
- `npm run build` - Build both for production
- `npm run start` - Start production servers

## Environment Variables Required

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/cloud"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### Frontend (.env)

```
VITE_API_URL="http://localhost:5000/api"
```

## 🚀 Features

- **Complete Authentication System**: Register, Login, Logout
- **Password Reset with OTP**: Email-based password recovery
- **User Profile Management**: Update profile with image upload
- **Email Integration**: Gmail SMTP for password reset emails
- **Secure**: JWT authentication, bcrypt password hashing
- **Modern UI**: Material-UI components with responsive design
- **File Upload**: Cloudinary integration for image uploads
- **Type-safe**: Full TypeScript implementation

## 📧 Gmail Setup for Password Reset

For the forgot password feature to work, you need to set up a Gmail App Password:

1. **Enable 2-Step Verification:**

   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Click "Security" → "2-Step Verification"
   - Follow the setup process if not already enabled

2. **Create App Password:**

   - In Security settings, click "App passwords"
   - Select "Mail" and "Other (custom name)"
   - Enter "Dashboard App" as the name
   - Copy the 16-character password to your `.env` file

3. **Update .env file:**
   ```env
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

## 🔧 Development Notes

### Email Service

- In development mode, if email credentials are not configured, OTPs will be logged to the console
- Check the backend terminal for OTP codes during testing

### Password Reset Flow

1. User enters email → Backend sends OTP to email
2. User enters OTP → Backend verifies and returns reset token
3. User sets new password → Backend updates password with token

## 🚀 For Other Developers - Complete Setup Guide

When someone clones this repository, here's the complete step-by-step setup:

### 📋 Prerequisites

Before starting, make sure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MySQL** database (local installation or cloud service)
- **Gmail account** (for password reset emails)
- **Cloudinary account** (for image uploads) - [Sign up here](https://cloudinary.com/)

### 🛠️ Step-by-Step Setup Commands

#### 1. Clone the Repository

```bash
git clone https://github.com/Y2Jiun/cloud.git
cd cloud
```

#### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Go back to root
cd ..
```

#### 3. Database Setup

**Option A: Local MySQL (Recommended for Development)**

```bash
# Create database in MySQL
mysql -u root -p
CREATE DATABASE cloud;
exit
```

**Option B: AWS RDS MySQL (For Cloud Deployment)**

- Follow the guide in `AWS_RDS_SETUP.md`

#### 4. Environment Configuration

```bash
# Copy environment template
cd backend
cp .env.example .env
```

**Edit the `.env` file with your actual values:**

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration (Choose one)
# Local MySQL:
DATABASE_URL="mysql://root:your-password@localhost:3306/cloud"

# AWS RDS MySQL:
# DATABASE_URL="mysql://admin:your-password@your-rds-endpoint.amazonaws.com:3306/cloud"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=7d

# Cloudinary Configuration (Get from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

#### 5. Gmail App Password Setup (For Password Reset Feature)

```bash
# Follow these steps:
# 1. Go to https://myaccount.google.com/
# 2. Click "Security" → "2-Step Verification" (enable if not already)
# 3. Click "App passwords"
# 4. Select "Mail" and "Other (custom name)"
# 5. Enter "Dashboard App" as the name
# 6. Copy the 16-character password to your .env file
```

#### 6. Cloudinary Setup

```bash
# 1. Sign up at https://cloudinary.com/
# 2. Go to your dashboard
# 3. Copy Cloud Name, API Key, and API Secret
# 4. Add them to your .env file
```

#### 7. Database Migration

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Optional: Seed with sample data
npx prisma db seed
```

#### 8. Start the Application

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend (in new terminal)
cd frontend
npm run dev
```

#### 9. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database Studio**: `npx prisma studio` (optional)

### ✅ Testing Your Setup

1. **Test Registration**: Go to http://localhost:3000 and create an account
2. **Test Login**: Sign in with your credentials
3. **Test Password Reset**: Use "Forgot password?" feature
4. **Test Profile Upload**: Upload a profile picture
5. **Check Console**: No errors in browser or terminal

### 🐛 Common Issues & Solutions

**Database Connection Error:**

```bash
# Check if MySQL is running
# Verify DATABASE_URL in .env file
# Test connection:
cd backend
node -e "console.log('Testing DB...'); require('./src/index.ts')"
```

**Email Not Sending:**

```bash
# In development mode, OTP will be logged to console
# Check backend terminal for OTP codes
# Verify Gmail App Password is correct
```

**CORS Errors:**

```bash
# Make sure FRONTEND_URL is set correctly in backend/.env
# Restart both servers
```

**Port Already in Use:**

```bash
# Kill processes on ports 3000 and 5000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### 📁 Project Structure

```
cloud/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Authentication middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Email service
│   │   └── utils/           # Utility functions
│   ├── prisma/             # Database schema & migrations
│   ├── .env.example        # Environment template
│   └── package.json
├── frontend/               # React.js Next.js app
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # React components
│   │   └── lib/            # Client libraries
│   └── package.json
├── README.md              # This file
├── SETUP.md              # Detailed setup guide
└── AWS_RDS_SETUP.md      # AWS RDS migration guide
```

### 🤝 Contributing & Development Workflow

#### Working on Features

```bash
# Switch to derrick branch for development
git checkout derrick

# Make your changes, then commit
git add .
git commit -m "Add: your feature description"
git push origin derrick

# Switch back to main when needed
git checkout main
```

#### Syncing with Latest Changes

```bash
# Pull latest changes from main
git checkout main
git pull origin main

# Merge into your branch
git checkout derrick
git merge main
```

### 🆘 Need Help?

- **Setup Issues**: Check the troubleshooting section above
- **Feature Questions**: Review the code in `backend/src/controllers/`
- **Database Issues**: Use `npx prisma studio` to inspect data
- **Email Testing**: Check backend console for OTP codes in development

### 📄 Additional Documentation

- `SETUP.md` - Detailed setup guide with screenshots
- `AWS_RDS_SETUP.md` - Guide for deploying to AWS RDS
- `backend/README.md` - Backend-specific documentation
- `frontend/README.md` - Frontend-specific documentation

## Development Setup

See individual README files in frontend/ and backend/ directories for detailed setup instructions.
