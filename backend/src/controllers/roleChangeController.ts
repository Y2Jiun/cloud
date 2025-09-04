import { Request, Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../middleware/auth";

// Get role change request status for current user
export const getRoleChangeStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId || typeof userId !== "number") {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    const request = await prisma.roleChangeRequest.findFirst({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: request ? { status: request.status } : { status: null },
    });
  } catch (error) {
    console.error("Get role change status error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting role change status",
    });
  }
};

// Create role change request
export const createRoleChangeRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { requestedRole, reason } = req.body;

    if (!userId || typeof userId !== "number") {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    if (!requestedRole || !reason) {
      res.status(400).json({
        success: false,
        error: "Requested role and reason are required",
      });
      return;
    }

    // Check if user already has a pending request
    const existingRequest = await prisma.roleChangeRequest.findFirst({
      where: {
        userId: Number(userId),
        status: "pending",
      },
    });

    if (existingRequest) {
      res.status(400).json({
        success: false,
        error: "You already have a pending role change request",
      });
      return;
    }

    // Create the request
    const request = await prisma.roleChangeRequest.create({
      data: {
        userId: Number(userId),
        requestedRole,
        reason,
        status: "pending",
      },
    });

    res.status(201).json({
      success: true,
      message: "Role change request created successfully",
      data: request,
    });
  } catch (error) {
    console.error("Create role change request error:", error);
    res.status(500).json({
      success: false,
      error: "Server error creating role change request",
    });
  }
};

// Get all role change requests (admin only)
export const getAllRoleChangeRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userRole = req.user?.roles;

    if (!userRole || userRole !== 1) {
      res.status(403).json({
        success: false,
        error: "Only admins can view all role change requests",
      });
      return;
    }

    const requests = await prisma.roleChangeRequest.findMany({
      include: {
        user: {
          select: {
            userid: true,
            username: true,
            name: true,
            email: true,
            roles: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get all role change requests error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting role change requests",
    });
  }
};

// Approve role change request (admin only)
export const approveRoleChangeRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.roles;
    const { adminNotes } = req.body;

    if (!userRole || userRole !== 1) {
      res.status(403).json({
        success: false,
        error: "Only admins can approve role change requests",
      });
      return;
    }

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        success: false,
        error: "Valid request ID is required",
      });
      return;
    }

    const request = await prisma.roleChangeRequest.findUnique({
      where: { id: parseInt(id) },
      include: { user: true },
    });

    if (!request) {
      res.status(404).json({
        success: false,
        error: "Role change request not found",
      });
      return;
    }

    if (request.status !== "pending") {
      res.status(400).json({
        success: false,
        error: "Only pending requests can be approved",
      });
      return;
    }

    // Update user role
    await prisma.user.update({
      where: { userid: request.userId },
      data: { roles: request.requestedRole },
    });

    // Update request status
    const updatedRequest = await prisma.roleChangeRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: "approved",
        adminNotes,
      },
    });

    res.json({
      success: true,
      message: "Role change request approved successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Approve role change request error:", error);
    res.status(500).json({
      success: false,
      error: "Server error approving role change request",
    });
  }
};

// Reject role change request (admin only)
export const rejectRoleChangeRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.roles;
    const { adminNotes } = req.body;

    if (!userRole || userRole !== 1) {
      res.status(403).json({
        success: false,
        error: "Only admins can reject role change requests",
      });
      return;
    }

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        success: false,
        error: "Valid request ID is required",
      });
      return;
    }

    if (!adminNotes || !adminNotes.trim()) {
      res.status(400).json({
        success: false,
        error: "Admin notes are required for rejection",
      });
      return;
    }

    const request = await prisma.roleChangeRequest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!request) {
      res.status(404).json({
        success: false,
        error: "Role change request not found",
      });
      return;
    }

    if (request.status !== "pending") {
      res.status(400).json({
        success: false,
        error: "Only pending requests can be rejected",
      });
      return;
    }

    // Update request status
    const updatedRequest = await prisma.roleChangeRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: "rejected",
        adminNotes,
      },
    });

    res.json({
      success: true,
      message: "Role change request rejected successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Reject role change request error:", error);
    res.status(500).json({
      success: false,
      error: "Server error rejecting role change request",
    });
  }
};
