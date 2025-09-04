# 🚀 **ROLE CHANGE SYSTEM - QUICK SETUP GUIDE**

## 🎯 **What You Need to Test**

The new role change request system allows:

- **Users** to request Legal Officer role
- **Admins** to approve/reject requests
- **Automatic role updates** when approved

## 🔧 **Setup Steps**

### **1. Update Database Schema**

```bash
cd backend

# Generate Prisma client with new schema
npx prisma generate

# Push the new schema to your database
npx prisma db push
```

### **2. Restart Backend Server**

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

### **3. Test the System**

#### **Test as Regular User (Role 3)**

1. **Login** with a regular user account
2. **Go to Account page** (`/dashboard/account`)
3. **Look for "Legal Officer Role Request" section**
4. **Click "Request Legal Officer Role"**
5. **Fill out reason** and submit
6. **Check request status**

#### **Test as Admin (Role 1)**

1. **Login** with an admin account
2. **Go to Users page** (`/dashboard/users`)
3. **Look for users with pending requests**
4. **Click Approve/Reject buttons**
5. **Add admin notes** and process request
6. **Verify user role changes**

## 🧪 **Testing Scenarios**

### **Scenario 1: User Requests Role Change**

1. User submits role change request
2. Admin sees pending request in users table
3. Admin approves with notes
4. User role automatically changes to Legal Officer (2)

### **Scenario 2: Admin Rejects Request**

1. User submits role change request
2. Admin rejects with required notes
3. User sees rejection reason
4. User can submit new request

### **Scenario 3: Duplicate Prevention**

1. User submits role change request
2. User tries to submit another request
3. System prevents duplicate (shows error)

## 🔍 **What to Look For**

### **Backend Console**

- Role change request logs
- Database operation logs
- Error messages if any

### **Frontend**

- Role change request button appears for users
- Admin sees approve/reject buttons for pending requests
- Status updates in real-time
- Form validation works

### **Database**

- New `role_change_requests` table created
- User roles update correctly
- Request status changes properly

## 🐛 **Common Issues & Solutions**

### **Issue: "Table doesn't exist" error**

**Solution**: Run `npx prisma db push` to create the new table

### **Issue: Role change buttons not showing**

**Solution**: Check if user is admin (role = 1) and if there are pending requests

### **Issue: API calls failing**

**Solution**: Check backend server is running and database connection is working

### **Issue: User roles not updating**

**Solution**: Check database permissions and Prisma client generation

## ✅ **Success Indicators**

### **For Users**

- ✅ Can see "Request Legal Officer Role" button
- ✅ Can submit role change request
- ✅ Can see request status updates
- ✅ Role changes to Legal Officer when approved

### **For Admins**

- ✅ Can see all users in users table
- ✅ Can see pending role change requests
- ✅ Can approve/reject requests
- ✅ Admin notes are saved and displayed

### **System**

- ✅ Database schema updated successfully
- ✅ API endpoints working
- ✅ Frontend components rendering
- ✅ Role updates happening automatically

## 🎉 **When Everything Works**

You should see:

1. **Users can request role changes** from their account page
2. **Admins can manage requests** from the users page
3. **Roles update automatically** when approved
4. **No errors** in console or network
5. **Smooth user experience** throughout the process

## 🚀 **Ready for Production**

Once tested locally:

1. **Deploy to staging** environment
2. **Test with real users**
3. **Monitor for any issues**
4. **Deploy to production**

---

**🎯 Status: READY FOR TESTING - Role Change System Complete!**
