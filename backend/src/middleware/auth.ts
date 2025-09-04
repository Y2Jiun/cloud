import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../index";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string;
    roles: number;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    // Validate JWT_SECRET environment variable
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET environment variable is not defined");
      return res.status(500).json({
        success: false,
        error: "Server configuration error",
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;

    const user = await prisma.user.findUnique({
      where: { userid: decoded.id },
      select: {
        userid: true,
        email: true,
        username: true,
        roles: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    req.user = {
      id: user.userid,
      email: user.email,
      username: user.username,
      roles: user.roles,
    };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

// Role constants
export const ROLES = {
  ADMIN: 1,
  LEGAL_OFFICER: 2,
  USER: 3,
} as const;

// Role names for better readability
export const ROLE_NAMES = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.LEGAL_OFFICER]: "Legal Officer",
  [ROLES.USER]: "User",
} as const;

// Authorization middleware that checks if user has required role
export const authorize = (...allowedRoles: number[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const userRole = req.user.roles;

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${allowedRoles
          .map((role) => ROLE_NAMES[role as keyof typeof ROLE_NAMES])
          .join(" or ")}. Your role: ${
          ROLE_NAMES[userRole as keyof typeof ROLE_NAMES]
        }`,
      });
    }

    next();
  };
};

// Helper functions for role checking
export const isAdmin = (req: AuthRequest): boolean => {
  return req.user?.roles === ROLES.ADMIN;
};

export const isLegalOfficer = (req: AuthRequest): boolean => {
  return req.user?.roles === ROLES.LEGAL_OFFICER;
};

export const isUser = (req: AuthRequest): boolean => {
  return req.user?.roles === ROLES.USER;
};

// Check if user can access admin functions
export const canAccessAdmin = (req: AuthRequest): boolean => {
  return isAdmin(req);
};

// Check if user can manage legal cases
export const canManageLegalCases = (req: AuthRequest): boolean => {
  return isAdmin(req) || isLegalOfficer(req);
};

// Check if user can view all reports (admin and legal officers)
export const canViewAllReports = (req: AuthRequest): boolean => {
  return isAdmin(req) || isLegalOfficer(req);
};

// Check if user owns a resource or has admin/legal officer privileges
export const canAccessResource = (
  req: AuthRequest,
  resourceUserId: number
): boolean => {
  return isAdmin(req) || isLegalOfficer(req) || req.user?.id === resourceUserId;
};
