# Database Setup Guide

This guide will help you set up PlanetScale MySQL database for your application.

## Prerequisites

- PlanetScale account (free tier available)
- Node.js and npm installed

## Step 1: Create PlanetScale Database

1. **Sign up for PlanetScale**:
   - Go to [PlanetScale](https://planetscale.com/)
   - Create a free account

2. **Create a new database**:
   - Click "Create database"
   - Choose a name (e.g., "dashboard-app")
   - Select a region closest to you
   - Click "Create database"

3. **Create a branch**:
   - PlanetScale uses branches like Git
   - Your database will have a "main" branch by default
   - For development, create a "dev" branch

## Step 2: Get Connection String

1. **Navigate to your database**
2. **Click on "Connect"**
3. **Select "Prisma" from the dropdown**
4. **Copy the connection string**

It will look like:
```
mysql://username:password@host:port/database?sslaccept=strict
```

## Step 3: Configure Environment Variables

1. **Update your `.env` file** in the backend directory:
   ```env
   DATABASE_URL="your-planetscale-connection-string-here"
   ```

2. **Replace the placeholder values** with your actual credentials

## Step 4: Push Database Schema

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Generate Prisma client**:
   ```bash
   npm run db:generate
   ```

3. **Push schema to database**:
   ```bash
   npm run db:push
   ```

   This will create the tables in your PlanetScale database.

## Step 5: Seed Database (Optional)

To populate your database with sample data:

```bash
npm run db:seed
```

This will create:
- 2 sample users (admin and demo)
- 5 sample customers
- Sample activities

## Step 6: Verify Setup

1. **Open Prisma Studio** to view your data:
   ```bash
   npm run db:studio
   ```

2. **Or check PlanetScale dashboard**:
   - Go to your database in PlanetScale
   - Click on "Console" to run SQL queries

## Connection String Format

Your PlanetScale connection string should look like:
```
mysql://username:password@host.region.psdb.cloud/database-name?sslaccept=strict
```

## Troubleshooting

### Common Issues:

1. **Connection refused**:
   - Check if your connection string is correct
   - Ensure your IP is whitelisted (PlanetScale free tier allows all IPs)

2. **SSL errors**:
   - Make sure `?sslaccept=strict` is at the end of your connection string

3. **Schema push fails**:
   - Ensure you have the correct permissions
   - Try creating a new branch and pushing there first

### Environment Variables Checklist:

Make sure your `.env` file has:
```env
DATABASE_URL="mysql://..."
JWT_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Next Steps

After setting up the database:
1. Test the backend server: `npm run dev`
2. Check the health endpoint: `http://localhost:5000/health`
3. Set up the frontend to connect to your API

## PlanetScale Features

- **Branching**: Create branches for different environments
- **Deploy requests**: Safely deploy schema changes
- **Insights**: Monitor query performance
- **Backups**: Automatic backups (paid plans)

## Production Considerations

For production:
1. Use a dedicated production branch
2. Set up deploy requests for schema changes
3. Monitor query performance
4. Consider upgrading to a paid plan for additional features
