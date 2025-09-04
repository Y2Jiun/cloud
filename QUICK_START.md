# 🚀 Quick Start Guide

Get your application running in 5 minutes!

## ⚡ Quick Setup

### 1. Environment Setup

```bash
# Copy environment template
cd backend
cp env.template .env

# Edit .env file with your database credentials
# At minimum, set:
# - JWT_SECRET (any long random string)
# - DB_PASSWORD (your MySQL password)
```

### 2. Database Setup

```bash
# Start MySQL (if not running)
sudo service mysql start  # Linux
# OR
brew services start mysql  # macOS

# Create database
mysql -u root -p
CREATE DATABASE dashboard_app;
EXIT;
```

### 3. Install & Run

```bash
# Backend
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### 4. Access Your App

- 🌐 Frontend: http://localhost:3000
- 🔧 Backend: http://localhost:5000
- 📊 Health Check: http://localhost:5000/health

## 🔑 Default Login Credentials

After seeding the database, you can login with:

- **Admin**: admin@example.com / admin123
- **Legal Officer**: legal@example.com / legal123
- **User**: user@example.com / user123
- **Demo**: demo@example.com / demo123

## 🆘 Common Issues & Solutions

### Database Connection Failed

```bash
# Check MySQL status
sudo service mysql status

# Test connection
mysql -u root -p
```

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

### Prisma Errors

```bash
# Regenerate Prisma client
npm run db:generate

# Reset database
npm run db:reset
```

## 📚 Next Steps

1. **Test the application** - Create users, submit reports
2. **Customize the UI** - Modify frontend components
3. **Add features** - Extend the backend API
4. **Deploy to cloud** - Follow the DEPLOYMENT_GUIDE.md

## 🎯 What's Working Now

✅ User authentication & authorization  
✅ Role-based access control  
✅ Scam report management  
✅ File upload system  
✅ Database operations  
✅ API endpoints  
✅ Frontend dashboard  
✅ Security middleware

---

**Need help?** Check the logs, verify your .env file, and ensure MySQL is running!
