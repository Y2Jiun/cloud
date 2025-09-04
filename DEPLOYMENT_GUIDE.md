# 🚀 Deployment Guide: Local → AWS RDS → Cloud Storage

This guide will walk you through deploying your application in two steps:

1. **Step 1**: Local development with local database
2. **Step 2**: Cloud deployment with AWS RDS and S3/Cloudinary

## 📋 Prerequisites

- AWS Student Account (for free tier access)
- Node.js 18+ installed
- MySQL installed locally
- Git repository set up

## 🔧 Step 1: Local Development Setup

### 1.1 Environment Configuration

Create a `.env` file in your `backend` directory:

```bash
# Backend .env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d
DATABASE_URL=mysql://root:your_password@localhost:3306/dashboard_app

# Database (for local development)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=dashboard_app

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email (optional for local development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 1.2 Local Database Setup

```bash
# Start MySQL service
sudo service mysql start  # Linux
# OR
brew services start mysql  # macOS

# Create database
mysql -u root -p
CREATE DATABASE dashboard_app;
USE dashboard_app;
EXIT;

# Run Prisma migrations
cd backend
npm run db:migrate

# Seed the database
npm run db:seed
```

### 1.3 Start Local Development

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

Your application should now be running at:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/health

## ☁️ Step 2: Cloud Deployment

### 2.1 AWS RDS Setup

#### 2.1.1 Create RDS Instance

1. **Go to AWS RDS Console**

   - Navigate to AWS RDS
   - Click "Create database"

2. **Choose Configuration**

   - Engine: MySQL
   - Version: MySQL 8.0.28 (or latest)
   - Template: Free tier (if available)

3. **Settings**

   - DB identifier: `dashboard-app-db`
   - Master username: `admin`
   - Master password: `YourSecurePassword123!`

4. **Instance Configuration**

   - Instance class: `db.t3.micro` (free tier)
   - Storage: 20 GB (free tier limit)

5. **Connectivity**

   - Public access: Yes (for development)
   - VPC security group: Create new
   - Availability Zone: Choose closest to you

6. **Security Group Rules**
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: 0.0.0.0/0 (for development - restrict in production)

#### 2.1.2 Update Environment Variables

Update your `.env` file with RDS credentials:

```bash
# Production .env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d
DATABASE_URL=mysql://admin:YourSecurePassword123!@your-rds-endpoint.amazonaws.com:3306/dashboard_app

# Database (RDS)
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=YourSecurePassword123!
DB_NAME=dashboard_app

# Frontend URL (your deployed frontend)
FRONTEND_URL=https://your-domain.com
```

### 2.2 Database Migration to RDS

#### 2.2.1 Export Local Data

```bash
# Export your local database
cd backend
npm run db:export

# This will create a SQL dump file
```

#### 2.2.2 Import to RDS

```bash
# Import to RDS
npm run db:import

# OR manually using the provided script
node import-to-rds.js
```

#### 2.2.3 Update Prisma Schema

Ensure your `prisma/schema.prisma` points to RDS:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 2.3 Cloud Storage Setup

#### 2.3.1 Option A: AWS S3

1. **Create S3 Bucket**

   ```bash
   # Create bucket
   aws s3 mb s3://your-app-uploads

   # Set public read access (for images)
   aws s3api put-bucket-policy --bucket your-app-uploads --policy '{
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-app-uploads/*"
       }
     ]
   }'
   ```

2. **Install AWS SDK**

   ```bash
   cd backend
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```

3. **Update Upload Configuration**
   ```typescript
   // backend/src/config/storage.ts
   export const s3Config = {
     region: process.env.AWS_REGION || "us-east-1",
     credentials: {
       accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
     },
     bucketName: process.env.AWS_S3_BUCKET!,
   };
   ```

#### 2.3.2 Option B: Cloudinary

1. **Sign up at Cloudinary.com**
2. **Install Cloudinary SDK**

   ```bash
   cd backend
   npm install cloudinary
   ```

3. **Update Upload Configuration**

   ```typescript
   // backend/src/config/storage.ts
   import { v2 as cloudinary } from "cloudinary";

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   });
   ```

### 2.4 Environment Variables for Cloud

```bash
# Cloud Storage (choose one)
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-app-uploads

# OR Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 Deployment Commands

### Local Development

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Database Operations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## 🔒 Security Checklist

- [ ] JWT_SECRET is long and random
- [ ] Database passwords are strong
- [ ] CORS origins are restricted in production
- [ ] Rate limiting is enabled
- [ ] File upload size limits are set
- [ ] Input validation is implemented
- [ ] Error messages don't expose sensitive info
- [ ] HTTPS is enabled in production

## 📊 Monitoring & Maintenance

### Health Checks

- Backend: `GET /health`
- Database: Check connection status
- File uploads: Verify storage access

### Logs

- Application logs: Check console/CloudWatch
- Database logs: RDS console
- Access logs: API Gateway (if using)

### Backup Strategy

- Database: RDS automated backups
- Files: S3 versioning or Cloudinary backup
- Code: Git repository

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Check RDS endpoint and credentials
   - Verify security group allows your IP
   - Ensure database is running

2. **File Upload Fails**

   - Check storage credentials
   - Verify bucket permissions
   - Check file size limits

3. **CORS Errors**
   - Verify FRONTEND_URL in environment
   - Check CORS configuration
   - Ensure frontend is accessible

### Support Commands

```bash
# Test database connection
cd backend
node test-db.js

# Test file upload
cd backend
node test-upload.js

# Check environment
cd backend
node -e "console.log(require('dotenv').config())"
```

## 📚 Next Steps

After successful deployment:

1. **Set up CI/CD pipeline** (GitHub Actions, AWS CodePipeline)
2. **Implement monitoring** (CloudWatch, New Relic)
3. **Add SSL certificates** (AWS Certificate Manager)
4. **Set up custom domain** (Route 53)
5. **Implement CDN** (CloudFront)
6. **Add backup automation**
7. **Set up alerts and notifications**

## 🎯 Success Metrics

- [ ] Application accessible from internet
- [ ] Database operations working
- [ ] File uploads functional
- [ ] Authentication working
- [ ] All API endpoints responding
- [ ] Frontend loading correctly
- [ ] Performance acceptable
- [ ] Security measures in place

---

**Need Help?** Check the logs, verify environment variables, and ensure all services are running. The application includes comprehensive error handling and logging to help diagnose issues.
