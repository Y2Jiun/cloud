import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../index";
import { AuthRequest } from "../middleware/auth";
import {
  validateRegistration,
  validateLogin,
  sanitizeInput,
} from "../utils/validation";
import { emailService } from "../services/emailService";

// Generate JWT token
const generateToken = (id: number): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return (jwt as any).sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Register user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username, name, contact } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      email: sanitizeInput(email || "").toLowerCase(),
      password: password || "",
      username: sanitizeInput(username || ""),
      name: sanitizeInput(name || ""),
      contact: sanitizeInput(contact || ""),
    };

    // Basic validation
    if (
      !sanitizedData.email ||
      !sanitizedData.password ||
      !sanitizedData.username
    ) {
      res.status(400).json({
        success: false,
        error: "Email, password, and username are required",
      });
      return;
    }

    // Check if user already exists (email or username)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: sanitizedData.email },
          { username: sanitizedData.username },
        ],
      },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: "User already exists with this email or username",
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(sanitizedData.password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: sanitizedData.email,
        password: hashedPassword,
        username: sanitizedData.username,
        name: sanitizedData.name || null,
        contact: sanitizedData.contact || null,
        roles: 3, // Default role for regular users
      },
      select: {
        userid: true,
        email: true,
        username: true,
        name: true,
        contact: true,
        profilepic: true,
        roles: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Generate token
    const token = generateToken(user.userid);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during registration",
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      email: sanitizeInput(email || "").toLowerCase(),
      password: password || "",
    };

    // Basic validation
    if (!sanitizedData.email || !sanitizedData.password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: sanitizedData.email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      sanitizedData.password,
      user.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
      return;
    }

    // Update last login
    await prisma.user.update({
      where: { userid: user.userid },
      data: { last_login: new Date() },
    });

    // Generate token
    const token = generateToken(user.userid);

    // Remove password from response and add name field
    const { password: _, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      name: user.name || user.username, // Use name field if available, fallback to username
    };

    res.json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during login",
    });
  }
};

// Get user profile
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { userid: req.user!.id },
      select: {
        userid: true,
        email: true,
        username: true,
        contact: true,
        profilepic: true,
        roles: true,
        created_at: true,
        updated_at: true,
        last_login: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting profile",
    });
  }
};

// Update user profile
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { username, contact, profilepic, password } = req.body;

    // Prepare update data
    const updateData: any = {
      ...(username && { username }),
      ...(contact && { contact }),
      ...(profilepic && { profilepic }),
    };

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { userid: req.user!.id },
      data: updateData,
      select: {
        userid: true,
        email: true,
        username: true,
        name: true,
        contact: true,
        profilepic: true,
        roles: true,
        created_at: true,
        updated_at: true,
        last_login: true,
      },
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      error: "Server error updating profile",
    });
  }
};

// Generate 6-digit OTP
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate reset token
const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Send password reset OTP
export const sendPasswordResetOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email || "").toLowerCase();

    if (!sanitizedEmail) {
      res.status(400).json({
        success: false,
        error: "Email is required",
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "No account found with this email address",
      });
      return;
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute from now

    // Delete any existing OTP for this email
    await prisma.passwordResetOtp.deleteMany({
      where: { email: sanitizedEmail },
    });

    // Create new OTP record
    await prisma.passwordResetOtp.create({
      data: {
        email: sanitizedEmail,
        otp,
        expiresAt,
      },
    });

    // Send OTP email
    const emailSent = await emailService.sendOtpEmail(sanitizedEmail, otp);

    if (!emailSent) {
      res.status(500).json({
        success: false,
        error: "Failed to send OTP email",
      });
      return;
    }

    res.json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      error: "Server error sending OTP",
    });
  }
};

// Verify password reset OTP
export const verifyPasswordResetOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email || "").toLowerCase();
    const sanitizedOtp = sanitizeInput(otp || "");

    if (!sanitizedEmail || !sanitizedOtp) {
      res.status(400).json({
        success: false,
        error: "Email and OTP are required",
      });
      return;
    }

    // Find OTP record
    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        email: sanitizedEmail,
        otp: sanitizedOtp,
        verified: false,
      },
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        error: "Invalid OTP",
      });
      return;
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      res.status(400).json({
        success: false,
        error: "OTP has expired",
      });
      return;
    }

    // Generate reset token
    const resetToken = generateResetToken();

    // Update OTP record with reset token and mark as verified
    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: {
        verified: true,
        token: resetToken,
      },
    });

    res.json({
      success: true,
      data: { token: resetToken },
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      error: "Server error verifying OTP",
    });
  }
};

// Reset password with token
export const resetPasswordWithToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // Sanitize inputs
    const sanitizedToken = sanitizeInput(token || "");
    const sanitizedPassword = newPassword || "";

    if (!sanitizedToken || !sanitizedPassword) {
      res.status(400).json({
        success: false,
        error: "Token and new password are required",
      });
      return;
    }

    if (sanitizedPassword.length < 8) {
      res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long",
      });
      return;
    }

    // Find OTP record with the token
    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        token: sanitizedToken,
        verified: true,
      },
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
      return;
    }

    // Check if token is still valid (within 10 minutes of OTP verification)
    const tokenExpiryTime = new Date(
      otpRecord.updatedAt.getTime() + 10 * 60 * 1000
    ); // 10 minutes
    if (new Date() > tokenExpiryTime) {
      res.status(400).json({
        success: false,
        error: "Reset token has expired",
      });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(sanitizedPassword, salt);

    // Update user password
    await prisma.user.update({
      where: { email: otpRecord.email },
      data: { password: hashedPassword },
    });

    // Delete the OTP record
    await prisma.passwordResetOtp.delete({
      where: { id: otpRecord.id },
    });

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "Server error resetting password",
    });
  }
};
