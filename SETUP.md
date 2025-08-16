# 🚀 Complete Setup Guide

This guide will help you set up the Material Kit React Dashboard from scratch.

## 📋 Prerequisites

Before you start, make sure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MySQL** database (local installation or cloud service)
- **Gmail account** (for email functionality)
- **Cloudinary account** (for image uploads) - [Sign up here](https://cloudinary.com/)

## 🛠️ Step-by-Step Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd material-kit-react-main

# Install dependencies for both frontend and backend
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Database Setup

#### Option A: Local MySQL
1. Install MySQL on your computer
2. Create a database named `cloud`:
   ```sql
   CREATE DATABASE cloud;
   ```

#### Option B: Cloud Database (Recommended)
- Use services like PlanetScale, AWS RDS, or Google Cloud SQL
- Create a database named `cloud`

### Step 3: Environment Configuration

1. **Copy the environment template:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit the `.env` file with your actual values:**

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/cloud"
# Replace with your actual database credentials

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=7d

# Cloudinary Configuration (Get from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### Step 4: Gmail App Password Setup

**This is required for the forgot password feature to work:**

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/
   - Click on "Security" in the left sidebar

2. **Enable 2-Step Verification:**
   - Under "How you sign in to Google", click "2-Step Verification"
   - Follow the setup process if not already enabled

3. **Create App Password:**
   - Scroll down and click "App passwords"
   - Select "Mail" for the app
   - Select "Other (custom name)" for the device
   - Enter "Dashboard App" as the name
   - Click "Generate"

4. **Copy the App Password:**
   - Google will show a 16-character password like: `abcd efgh ijkl mnop`
   - Copy this password (without spaces) to your `.env` file:
   ```env
   EMAIL_PASS=abcdefghijklmnop
   ```

### Step 5: Cloudinary Setup

1. **Sign up at Cloudinary:**
   - Go to https://cloudinary.com/
   - Create a free account

2. **Get your credentials:**
   - Go to your dashboard
   - Copy the Cloud Name, API Key, and API Secret
   - Add them to your `.env` file

### Step 6: Database Migration

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Optional: View your database
npx prisma studio
```

### Step 7: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## ✅ Testing the Setup

### 1. Test Basic Functionality
- Go to http://localhost:3000
- Try to register a new account
- Login with your credentials

### 2. Test Password Reset
- Go to login page
- Click "Forgot password?"
- Enter your email address
- Check your email for the OTP code
- Complete the password reset flow

### 3. Test Profile Upload
- Login to your account
- Go to profile page
- Try uploading a profile picture

## 🐛 Troubleshooting

### Common Issues:

**1. Database Connection Error:**
```
Error: P1001: Can't reach database server
```
- Check if MySQL is running
- Verify DATABASE_URL in .env file
- Test connection with a MySQL client

**2. Email Not Sending:**
```
Error sending OTP email
```
- Verify Gmail App Password is correct
- Check EMAIL_USER and EMAIL_PASS in .env
- Make sure 2-Step Verification is enabled

**3. Image Upload Fails:**
```
Cloudinary upload error
```
- Check Cloudinary credentials in .env
- Verify your Cloudinary account is active

**4. CORS Errors:**
```
Access to fetch blocked by CORS policy
```
- Check FRONTEND_URL in backend .env
- Restart both servers

**5. JWT Errors:**
```
Invalid token
```
- Make sure JWT_SECRET is set in .env
- Clear browser localStorage and try again

### Development Mode Notes:

- **Email Testing:** If you don't set up Gmail, OTP codes will be printed in the backend console
- **Database:** You can use `npx prisma studio` to view/edit database records
- **Logs:** Check both frontend and backend console for error messages

## 🎉 You're Ready!

If everything is working:
- ✅ You can register/login
- ✅ Password reset emails are sent
- ✅ Profile pictures upload successfully
- ✅ No console errors

Your dashboard is now fully functional! 🚀

## 📞 Need Help?

If you're still having issues:
1. Check the console logs (both frontend and backend)
2. Verify all environment variables are set correctly
3. Make sure all required services are running
4. Try the troubleshooting steps above
