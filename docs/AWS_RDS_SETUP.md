# AWS RDS MySQL Setup Guide

If you prefer to use AWS RDS MySQL instead of PlanetScale, follow this guide.

## Prerequisites

- AWS Account
- AWS CLI configured (optional)

## Step 1: Create AWS RDS MySQL Instance

### Using AWS Console:

1. **Go to AWS RDS Console**
2. **Click "Create database"**
3. **Choose "Standard create"**
4. **Select "MySQL"**
5. **Choose version** (8.0 recommended)
6. **Select "Free tier"** (for development)
7. **Configure settings**:
   - DB instance identifier: `dashboard-app-db`
   - Master username: `admin`
   - Master password: (create a strong password)
8. **Configure connectivity**:
   - VPC: Default VPC
   - Public access: Yes (for development)
   - VPC security group: Create new
9. **Additional configuration**:
   - Initial database name: `dashboard_app`
10. **Click "Create database"**

## Step 2: Configure Security Group

1. **Go to EC2 Console > Security Groups**
2. **Find your RDS security group**
3. **Edit inbound rules**
4. **Add rule**:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: 0.0.0.0/0 (for development only)

## Step 3: Update Prisma Schema

Update `backend/prisma/schema.prisma`:

```prisma
// Remove this line for AWS RDS:
// relationMode = "prisma"

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  // relationMode = "prisma" <- Remove this line
}
```

## Step 4: Update Environment Variables

Update `backend/.env`:

```env
# AWS RDS MySQL connection string format:
DATABASE_URL="mysql://username:password@endpoint:3306/database_name"

# Example:
DATABASE_URL="mysql://admin:yourpassword@dashboard-app-db.xxxxx.us-east-1.rds.amazonaws.com:3306/dashboard_app"
```

## Step 5: Test Connection

```bash
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

## Connection String Format

AWS RDS MySQL connection string:
```
mysql://[username]:[password]@[endpoint]:[port]/[database_name]
```

Where:
- `username`: Your RDS master username
- `password`: Your RDS master password
- `endpoint`: Your RDS endpoint (found in AWS console)
- `port`: 3306 (default MySQL port)
- `database_name`: Your initial database name

## Security Best Practices

### For Production:

1. **Use VPC**: Place RDS in private subnet
2. **Security Groups**: Restrict access to application servers only
3. **SSL/TLS**: Enable SSL connections
4. **IAM Authentication**: Use IAM database authentication
5. **Encryption**: Enable encryption at rest and in transit

### Environment Variables for Production:
```env
DATABASE_URL="mysql://username:password@endpoint:3306/database_name?ssl=true"
```

## Cost Considerations

- **Free Tier**: 750 hours/month of db.t3.micro
- **Storage**: 20GB free tier
- **Backup**: 20GB free backup storage
- **Data Transfer**: Some data transfer included

## Monitoring

Set up CloudWatch monitoring for:
- CPU utilization
- Database connections
- Read/write IOPS
- Free storage space

## Backup Strategy

- **Automated backups**: Enable with 7-day retention
- **Manual snapshots**: Create before major changes
- **Point-in-time recovery**: Available with automated backups

## Migration from PlanetScale

If you're switching from PlanetScale:

1. **Export data** from PlanetScale
2. **Create RDS instance**
3. **Update connection string**
4. **Remove relationMode from schema**
5. **Run migrations**
6. **Import data**

## Troubleshooting

### Common Issues:

1. **Connection timeout**:
   - Check security group rules
   - Verify endpoint and port

2. **Access denied**:
   - Verify username/password
   - Check user permissions

3. **SSL errors**:
   - Add `?ssl=true` to connection string
   - Download RDS CA certificate if needed

### Testing Connection:
```bash
# Test with MySQL client
mysql -h your-endpoint -P 3306 -u admin -p database_name
```

## Switching Script

To switch from PlanetScale to AWS RDS, run:

```bash
# 1. Update schema
sed -i '/relationMode = "prisma"/d' backend/prisma/schema.prisma

# 2. Update connection string in .env
# (manually update DATABASE_URL)

# 3. Regenerate and push
cd backend
npm run db:generate
npm run db:push
```
