# 🚀 **STEP 1: QUICK START CHECKLIST**

## ✅ **Pre-Setup Checklist**

- [ ] **Node.js v18+** installed
- [ ] **MySQL 8.0+** installed and running
- [ ] **Git** installed
- [ ] **Repository** cloned

## 🎯 **Quick Setup (Choose One)**

### **Option A: Automated Setup (Recommended)**

**For Windows:**

```bash
# Run the Windows batch file
setup-local.bat
```

**For Mac/Linux:**

```bash
# Make script executable and run
chmod +x setup-local.sh
./setup-local.sh
```

### **Option B: Manual Setup**

```bash
# 1. Install dependencies
npm run install:all

# 2. Create backend .env file (copy from LOCAL_SETUP_GUIDE.md)

# 3. Setup database
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed  # Optional

# 4. Start application
npm run dev
```

## 🔧 **Required Configuration**

### **Backend .env File**

```env
DATABASE_URL=mysql://root:YOUR_PASSWORD@localhost:3306/dashboard_app
JWT_SECRET=your_super_secret_jwt_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### **Frontend .env.local File**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🧪 **Test Your Setup**

1. **Start Application**: `npm run dev`
2. **Frontend**: http://localhost:3000
3. **Backend**: http://localhost:5000
4. **Database**: `npx prisma studio` (from backend folder)

## 📁 **Local File Storage**

Files are automatically stored in:

- `backend/uploads/images/` - General images
- `backend/uploads/evidence/` - Legal case evidence
- `backend/uploads/profiles/` - User profile pictures

## 🎯 **Current Status: STEP 1**

✅ **Local Development**: Ready
✅ **Local File Storage**: Configured
✅ **Local Database**: MySQL configured
✅ **No Cloud Dependencies**: All local

**Next**: Develop and test locally before Step 2 (AWS RDS)
