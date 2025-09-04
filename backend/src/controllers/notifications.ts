import { Request, Response } from "express";
import { prisma } from "../index";
import {
  AuthRequest,
  ROLES,
  isAdmin,
  canAccessResource,
} from "../middleware/auth";

// Create a new notification (Admin only)
export const createNotification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!isAdmin(req)) {
      res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required.",
      });
      return;
    }

    const { title, description, roles, type, priority, expiresAt } = req.body;

    // Input validation
    if (!title || !description) {
      res.status(400).json({
        success: false,
        error: "Title and description are required",
      });
      return;
    }

    // Validate roles (1=User, 2=Legal Officer Only, 3=All Users)
    if (![1, 2, 3].includes(roles)) {
      res.status(400).json({
        success: false,
        error: "Invalid roles value. Must be 1, 2, or 3",
      });
      return;
    }

    // Validate type (1=Notification, 2=Announcement, 3=Alert)
    if (![1, 2, 3].includes(type)) {
      res.status(400).json({
        success: false,
        error: "Invalid type value. Must be 1, 2, or 3",
      });
      return;
    }

    const notification = await prisma.notification.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        roles,
        type,
        priority: priority || "medium",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: req.user!.id,
      },
      include: {
        createdByUser: {
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
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create notification",
    });
  }
};

// Get all notifications (with role-based filtering)
export const getNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.roles;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    let whereClause: any = {};

    // Role-based filtering
    if (userRole === ROLES.USER) {
      // Regular users can only see notifications for all users (roles = 3)
      whereClause.roles = 3;
    } else if (userRole === ROLES.LEGAL_OFFICER) {
      // Legal officers can see notifications for all users and legal officer only
      whereClause.roles = { in: [2, 3] };
    }
    // Admins can see all notifications

    // Filter by status (only show active notifications)
    whereClause.status = "active";

    // Filter by expiration (don't show expired notifications)
    whereClause.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        createdByUser: {
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
      data: notifications,
      message: `Retrieved ${notifications.length} notifications`,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notifications",
    });
  }
};

// Get all notifications for admin management (Admin only)
export const getAllNotificationsForAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!isAdmin(req)) {
      res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required.",
      });
      return;
    }

    const notifications = await prisma.notification.findMany({
      include: {
        createdByUser: {
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
      data: notifications,
      message: `Retrieved ${notifications.length} notifications`,
    });
  } catch (error) {
    console.error("Error fetching notifications for admin:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notifications",
    });
  }
};

// Get a single notification
export const getNotification = async (
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
        error: "Valid notification ID is required",
      });
      return;
    }

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdByUser: {
          select: {
            userid: true,
            username: true,
            name: true,
          },
        },
      },
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        error: "Notification not found",
      });
      return;
    }

    // Check access permissions
    if (userRole === ROLES.USER && notification.roles !== 3) {
      res.status(403).json({
        success: false,
        error: "Access denied",
      });
      return;
    }

    if (
      userRole === ROLES.LEGAL_OFFICER &&
      ![2, 3].includes(notification.roles)
    ) {
      res.status(403).json({
        success: false,
        error: "Access denied",
      });
      return;
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notification",
    });
  }
};

// Update notification (Admin only)
export const updateNotification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!isAdmin(req)) {
      res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required.",
      });
      return;
    }

    const { id } = req.params;
    const { title, description, roles, type, priority, status, expiresAt } =
      req.body;

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        success: false,
        error: "Valid notification ID is required",
      });
      return;
    }

    const existingNotification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingNotification) {
      res.status(404).json({
        success: false,
        error: "Notification not found",
      });
      return;
    }

    // Validate roles and type if provided
    if (roles && ![1, 2, 3].includes(roles)) {
      res.status(400).json({
        success: false,
        error: "Invalid roles value. Must be 1, 2, or 3",
      });
      return;
    }

    if (type && ![1, 2, 3].includes(type)) {
      res.status(400).json({
        success: false,
        error: "Invalid type value. Must be 1, 2, or 3",
      });
      return;
    }

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (roles) updateData.roles = roles;
    if (type) updateData.type = type;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        createdByUser: {
          select: {
            userid: true,
            username: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Notification updated successfully",
      data: updatedNotification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update notification",
    });
  }
};

// Delete notification (Admin only)
export const deleteNotification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!isAdmin(req)) {
      res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required.",
      });
      return;
    }

    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        success: false,
        error: "Valid notification ID is required",
      });
      return;
    }

    const existingNotification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingNotification) {
      res.status(404).json({
        success: false,
        error: "Notification not found",
      });
      return;
    }

    await prisma.notification.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete notification",
    });
  }
};

// Delete notification for user (User can delete notifications they can see)
export const deleteNotificationForUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        success: false,
        error: "Valid notification ID is required",
      });
      return;
    }

    // Find the notification and check if user can access it
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        error: "Notification not found",
      });
      return;
    }

    // Check if user can access this notification based on their role
    const userRole = req.user?.roles;
    let canAccess = false;

    if (userRole === ROLES.ADMIN) {
      canAccess = true; // Admins can delete any notification
    } else if (
      userRole === ROLES.LEGAL_OFFICER &&
      (notification.roles === 2 || notification.roles === 3)
    ) {
      canAccess = true; // Legal officers can delete notifications for legal officers or all users
    } else if (userRole === ROLES.USER && notification.roles === 3) {
      canAccess = true; // Regular users can only delete notifications for all users
    }

    if (!canAccess) {
      res.status(403).json({
        success: false,
        error: "Access denied. You cannot delete this notification.",
      });
      return;
    }

    await prisma.notification.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification for user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete notification",
    });
  }
};

// Search notifications
export const searchNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { query, type, priority, status } = req.query;
    const userRole = req.user?.roles;

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    let whereClause: any = {};

    // Role-based filtering
    if (userRole === ROLES.USER) {
      whereClause.roles = 3;
    } else if (userRole === ROLES.LEGAL_OFFICER) {
      whereClause.roles = { in: [2, 3] };
    }

    // Search query
    if (query && typeof query === "string") {
      whereClause.OR = [
        { title: { contains: query.trim() } },
        { description: { contains: query.trim() } },
      ];
    }

    // Type filter
    if (type && typeof type === "string") {
      whereClause.type = parseInt(type);
    }

    // Priority filter
    if (priority && typeof priority === "string") {
      whereClause.priority = priority;
    }

    // Status filter
    if (status && typeof status === "string") {
      whereClause.status = status;
    }

    // Only show active and non-expired notifications
    whereClause.status = "active";
    whereClause.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        createdByUser: {
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
      data: notifications,
    });
  } catch (error) {
    console.error("Error searching notifications:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search notifications",
    });
  }
};
