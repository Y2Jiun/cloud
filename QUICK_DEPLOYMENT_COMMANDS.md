# 🚀 Quick Deployment Commands - EC2 with RDS

## ⚡ One-Command Deployment

### For Windows (PowerShell/CMD):

```cmd
deploy-to-ec2.bat
```

### For Linux/macOS:

```bash
chmod +x deploy-to-ec2.sh && ./deploy-to-ec2.sh
```

## 📋 Pre-Deployment Checklist

Before running the deployment script, ensure you have:

- [ ] ✅ AWS CLI configured (`aws configure` completed)
- [ ] ✅ AWS EB CLI installed
- [ ] ✅ Your RDS MySQL endpoint and password ready
- [ ] ✅ Node.js 18+ installed

## 🔧 Manual Commands (If Script Fails)

### 1. Initialize EB Application

```bash
eb init material-kit-app --platform node.js-18 --region us-east-1
```

### 2. Create Environment

```bash
eb create material-kit-env --instance-type t3.micro --platform-version "Node.js 18"
```

### 3. Deploy Application

```bash
eb deploy material-kit-env
```

### 4. Check Status

```bash
eb status
eb open
```

## 🛠️ Essential Commands

### Environment Management

```bash
# Check status
eb status

# View logs
eb logs

# Open in browser
eb open

# Terminate when done
eb terminate
```

### Troubleshooting

```bash
# View all logs
eb logs --all

# SSH into instance
eb ssh

# Check health
eb health
```

## 🎯 Expected Output

After successful deployment:

```
🎉 Deployment completed successfully!
==============================================
Application URL: http://material-kit-env.us-east-1.elasticbeanstalk.com
Environment: material-kit-env
Region: us-east-1
```

## ⚠️ Important Notes

1. **RDS Security Groups**: Ensure your RDS security group allows connections from EC2
2. **Free Tier**: Uses t3.micro instances (750 hours/month free)
3. **Database**: Maintains your existing RDS MySQL setup
4. **Cost**: Stop/terminate when not in use to save credits

## 🆘 Quick Fixes

### If deployment fails:

```bash
eb logs --all | grep -i error
```

### If database connection fails:

- Check RDS endpoint in backend/.env
- Verify RDS security group allows port 3306 from EC2

### If frontend doesn't load:

- Check CORS settings in backend
- Verify FRONTEND_URL in environment variables
