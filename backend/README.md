# Backend API

Node.js Express backend with TypeScript, Prisma ORM, and PlanetScale MySQL database.

## Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Database**: PlanetScale MySQL with Prisma ORM
- **File Upload**: Cloudinary integration for image uploads
- **API Documentation**: RESTful API with proper error handling
- **Security**: Helmet, CORS, and input validation
- **TypeScript**: Full TypeScript support with strict type checking

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

3. **Database Setup**:
   - Create a PlanetScale database
   - Copy the connection string to your `.env` file
   - Run Prisma commands:
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Cloudinary Setup**:
   - Create a Cloudinary account
   - Add your credentials to `.env`

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Users
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `PUT /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (protected)

### Customers
- `GET /api/customers` - Get all customers (protected)
- `GET /api/customers/:id` - Get customer by ID (protected)
- `POST /api/customers` - Create customer (protected)
- `PUT /api/customers/:id` - Update customer (protected)
- `DELETE /api/customers/:id` - Delete customer (protected)

### File Upload
- `POST /api/upload/image` - Upload image to Cloudinary (protected)
- `DELETE /api/upload/image/:publicId` - Delete image from Cloudinary (protected)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (protected)
- `GET /api/dashboard/activity` - Get recent activity (protected)

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
src/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── config/          # Configuration files
└── index.ts         # Main server file
```

## Environment Variables

See `.env.example` for all required environment variables.

## Database Schema

The database schema is defined in `prisma/schema.prisma` and will be created in the next step.
