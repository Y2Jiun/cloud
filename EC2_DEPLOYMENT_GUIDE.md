# 🚀 EC2 Deployment Guide - Material Kit React App

This guide will help you deploy your full-stack application to AWS EC2 using Elastic Beanstalk while maintaining your existing RDS MySQL setup.

## 📋 Prerequisites

- ✅ AWS CLI installed and configured (`aws configure` completed)
- ✅ AWS EB CLI installed
- ✅ Node.js 18+ installed
- ✅ Your RDS MySQL database already set up and running
- ✅ AWS Academy Lab access (for free tier resources)

## 🚀 Quick Deployment (Automated)

### Option 1: Linux/macOS

```bash
# Make script executable
chmod +x deploy-to-ec2.sh

# Run deployment script
./deploy-to-ec2.sh
```

### Option 2: Windows

```cmd
# Run deployment script
deploy-to-ec2.bat
```

The script will:

1. ✅ Check all prerequisites
2. ✅ Collect your RDS configuration
3. ✅ Build your application
4. ✅ Create Elastic Beanstalk configuration
5. ✅ Deploy to EC2
6. ✅ Test the deployment

## 🔧 Manual Deployment Steps

If you prefer manual deployment or need to troubleshoot:

### Step 1: Prepare Your Environment

1. **Get your RDS details:**

   ```bash
   # Your RDS endpoint (from AWS Console)
   RDS_ENDPOINT="dashboard-mysql.xxxxx.us-east-1.rds.amazonaws.com"
   RDS_PASSWORD="your-rds-password"
   ```

2. **Create production environment file:**

   ```bash
   # Create backend/.env.production
   cat > backend/.env.production << EOF
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   JWT_EXPIRE=7d

   # Database Configuration (RDS)
   DATABASE_URL=mysql://admin:$RDS_PASSWORD@$RDS_ENDPOINT:3306/cloud
   DB_HOST=$RDS_ENDPOINT
   DB_PORT=3306
   DB_USER=admin
   DB_PASSWORD=$RDS_PASSWORD
   DB_NAME=cloud

   # Frontend URL (will be updated after deployment)
   FRONTEND_URL=http://your-app-name.us-east-1.elasticbeanstalk.com

   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=
   EMAIL_PASS=

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # File Upload
   MAX_FILE_SIZE=5242880
   UPLOAD_DIR=uploads

   # Logging
   LOG_LEVEL=info
   EOF
   ```

### Step 2: Build Your Application

```bash
# Install dependencies
npm install

# Build backend
cd backend
npm install
npm run build
cd ..

# Build frontend
cd frontend
npm install
npm run build
cd ..
```

### Step 3: Initialize Elastic Beanstalk

```bash
# Initialize EB application
eb init material-kit-app --platform node.js-18 --region us-east-1

# Create environment
eb create material-kit-env --instance-type t3.micro --platform-version "Node.js 18"
```

### Step 4: Configure Elastic Beanstalk

Create `.ebextensions/01-nodejs.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
    NodeVersion: 18.20.4
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 5000
  aws:elasticbeanstalk:environment:proxy:staticfiles:
    /uploads: uploads
    /static: frontend/out/_next/static
```

Create `.ebextensions/02-platform.config`:

```yaml
option_settings:
  aws:autoscaling:launchconfiguration:
    IamInstanceProfile: aws-elasticbeanstalk-ec2-role
  aws:elasticbeanstalk:environment:
    LoadBalancerType: application
  aws:elasticbeanstalk:environment:process:default:
    HealthCheckPath: /health
    Port: 5000
    Protocol: HTTP
```

Create `Procfile`:

```
web: cd backend && npm start
```

### Step 5: Deploy

```bash
# Copy production environment
cp backend/.env.production backend/.env

# Deploy
eb deploy material-kit-env
```

### Step 6: Update Configuration

```bash
# Get your app URL
APP_URL=$(eb status material-kit-env | grep "CNAME" | awk '{print $2}')

# Update frontend environment
cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=http://$APP_URL
NEXT_PUBLIC_APP_URL=http://$APP_URL
EOF

# Update backend environment
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://$APP_URL|g" backend/.env

# Redeploy with updated configuration
eb deploy material-kit-env
```

## 🔍 Verification & Testing

### Check Deployment Status

```bash
# Check environment status
eb status

# View application logs
eb logs

# Check environment health
eb health

# Open application in browser
eb open
```

### Test Your Application

```bash
# Test health endpoint
curl http://your-app-url/health

# Test API endpoint
curl http://your-app-url/api/health

# Test database connection
curl http://your-app-url/api/users
```

## 🛠️ Useful Commands

### Environment Management

