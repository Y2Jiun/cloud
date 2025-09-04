# 🚀 **COMPLETE LOCAL SETUP GUIDE - Scam Prevention System**

## 🎯 **What This System Does**

This is a **complete scam prevention and legal case management system** with the following features:

### **Core Functionality:**

- ✅ **User Authentication & Role Management** (Admin, Legal Officer, Regular User)
- ✅ **Scam Reporting System** - Users can report scams, track cases
- ✅ **Legal Case Management** - Legal officers create/manage cases
- ✅ **Scam Alerts** - Community warnings about new scams
- ✅ **Role Change Requests** - Users can request promotion to Legal Officer
- ✅ **FAQ & Knowledge Base** - Educational content
- ✅ **Questionnaire System** - Surveys for legal officers
- ✅ **Personal Checklists** - Scam prevention checklists for users
- ✅ **Notification System** - Real-time alerts
- ✅ **Local File Storage** - Images and documents stored locally
- ✅ **Complete Admin Panel** - User management, report approval

## 🛠️ **Prerequisites**

Before starting, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (local installation) - [Download here](https://dev.mysql.com/downloads/mysql/)
- **Git** - [Download here](https://git-scm.com/)

## 📋 **Step-by-Step Local Setup**

### **1. Clone and Setup Project**

```bash
# Clone the repository
git clone https://github.com/Y2Jiun/cloud.git
cd cloud

# Install all dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### **2. Database Setup**

```bash
# Start MySQL service
# Windows: Start MySQL from Services
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql

# Create database
mysql -u root -p
CREATE DATABASE cloud;
exit
```

### **3. Environment Configuration**

```bash
# Copy environment template
cd backend
cp env.template .env
```

**Edit `.env` file with your local values:**

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration (Local MySQL)
DATABASE_URL=mysql://root:your_mysql_password@localhost:3306/cloud

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters
JWT_EXPIRE=7d

# Email Configuration (Optional for local development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password

# File Upload Settings (Local Storage)
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads

# Remove Cloudinary settings for local development
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
```

### **4. Database Schema & Sample Data**

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Seed with sample data (includes admin user, demo data)
npx prisma db seed
```

**Sample Users Created:**

- **Admin**: `admin@example.com` / `admin123` (Role 1 - Super Admin)
- **Demo User**: `user@example.com` / `user123` (Role 3 - Regular User)

### **5. Start the Application**

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend (in new terminal)
cd frontend
npm run dev
```

**Access Points:**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database Studio**: `npx prisma studio` (optional)

## 🔐 **User Roles & Access**

### **Role 1: Admin (Super Admin)**

- **Access**: `/dashboard/admin/*` routes
- **Capabilities**:
  - Manage all users and roles
  - Approve/reject scam reports
  - Approve/reject legal cases
  - Approve/reject scam alerts
  - Manage FAQs and system settings
  - View system statistics

### **Role 2: Legal Officer**

- **Access**: Legal case management, scam alerts
- **Capabilities**:
  - Create legal cases (requires admin approval)
  - Create scam alerts (requires admin approval)
  - Upload case evidence and documents
  - Create questionnaires for users
  - Comment on cases and alerts

### **Role 3: Regular User (Default)**

- **Access**: Basic user features
- **Capabilities**:
  - Submit scam reports
  - Create personal checklists
  - Answer questionnaires
  - Request role change to Legal Officer
  - Manage profile and settings

## 📁 **Local File Storage Structure**

The system stores files locally in the `backend/uploads/` directory:

```
backend/uploads/
├── images/          # General images
├── evidence/        # Legal case evidence
└── profiles/        # User profile pictures
```

**File Access URLs:**

- Images: `http://localhost:5000/api/uploads/images/filename.jpg`
- Evidence: `http://localhost:5000/api/uploads/evidence/filename.pdf`
- Profiles: `http://localhost:5000/api/uploads/profiles/filename.jpg`

## 🚀 **Testing the System**

### **1. Test User Registration & Login**

1. Go to http://localhost:3000
2. Register a new account
3. Login with your credentials

### **2. Test Scam Reporting**

1. Login as regular user
2. Go to `/dashboard/scam-reports`
3. Click "Create Report"
4. Fill out the form and submit

### **3. Test Admin Functions**

1. Login as admin (`admin@example.com` / `admin123`)
2. Go to `/dashboard/admin/scam-reports`
3. Review and approve/reject reports

### **4. Test File Uploads**

1. Go to `/dashboard/account`
2. Upload a profile picture
3. Verify it's stored locally

### **5. Test Role Change Request**

1. Login as regular user
2. Go to `/dashboard/account`
3. Request Legal Officer role
4. Login as admin to approve/reject

## 🔧 **Development Workflow**

### **Adding New Features**

1. **Backend**: Add controllers in `backend/src/controllers/`
2. **Database**: Update schema in `backend/prisma/schema.prisma`
3. **Frontend**: Add components in `frontend/src/components/`
4. **Routes**: Update API routes in `backend/src/routes/`

### **Database Changes**

```bash
cd backend

# After schema changes
npx prisma generate
npx prisma db push

# For production migrations
npx prisma migrate dev --name feature_name
```

### **Testing Changes**

```bash
# Test backend
cd backend
npm run dev

# Test frontend
cd frontend
npm run dev

# Check database
npx prisma studio
```

## 🚀 **Preparing for AWS Deployment**

### **1. Database Migration to RDS**

```bash
# Export local data
cd backend
npx prisma db pull
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql

# Update .env for AWS
DATABASE_URL=mysql://admin:YourPassword@your-rds-endpoint.amazonaws.com:3306/cloud
```

### **2. File Storage Migration**

- **Option A**: Keep local storage (files stored on EC2)
- **Option B**: Migrate to S3 (recommended for production)

### **3. Environment Updates**

```env
# Production settings
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
DATABASE_URL=mysql://admin:YourPassword@your-rds-endpoint.amazonaws.com:3306/cloud
```

## 🐛 **Troubleshooting**

### **Common Issues**

**Database Connection Error:**

```bash
# Check MySQL service
# Verify DATABASE_URL in .env
# Test connection manually
mysql -u root -p -h localhost
```

**File Upload Issues:**

```bash
# Check uploads directory exists
ls -la backend/uploads/

# Check file permissions
chmod 755 backend/uploads/
```

**Port Already in Use:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**CORS Errors:**

```bash
# Verify FRONTEND_URL in backend/.env
# Restart both servers
```

## 📊 **System Status Check**

### **✅ What's Working**

- Complete user authentication system
- Role-based access control
- Scam reporting workflow
- Legal case management
- File upload system (local storage)
- Admin panel and user management
- Role change request system
- FAQ and knowledge base
- Questionnaire system
- Personal checklists
- Notification system

### **🔧 What Can Be Enhanced**

- Add more scam report categories
- Implement advanced search filters
- Add reporting analytics dashboard
- Enhance notification preferences
- Add bulk operations for admins
- Implement audit logging

## 🎯 **Next Steps**

1. **Complete Local Testing**: Test all features thoroughly
2. **Add Missing Features**: Implement any specific requirements
3. **Database Optimization**: Add indexes for better performance
4. **Security Review**: Ensure all endpoints are properly secured
5. **AWS Preparation**: Set up RDS and prepare deployment
6. **Production Deployment**: Deploy to AWS with proper configuration

## 🆘 **Need Help?**

- **Setup Issues**: Check troubleshooting section above
- **Feature Questions**: Review the code in respective controllers
- **Database Issues**: Use `npx prisma studio` to inspect data
- **API Testing**: Use Postman or similar tool to test endpoints

---

**🎉 Your scam prevention system is now ready for local development and testing!**

**Next**: Complete any missing features, test thoroughly, then prepare for AWS deployment.
