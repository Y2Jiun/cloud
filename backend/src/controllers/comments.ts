import { Request, Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../middleware/auth";

// Create a new comment
export const createComment = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { content, alertId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check if the alert exists
    const alert = await prisma.scamAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      return res.status(404).json({ error: "Scam alert not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        alertId,
        userId,
        status: "pending", // Default status
      },
      include: {
        user: {
          select: {
            userid: true,
            username: true,
            name: true,
          },
        },
        alert: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Comment created successfully. Awaiting admin approval.",
      comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ error: "Failed to create comment" });
  }
};

// Get comments for a specific alert
export const getCommentsByAlert = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { alertId } = req.params;
    const userRole = req.user?.roles;

    let whereClause: any = { alertId: parseInt(alertId) };

    // Non-admins can only see approved comments
    if (userRole !== 1) {
      whereClause.status = "approved";
    }

    const comments = await prisma.comment.findMany({
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

    return res.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// Get all comments (Admin only - for moderation)
export const getAllComments = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.roles;

    if (userRole !== 1) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const comments = await prisma.comment.findMany({
      include: {
        user: {
          select: {
            userid: true,
            username: true,
            name: true,
          },
        },
        alert: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ comments });
  } catch (error) {
    console.error("Error fetching all comments:", error);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// Update comment (for users to edit their own, admins to change status)
export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.roles;
    const { content, status } = req.body;

    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check permissions
    if (userRole === 3 && existingComment.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    let updateData: any = {};

    // Users can only update content
    if (userRole === 3) {
      updateData = { content };
    } else if (userRole === 1) {
      // Admins can update content and status
      updateData = { content, status };
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            userid: true,
            username: true,
            name: true,
          },
        },
        alert: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ error: "Failed to update comment" });
  }
};

// Delete comment
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.roles;

    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check permissions
    if (userRole === 3 && existingComment.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Failed to delete comment" });
  }
};

// Approve comment (Admin only)
export const approveComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.roles;

    if (userRole !== 1) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { status: "approved" },
      include: {
        user: {
          select: {
            userid: true,
            username: true,
            name: true,
          },
        },
        alert: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json({
      message: "Comment approved successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Error approving comment:", error);
    return res.status(500).json({ error: "Failed to approve comment" });
  }
};

// Reject comment (Admin only)
export const rejectComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.roles;

    if (userRole !== 1) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { status: "rejected" },
      include: {
        user: {
          select: {
            userid: true,
            username: true,
            name: true,
          },
        },
        alert: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json({
      message: "Comment rejected successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Error rejecting comment:", error);
    return res.status(500).json({ error: "Failed to reject comment" });
  }
};
