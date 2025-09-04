import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Import routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import customerRoutes from "./routes/customers";
import uploadRoutes from "./routes/upload";
import dashboardRoutes from "./routes/dashboard";
// Import scam reporting system routes
import scamReportsRoutes from "./routes/scamReports";
import scamAlertsRoutes from "./routes/scamAlerts";
import commentsRoutes from "./routes/comments";
import legalCasesRoutes from "./routes/legalCases";
import evidenceRoutes from "./routes/evidence";
import rolesRoutes from "./routes/roles";
import roleChangeRoutes from "./routes/roleChange";
import notificationsRoutes from "./routes/notifications";
import faqRoutes from "./routes/faq";
import checklistsRoutes from "./routes/checklists";
import questionnairesRoutes from "./routes/questionnaires";

// Import middleware
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import {
  apiLimiter,
  authLimiter,
  uploadLimiter,
} from "./middleware/rateLimiter";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["JWT_SECRET", "DATABASE_URL"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars);
  console.error("Please check your .env file");
  process.exit(1);
}

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "*"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    },
  })
);

// CORS configuration based on environment
const corsOrigins: string[] =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL].filter((url): url is string => Boolean(url))
    : [
        "http://localhost:3000",
        "http://localhost:3002",
        process.env.FRONTEND_URL || "http://localhost:3000",
      ].filter((url): url is string => Boolean(url));

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Apply rate limiting BEFORE routes
app.use("/api", apiLimiter);

// API Routes with specific rate limiting
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/upload", uploadLimiter, uploadRoutes);
app.use("/api/uploads", uploadRoutes); // For serving static files

// Apply routes
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);
// Scam reporting system routes
app.use("/api/scam-reports", scamReportsRoutes);
app.use("/api/scam-alerts", scamAlertsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/legal-cases", legalCasesRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/role-change", roleChangeRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/checklists", checklistsRoutes);
app.use("/api/questionnaires", questionnairesRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down server...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
