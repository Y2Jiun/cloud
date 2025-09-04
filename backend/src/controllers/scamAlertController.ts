import { Request, Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../middleware/auth";

// Create scam alert (Legal Officers only)
export const createScamAlert = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, severity, targetAudience, expiresAt } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    // Check if user is Legal Officer (role 2) or Admin (role 1)
    const user = await prisma.user.findUnique({
      where: { userid: userId },
      select: { userid: true, roles: true },
    });

    if (!user || (user.roles !== 2 && user.roles !== 1)) {
      res.status(403).json({
        success: false,
        error: "Only Legal Officers and Admins can create scam alerts",
      });
      return;
    }

    const scamAlert = await prisma.scamAlert.create({
      data: {
        title,
        description,
        severity: severity || "MEDIUM",
        targetAudience: targetAudience || "ALL",
        status: user.roles === 1 ? "approved" : "pending", // Admins auto-approve
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: userId,
        approvedBy: user.roles === 1 ? userId : null,
      },
      include: {
        createdByUser: {
          select: {
            username: true,
          },
        },
        approvedByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: scamAlert,
    });
  } catch (error) {
    console.error("Create scam alert error:", error);
    res.status(500).json({
      success: false,
      error: "Server error creating scam alert",
    });
  }
};

// Get all scam alerts (filtered by user role)
export const getScamAlerts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status, search } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { userid: userId },
      select: { userid: true, roles: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Build where clause based on user role
    let where: any = {};

    if (user.roles === 1) {
      // Admin: see all alerts
      if (status && status !== "all") {
        where.status = status;
      }
    } else if (user.roles === 2) {
      // Legal Officer: see only their own alerts
      where.createdBy = userId;
      if (status && status !== "all") {
        where.status = status;
      }
    } else {
      // Regular user: see only approved and active alerts
      where.status = "approved";
      where.isActive = true;
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];
    }

    // Add search functionality
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: "insensitive" as any } },
        { description: { contains: String(search), mode: "insensitive" as any } },
      ];
    }

    const alerts = await prisma.scamAlert.findMany({
      where,
      orderBy: [
        { isActive: "desc" },
        { severity: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        createdByUser: {
          select: {
            username: true,
          },
        },
        approvedByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Get scam alerts error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting scam alerts",
    });
  }
};

// Get scam alert by ID
export const getScamAlertById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const alert = await prisma.scamAlert.findUnique({
      where: { id: Number(id) },
      include: {
        createdByUser: {
          select: {
            username: true,
          },
        },
        approvedByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!alert) {
      res.status(404).json({
        success: false,
        error: "Scam alert not found",
      });
      return;
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("Get scam alert by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting scam alert",
    });
  }
};

// Update scam alert (Legal Officers can edit their own pending/rejected alerts)
export const updateScamAlert = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, severity, targetAudience, expiresAt } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { userid: userId },
      select: { userid: true, roles: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Check if user can edit this alert
    const existingAlert = await prisma.scamAlert.findUnique({
      where: { id: Number(id) },
      select: { createdBy: true, status: true },
    });

    if (!existingAlert) {
      res.status(404).json({
        success: false,
        error: "Scam alert not found",
      });
      return;
    }

    // Legal Officers can only edit their own pending/rejected alerts
    // Admins can edit any alert
    if (user.roles === 2 && existingAlert.createdBy !== userId) {
      res.status(403).json({
        success: false,
        error: "You can only edit your own alerts",
      });
      return;
    }

    if (user.roles === 2 && existingAlert.status === "approved") {
      res.status(403).json({
        success: false,
        error: "Cannot edit approved alerts",
      });
      return;
    }

    const updatedAlert = await prisma.scamAlert.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        severity,
        targetAudience,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: user.roles === 1 ? "approved" : "pending", // Reset to pending if edited by Legal Officer
        approvedBy: user.roles === 1 ? userId : null,
      },
      include: {
        createdByUser: {
          select: {
            username: true,
          },
        },
        approvedByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedAlert,
    });
  } catch (error) {
    console.error("Update scam alert error:", error);
    res.status(500).json({
      success: false,
      error: "Server error updating scam alert",
    });
  }
};

// Approve scam alert (Admin only)
export const approveScamAlert = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { userid: userId },
      select: { userid: true, roles: true },
    });

    if (!user || user.roles !== 1) {
      res.status(403).json({
        success: false,
        error: "Only admins can approve scam alerts",
      });
      return;
    }

    const alert = await prisma.scamAlert.update({
      where: { id: Number(id) },
      data: {
        status: "approved",
        approvedBy: userId,
        adminNotes: null, // Clear any rejection notes
      },
      include: {
        createdByUser: {
          select: {
            username: true,
          },
        },
        approvedByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("Approve scam alert error:", error);
    res.status(500).json({
      success: false,
      error: "Server error approving scam alert",
    });
  }
};

// Reject scam alert (Admin only)
export const rejectScamAlert = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { userid: userId },
      select: { userid: true, roles: true },
    });

    if (!user || user.roles !== 1) {
      res.status(403).json({
        success: false,
        error: "Only admins can reject scam alerts",
      });
      return;
    }

    if (!adminNotes || adminNotes.trim() === "") {
      res.status(400).json({
        success: false,
        error: "Admin notes are required when rejecting an alert",
      });
      return;
    }

    const alert = await prisma.scamAlert.update({
      where: { id: Number(id) },
      data: {
        status: "rejected",
        adminNotes: adminNotes.trim(),
        approvedBy: userId,
      },
      include: {
        createdByUser: {
          select: {
            username: true,
          },
        },
        approvedByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("Reject scam alert error:", error);
    res.status(500).json({
      success: false,
      error: "Server error rejecting scam alert",
    });
  }
};

// Delete scam alert (Legal Officers can delete their own, Admins can delete any)
export const deleteScamAlert = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { userid: userId },
      select: { userid: true, roles: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Check if user can delete this alert
    const existingAlert = await prisma.scamAlert.findUnique({
      where: { id: Number(id) },
      select: { createdBy: true },
    });

    if (!existingAlert) {
      res.status(404).json({
        success: false,
        error: "Scam alert not found",
      });
      return;
    }

    // Legal Officers can only delete their own alerts
    // Admins can delete any alert
    if (user.roles === 2 && existingAlert.createdBy !== userId) {
      res.status(403).json({
        success: false,
        error: "You can only delete your own alerts",
      });
      return;
    }

    await prisma.scamAlert.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: "Scam alert deleted successfully",
    });
  } catch (error) {
    console.error("Delete scam alert error:", error);
    res.status(500).json({
      success: false,
      error: "Server error deleting scam alert",
    });
  }
};

// Toggle alert active status (Admin only)
export const toggleAlertStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { userid: userId },
      select: { userid: true, roles: true },
    });

    if (!user || user.roles !== 1) {
      res.status(403).json({
        success: false,
        error: "Only admins can toggle alert status",
      });
      return;
    }

    const alert = await prisma.scamAlert.update({
      where: { id: Number(id) },
      data: { isActive },
      include: {
        createdByUser: {
          select: {
            username: true,
          },
        },
        approvedByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("Toggle alert status error:", error);
    res.status(500).json({
      success: false,
      error: "Server error toggling alert status",
    });
  }
};
