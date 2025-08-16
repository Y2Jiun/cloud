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

## Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Environment Variables

```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Set up Database

- Create PlanetScale database (or AWS RDS MySQL)
- Update `DATABASE_URL` in `backend/.env`
- Run database setup:

```bash
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Configure Cloudinary

- Create Cloudinary account
- Update Cloudinary credentials in `backend/.env`

### 5. Run Development Server

```bash
npm run dev
```

This will start both:

- Backend API on http://localhost:5000
- Frontend on http://localhost:3000

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

## 🚀 For Other Developers

When someone clones your repository, they need to:

1. **Clone and install:**

   ```bash
   git clone <your-repo-url>
   cd material-kit-react-main
   npm run install:all
   ```

2. **Set up environment:**

   ```bash
   cp backend/.env.example backend/.env
   # Then fill in their own values
   ```

3. **Required accounts/services:**

   - MySQL database (local or cloud)
   - Gmail account with App Password
   - Cloudinary account for image uploads

4. **Database setup:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

## Development Setup

See individual README files in frontend/ and backend/ directories for detailed setup instructions.