```bash
# List environments
eb list

# Check status
eb status

# View logs
eb logs

# Open in browser
eb open

# Terminate environment (when done)
eb terminate
```

### Application Management

```bash
# Deploy updates
eb deploy

# Deploy specific version
eb deploy --version your-version-label

# Rollback to previous version
eb deploy --version previous-version-label
```

### Monitoring & Debugging

```bash
# View real-time logs
eb logs --all

# SSH into EC2 instance
eb ssh

# Check environment health
eb health --refresh
```

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Database Connection Failed

**Error:** `Error: connect ETIMEDOUT` or `ER_ACCESS_DENIED_ERROR`

**Solutions:**

- Verify RDS endpoint and credentials in `.env`
- Check RDS security group allows port 3306 from EC2 security group
- Ensure RDS instance is running and accessible

```bash
# Test database connection
cd backend
node -e "
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
connection.connect((err) => {
  if (err) console.error('Connection failed:', err);
  else console.log('Database connected successfully');
  connection.end();
});
"
```

#### 2. Frontend Not Loading

**Error:** CORS errors or 404 on frontend routes

**Solutions:**

- Check `FRONTEND_URL` in backend `.env`
- Verify CORS configuration in backend
- Ensure frontend build files are included

```bash
# Check CORS configuration
grep -r "cors" backend/src/

# Verify frontend build
ls -la frontend/out/
```

#### 3. File Upload Issues

**Error:** File uploads failing

**Solutions:**

- Check upload directory permissions
- Verify file size limits
- Ensure upload directory exists

```bash
# Check upload directory
ls -la backend/uploads/

# Test file upload endpoint
curl -X POST -F "file=@test.txt" http://your-app-url/api/upload
```

#### 4. Environment Variables Not Loading

**Error:** Environment variables not found

**Solutions:**

- Verify `.env` file exists in backend directory
- Check environment variable names match exactly
- Restart the application after changes

```bash
# Check environment variables
eb ssh
cd /var/app/current/backend
cat .env
```

#### 5. Build Failures

**Error:** Build process failing

**Solutions:**

- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript compilation errors

```bash
# Check Node.js version
node --version

# Check build logs
eb logs --all | grep -i error

# Test build locally
cd backend && npm run build
cd ../frontend && npm run build
```

### Log Analysis

```bash
# View all logs
eb logs --all

# Filter for errors
eb logs --all | grep -i error

# View specific log files
eb ssh
tail -f /var/log/eb-docker/containers/eb-current-app/*.log
```

## 💰 Cost Optimization

### Free Tier Usage

- **EC2 t3.micro:** 750 hours/month free
- **RDS db.t3.micro:** 750 hours/month free
- **Storage:** 20GB free per month

### Cost-Saving Tips

```bash
# Stop environment when not in use
eb stop

# Start environment when needed
eb start

# Terminate when completely done
eb terminate
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Use strong JWT secrets
- [ ] Restrict RDS security groups to EC2 only
- [ ] Enable HTTPS (requires SSL certificate)
- [ ] Set up proper CORS origins
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular security updates

### Security Group Configuration

```bash
# RDS Security Group should allow:
# - Port 3306 from EC2 Security Group only
# - Not from 0.0.0.0/0 in production

# EC2 Security Group should allow:
# - Port 80 (HTTP) from 0.0.0.0/0
# - Port 443 (HTTPS) from 0.0.0.0/0
# - Port 22 (SSH) from your IP only
```

## 📊 Monitoring & Maintenance

### Health Checks

- **Application Health:** `GET /health`
- **Database Health:** `GET /api/health`
- **File Upload Health:** Test upload endpoint

### Regular Maintenance

```bash
# Check application status
eb health

# View recent logs
eb logs --all

# Update dependencies
npm update
eb deploy

# Backup database (if needed)
# Use AWS RDS automated backups
```

## 🎯 Success Metrics

After successful deployment, verify:

- [ ] Application accessible from internet
- [ ] Database operations working
- [ ] File uploads functional
- [ ] Authentication working
- [ ] All API endpoints responding
- [ ] Frontend loading correctly
- [ ] Performance acceptable

## 🆘 Getting Help

### AWS Academy Lab Support

- Check AWS Academy course resources
- Use AWS documentation
- Contact instructor for lab-specific issues

### Common Commands for Support

```bash
# Get environment info
eb status
eb health

# Get logs for support
eb logs --all > deployment-logs.txt

# Get configuration
eb printenv
```

---

**🎉 Congratulations!** Your application is now deployed to AWS EC2 with your existing RDS MySQL database. The deployment maintains all your current functionality while providing cloud scalability and reliability.
