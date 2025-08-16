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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

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

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // For now, we'll implement basic authorization
    // You can extend this to check user roles from database
    next();
  };
};
