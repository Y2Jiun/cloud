import { Request, Response } from "express";
import { prisma } from "../index";
import {
  AuthRequest,
  ROLES,
  canViewAllReports,
  canAccessResource,
  isAdmin,
  isLegalOfficer,
  isUser,
} from "../middleware/auth";

// Create a new scam report
export const createScamReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, scammerInfo, platform } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    // Input validation
    if (!title || !description || !scammerInfo || !platform) {
      res.status(400).json({
        success: false,
        error: "Title, description, scammer info, and platform are required",
      });
      return;
    }

    // Content length validation
    if (title.length > 200) {
      res.status(400).json({
        success: false,
        error: "Title must be less than 200 characters",
      });
      return;
    }

    if (description.length > 5000) {
      res.status(400).json({
        success: false,
        error: "Description must be less than 5000 characters",
      });
      return;
    }

    const scamReport = await prisma.scamReport.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        scammerInfo: scammerInfo.trim(),
        platform: platform.trim(),
        userId,
        status: "pending", // Default status
      },
      include: {
        user: {
          select: {
            userid: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Scam report created successfully",
      data: scamReport,
    });
  } catch (error) {
    console.error("Error creating scam report:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create scam report",
    });
  }
};

// Get all scam reports (with role-based filtering)
export const getScamReports = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    let whereClause: any = {};

    // Role-based filtering using new role system
    if (isUser(req)) {
      // Regular users can only see their own reports
      whereClause.userId = userId;
    } else if (isLegalOfficer(req)) {
      // Legal officers can see all reports (for investigation)
      // No additional filtering needed
    } else if (isAdmin(req)) {
      // Admins can see all reports
      // No additional filtering needed
    }

    const scamReports = await prisma.scamReport.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            userid: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: scamReports,
      message: `Retrieved ${scamReports.length} scam reports`,
    });
  } catch (error) {
    console.error("Error fetching scam reports:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch scam reports",
    });
  }
};

// Get a single scam report
export const getScamReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.roles;

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        success: false,
        error: "Valid report ID is required",
      });
      return;
    }

    const scamReport = await prisma.scamReport.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            userid: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!scamReport) {
      res.status(404).json({
        success: false,
        error: "Scam report not found",
      });
      return;
    }

    // Check permissions using role constants
    if (userRole === ROLES.USER && scamReport.userId !== userId) {
      res.status(403).json({
        success: false,
        error: "Access denied",
      });
      return;
    }

    res.json({
      success: true,
      data: scamReport,
    });
  } catch (error) {
    console.error("Error fetching scam report:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch scam report",
    });
  }
};

// Update scam report (for users to edit their own, admins to change status)
export const updateScamReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.roles;
    const { title, description, scammerInfo, platform, status } = req.body;

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        success: false,
        error: "Valid report ID is required",
      });
      return;
    }

    const existingReport = await prisma.scamReport.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingReport) {
      res.status(404).json({
        success: false,
        error: "Scam report not found",
      });
      return;
    }

    // Check permissions using role constants
    if (userRole === ROLES.USER && existingReport.userId !== userId) {
      res.status(403).json({
        success: false,
        error: "Access denied",
      });
      return;
    }

    let updateData: any = {};

    // Users can only update content, not status
    if (userRole === ROLES.USER) {
      updateData = { title, description, scammerInfo, platform };
    } else if (userRole === ROLES.ADMIN) {
      // Admins can update everything including status
      updateData = { title, description, scammerInfo, platform, status };
    }

    // Validate update data
    if (title && title.length > 200) {
      res.status(400).json({
        success: false,
        error: "Title must be less than 200 characters",
      });
      return;
    }

    if (description && description.length > 5000) {
      res.status(400).json({
        success: false,
        error: "Description must be less than 5000 characters",
      });
      return;
    }

    const updatedReport = await prisma.scamReport.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            userid: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Scam report updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    console.error("Error updating scam report:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update scam report",
    });
  }
};

// Delete scam report
export const deleteScamReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.roles;

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        success: false,
        error: "Valid report ID is required",
      });
      return;
    }

    const existingReport = await prisma.scamReport.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingReport) {
      res.status(404).json({
        success: false,
        error: "Scam report not found",
      });
      return;
    }

    // Check permissions using role constants
    if (userRole === ROLES.USER && existingReport.userId !== userId) {
      res.status(403).json({
        success: false,
        error: "Access denied",
      });
      return;
    }

    await prisma.scamReport.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Scam report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting scam report:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete scam report",
    });
  }
};

// Search scam reports
export const searchScamReports = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.query;
    const userRole = req.user?.roles;

    if (!query || typeof query !== "string") {
      res.status(400).json({
        success: false,
        error: "Search query is required",
      });
      return;
    }

    let whereClause: any = {
      OR: [
        { title: { contains: query.trim() } },
        { description: { contains: query.trim() } },
        { scammerInfo: { contains: query.trim() } },
        { platform: { contains: query.trim() } },
      ],
    };

    // Apply role-based filtering using role constants
    if (userRole === ROLES.USER || userRole === ROLES.LEGAL_OFFICER) {
      whereClause.status = "approved";
    }

    const scamReports = await prisma.scamReport.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            userid: true,
            username: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: scamReports,
    });
  } catch (error) {
    console.error("Error searching scam reports:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search scam reports",
    });
  }
};

// Approve scam report (Admin only)
export const approveScamReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.roles;

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        success: false,
        error: "Valid report ID is required",
      });
      return;
    }

    // Check if user is admin
    if (userRole !== ROLES.ADMIN) {
      res.status(403).json({
        success: false,
        error: "Only admins can approve scam reports",
      });
      return;
    }

    const existingReport = await prisma.scamReport.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingReport) {
      res.status(404).json({
        success: false,
        error: "Scam report not found",
      });
      return;
    }

    // Update report status to approved
    const updatedReport = await prisma.scamReport.update({
      where: { id: parseInt(id) },
      data: {
        status: "approved",
      },
      include: {
        user: {
          select: {
            userid: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Scam report approved successfully",
      data: updatedReport,
    });
  } catch (error) {
    console.error("Approve scam report error:", error);
    res.status(500).json({
      success: false,
      error: "Server error approving scam report",
    });
  }
};

// Reject scam report (Admin only)
export const rejectScamReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.roles;

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        success: false,
        error: "Valid report ID is required",
      });
      return;
    }

    // Check if user is admin
    if (userRole !== ROLES.ADMIN) {
      res.status(403).json({
        success: false,
        error: "Only admins can reject scam reports",
      });
      return;
    }

    if (!adminNotes || adminNotes.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: "Admin notes are required when rejecting a report",
      });
      return;
    }

    const existingReport = await prisma.scamReport.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingReport) {
      res.status(404).json({
        success: false,
        error: "Scam report not found",
      });
      return;
    }

    // Update report status to rejected
    const updatedReport = await prisma.scamReport.update({
      where: { id: parseInt(id) },
      data: {
        status: "rejected",
        adminNotes: adminNotes.trim(),
      },
      include: {
        user: {
          select: {
            userid: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Scam report rejected successfully",
      data: updatedReport,
    });
  } catch (error) {
    console.error("Reject scam report error:", error);
    res.status(500).json({
      success: false,
      error: "Server error rejecting scam report",
    });
  }
};
