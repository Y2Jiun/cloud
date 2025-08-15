# Full-Stack Dashboard Application

A complete full-stack application with React.js frontend, Node.js backend, PlanetScale MySQL database, and Cloudinary image uploads.

## Project Structure

```
├── frontend/          # React.js frontend application
├── backend/           # Node.js Express backend API
├── shared/            # Shared types and utilities
└── docs/              # Documentation
```

## Tech Stack

### Frontend

- React.js 19
- Material-UI (MUI)
- TypeScript
- Vite (for faster development)

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication

### Database

- PlanetScale MySQL
- Prisma as ORM

### File Storage

- Cloudinary for image uploads

## Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Environment Variables

```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Set up Database

- Create PlanetScale database (or AWS RDS MySQL)
- Update `DATABASE_URL` in `backend/.env`
- Run database setup:

```bash
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Configure Cloudinary

- Create Cloudinary account
- Update Cloudinary credentials in `backend/.env`

### 5. Run Development Server

```bash
npm run dev
```

This will start both:

- Backend API on http://localhost:5000
- Frontend on http://localhost:3000

## Development Commands

- `npm run dev` - Run both frontend and backend
- `npm run dev:backend` - Run only backend
- `npm run dev:frontend` - Run only frontend
- `npm run build` - Build both for production
- `npm run start` - Start production servers

## Environment Variables Required

### Backend (.env)

```
DATABASE_URL="your-planetscale-connection-string"
JWT_SECRET="your-jwt-secret"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

### Frontend (.env)

```
VITE_API_URL="http://localhost:5000/api"
```

## Features

- User authentication (register, login, logout)
- Dashboard with analytics
- User management
- Image upload functionality
- Responsive design
- Type-safe API communication

## Development Setup

See individual README files in frontend/ and backend/ directories for detailed setup instructions.
