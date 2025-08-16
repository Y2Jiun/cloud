# 🚀 AWS RDS MySQL Setup Guide

This guide will help you migrate your local MySQL database to AWS RDS MySQL using AWS Academy Lab.

## 📋 Prerequisites

- AWS Academy Lab access
- Your local MySQL database with data
- Exported data file (`cloud_export.sql` - already created)

## 🛠️ Step-by-Step Setup

### Step 1: Create RDS Instance in AWS Console

1. **Login to AWS Academy Lab**
   - Go to your AWS Academy course
   - Click "Start Lab" 
   - Click "AWS" to open AWS Console

2. **Navigate to RDS**
   - Search for "RDS" in the AWS Console
   - Click "Create database"

3. **Database Configuration**
   ```
   Engine type: MySQL
   Version: MySQL 8.0.35 (or latest)
   Templates: Free tier
   ```

4. **Settings**
   ```
   DB instance identifier: dashboard-mysql
   Master username: admin
   Master password: [Create a strong password - SAVE THIS!]
   ```

5. **DB Instance Class**
   ```
   Instance class: db.t3.micro (Free tier eligible)
   ```

6. **Storage**
   ```
   Storage type: General Purpose SSD (gp2)
   Allocated storage: 20 GB
   ```

7. **Connectivity**
   ```
   VPC: Default VPC
   Subnet group: default
   Public access: Yes
   VPC security group: Create new
   Database port: 3306
   ```

8. **Additional Configuration**
   ```
   Initial database name: cloud
   Backup retention period: 7 days
   ```

9. **Click "Create database"**
   - Wait 5-10 minutes for creation

### Step 2: Configure Security Group

1. **Go to EC2 Console**
   - Search for "EC2" in AWS Console
   - Click "Security Groups" in left sidebar

2. **Find RDS Security Group**
   - Look for security group named like `rds-launch-wizard-X`
   - Click on it

3. **Edit Inbound Rules**
   - Click "Edit inbound rules"
   - Click "Add rule"
   ```
   Type: MySQL/Aurora
   Protocol: TCP
   Port range: 3306
   Source: 0.0.0.0/0 (Anywhere IPv4)
   Description: MySQL access for development
   ```
   - Click "Save rules"

### Step 3: Get RDS Connection Details

1. **Go back to RDS Console**
2. **Click on your database instance** (`dashboard-mysql`)
3. **Copy the Endpoint** from "Connectivity & security" tab
   - It looks like: `dashboard-mysql.xxxxxxxxx.us-east-1.rds.amazonaws.com`
4. **Note down:**
   - Endpoint URL
   - Port: 3306
   - Master username: admin
   - Master password: [your password]

### Step 4: Update Import Script

1. **Edit `backend/import-to-rds.js`**
2. **Replace the RDS_CONFIG object:**
   ```javascript
   const RDS_CONFIG = {
     host: 'dashboard-mysql.xxxxxxxxx.us-east-1.rds.amazonaws.com', // Your actual endpoint
     port: 3306,
     user: 'admin',
     password: 'your-actual-rds-password', // Your actual password
     database: 'cloud'
   };
   ```

### Step 5: Import Your Data

1. **Run the import script:**
   ```bash
   node import-to-rds.js
   ```

2. **You should see:**
   ```
   🚀 Importing data to AWS RDS MySQL...
   📍 RDS Host: dashboard-mysql.xxxxxxxxx.us-east-1.rds.amazonaws.com
   📄 Loaded SQL file
   🔗 Connecting to AWS RDS...
   ✅ Connected to AWS RDS
   📋 Found X SQL statements to execute
   🏗️ Creating table: users
   🏗️ Creating table: customers
   📥 Inserting data into: users
   📥 Inserting data into: customers
   🎉 Data successfully imported to AWS RDS!
   ```

### Step 6: Update Your Application

1. **Update `backend/.env` file:**
   ```env
   # AWS RDS MySQL Configuration
   DATABASE_URL="mysql://admin:your-rds-password@dashboard-mysql.xxxxxxxxx.us-east-1.rds.amazonaws.com:3306/cloud"
   ```

2. **Test the connection:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Check the logs for:**
   ```
   ✅ Database connected successfully
   🚀 Server running on port 5000
   ```

### Step 7: Test Your Application

1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

2. **Test functionality:**
   - Login with existing accounts
   - Register new users
   - Test forgot password feature
   - Upload profile pictures

## 🔧 Troubleshooting

### Common Issues:

**1. Connection Timeout:**
```
Error: connect ETIMEDOUT
```
**Solution:** Check security group allows port 3306 from 0.0.0.0/0

**2. Access Denied:**
```
Error: ER_ACCESS_DENIED_ERROR
```
**Solution:** Verify username/password in RDS_CONFIG

**3. Database Not Found:**
```
Error: Unknown database 'cloud'
```
**Solution:** Make sure you specified "cloud" as initial database name when creating RDS

**4. Host Not Found:**
```
Error: getaddrinfo ENOTFOUND
```
**Solution:** Double-check the RDS endpoint URL

## 🎉 Success!

If everything works:
- ✅ Your data is now on AWS RDS
- ✅ Your application connects to cloud database
- ✅ All functionality works the same
- ✅ Your database is accessible from anywhere

## 💰 Cost Considerations

- **AWS Academy Lab:** Usually free credits
- **RDS Free Tier:** 750 hours/month of db.t3.micro
- **Storage:** 20GB free per month
- **Remember:** Stop/delete resources when done to save credits

## 🔒 Security Notes

- **For Production:** Use more restrictive security groups
- **For Development:** Current setup (0.0.0.0/0) is fine for learning
- **Always:** Use strong passwords and rotate them regularly
