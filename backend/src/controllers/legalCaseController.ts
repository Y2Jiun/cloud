import { Request, Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../middleware/auth";

// Create legal case (Legal Officers only)
export const createLegalCase = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, priority } = req.body;
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
        error: "Only Legal Officers and Admins can create legal cases",
      });
      return;
    }

    // Generate unique case number
    const caseNumber = `LC-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;

    const legalCase = await prisma.legalCase.create({
      data: {
        title,
        description,
        caseNumber,
        priority: priority || "MEDIUM",
        status: user.roles === 1 ? "approved" : "pending", // Admins auto-approve
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
      data: legalCase,
    });
  } catch (error) {
    console.error("Create legal case error:", error);
    res.status(500).json({
      success: false,
      error: "Server error creating legal case",
    });
  }
};

// Get all legal cases (filtered by user role)
export const getLegalCases = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status, priority, search } = req.query;

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
      // Admin: see all cases
      if (status && status !== "all") {
        where.status = status;
      }
      if (priority && priority !== "all") {
        where.priority = priority;
      }
    } else if (user.roles === 2) {
      // Legal Officer: see only their own cases
      where.createdBy = userId;
      if (status && status !== "all") {
        where.status = status;
      }
      if (priority && priority !== "all") {
        where.priority = priority;
      }
    } else {
      // Regular user: see only approved and active cases
      where.status = "approved";
      where.isActive = true;
    }

    // Add search functionality
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: "insensitive" as any } },
        {
          description: { contains: String(search), mode: "insensitive" as any },
        },
        {
          caseNumber: { contains: String(search), mode: "insensitive" as any },
        },
      ];
    }

    const cases = await prisma.legalCase.findMany({
      where,
      orderBy: [
        { isActive: "desc" },
        { priority: "desc" },
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
      data: cases,
    });
  } catch (error) {
    console.error("Get legal cases error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting legal cases",
    });
  }
};

// Get legal case by ID
export const getLegalCaseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const legalCase = await prisma.legalCase.findUnique({
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
        scamReports: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
        evidence: {
          select: {
            id: true,
            title: true,
            description: true,
            fileUrl: true,
            caseId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!legalCase) {
      res.status(404).json({
        success: false,
        error: "Legal case not found",
      });
      return;
    }

    res.json({
      success: true,
      data: legalCase,
    });
  } catch (error) {
    console.error("Get legal case by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting legal case",
    });
  }
};

// Update legal case (Legal Officers can edit their own pending/rejected cases)
export const updateLegalCase = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;
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

    // Check if user can edit this case
    const existingCase = await prisma.legalCase.findUnique({
      where: { id: Number(id) },
      select: { createdBy: true, status: true },
    });

    if (!existingCase) {
      res.status(404).json({
        success: false,
        error: "Legal case not found",
      });
      return;
    }

    // Legal Officers can only edit their own pending/rejected cases
    // Admins can edit any case
    if (user.roles === 2 && existingCase.createdBy !== userId) {
      res.status(403).json({
        success: false,
        error: "You can only edit your own cases",
      });
      return;
    }

    if (user.roles === 2 && existingCase.status === "approved") {
      res.status(403).json({
        success: false,
        error: "Cannot edit approved cases",
      });
      return;
    }

    const updatedCase = await prisma.legalCase.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        priority,
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
      data: updatedCase,
    });
  } catch (error) {
    console.error("Update legal case error:", error);
    res.status(500).json({
      success: false,
      error: "Server error updating legal case",
    });
  }
};

// Approve legal case (Admin only)
export const approveLegalCase = async (
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
        error: "Only admins can approve legal cases",
      });
      return;
    }

    const legalCase = await prisma.legalCase.update({
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
      data: legalCase,
    });
  } catch (error) {
    console.error("Approve legal case error:", error);
    res.status(500).json({
      success: false,
      error: "Server error approving legal case",
    });
  }
};

// Reject legal case (Admin only)
export const rejectLegalCase = async (
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
        error: "Only admins can reject legal cases",
      });
      return;
    }

    if (!adminNotes || adminNotes.trim() === "") {
      res.status(400).json({
        success: false,
        error: "Admin notes are required when rejecting a case",
      });
      return;
    }

    const legalCase = await prisma.legalCase.update({
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
      data: legalCase,
    });
  } catch (error) {
    console.error("Reject legal case error:", error);
    res.status(500).json({
      success: false,
      error: "Server error rejecting legal case",
    });
  }
};

// Delete legal case (Legal Officers can delete their own, Admins can delete any)
export const deleteLegalCase = async (
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

    // Check if user can delete this case
    const existingCase = await prisma.legalCase.findUnique({
      where: { id: Number(id) },
      select: { createdBy: true },
    });

    if (!existingCase) {
      res.status(404).json({
        success: false,
        error: "Legal case not found",
      });
      return;
    }

    // Legal Officers can only delete their own cases
    // Admins can delete any case
    if (user.roles === 2 && existingCase.createdBy !== userId) {
      res.status(403).json({
        success: false,
        error: "You can only delete your own cases",
      });
      return;
    }

    await prisma.legalCase.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: "Legal case deleted successfully",
    });
  } catch (error) {
    console.error("Delete legal case error:", error);
    res.status(500).json({
      success: false,
      error: "Server error deleting legal case",
    });
  }
};

// Toggle case active status (Admin only)
export const toggleCaseStatus = async (
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
        error: "Only admins can toggle case status",
      });
      return;
    }

    const legalCase = await prisma.legalCase.update({
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
      data: legalCase,
    });
  } catch (error) {
    console.error("Toggle case status error:", error);
    res.status(500).json({
      success: false,
      error: "Server error toggling case status",
    });
  }
};
