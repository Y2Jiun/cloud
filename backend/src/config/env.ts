import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Environment configuration interface
interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  DATABASE_URL: string;
  FRONTEND_URL?: string;

  // Database configuration
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;

  // Email configuration
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // File upload
  MAX_FILE_SIZE: number;
  UPLOAD_DIR: string;
}

// Validate and get environment configuration
export const getEnvConfig = (): EnvironmentConfig => {
  const requiredVars = ["JWT_SECRET", "DATABASE_URL"];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "5000"),
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
    DATABASE_URL: process.env.DATABASE_URL!,
    FRONTEND_URL: process.env.FRONTEND_URL,

    // Database configuration
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: parseInt(process.env.DB_PORT || "3306"),
    DB_USER: process.env.DB_USER || "root",
    DB_PASSWORD: process.env.DB_PASSWORD || "",
    DB_NAME: process.env.DB_NAME || "dashboard_app",

    // Email configuration
    EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
    EMAIL_PORT: parseInt(process.env.EMAIL_PORT || "587"),
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || "900000"
    ), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseInt(
      process.env.RATE_LIMIT_MAX_REQUESTS || "100"
    ),

    // File upload
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB
    UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
  };
};

// Get environment configuration with error handling
export const env = (): EnvironmentConfig => {
  try {
    return getEnvConfig();
  } catch (error) {
    console.error("❌ Environment configuration error:", error.message);
    console.error(
      "Please check your .env file and ensure all required variables are set."
    );
    process.exit(1);
  }
};

// Check if running in production
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === "production";
};

// Check if running in development
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
};

// Get CORS origins based on environment
export const getCorsOrigins = (): string[] => {
  if (isProduction()) {
    return [process.env.FRONTEND_URL].filter((url): url is string =>
      Boolean(url)
    );
  }

  return [
    "http://localhost:3000",
    "http://localhost:3002",
    process.env.FRONTEND_URL || "http://localhost:3000",
  ].filter((url): url is string => Boolean(url));
};
