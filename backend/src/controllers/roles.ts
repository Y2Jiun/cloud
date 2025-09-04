import { Response } from "express";
import { prisma } from "../index";
import { 
  AuthRequest, 
  ROLES, 
  ROLE_NAMES,
  isAdmin 
} from "../middleware/auth";

// Get all users with their roles (Admin only)
export const getAllUsersWithRoles = async (
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

    const users = await prisma.user.findMany({
      select: {
        userid: true,
        username: true,
        name: true,
        email: true,
        roles: true,
        created_at: true,
        last_login: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Transform data to include role names
    const usersWithRoleNames = users.map(user => ({
      ...user,
      roleName: ROLE_NAMES[user.roles as keyof typeof ROLE_NAMES],
    }));

    res.json({
      success: true,
      data: usersWithRoleNames,
      message: `Retrieved ${users.length} users`,
    });
  } catch (error) {
    console.error("Error fetching users with roles:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (
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

    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = Object.values(ROLES);
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        error: `Invalid role. Valid roles are: ${validRoles.join(", ")}`,
      });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { userid: parseInt(userId) },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Prevent admin from changing their own role
    if (existingUser.userid === req.user?.id) {
      res.status(400).json({
        success: false,
        error: "You cannot change your own role",
      });
      return;
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { userid: parseInt(userId) },
      data: { roles: role },
      select: {
        userid: true,
        username: true,
        name: true,
        email: true,
        roles: true,
      },
    });

    res.json({
      success: true,
      data: {
        ...updatedUser,
        roleName: ROLE_NAMES[updatedUser.roles as keyof typeof ROLE_NAMES],
      },
      message: `User role updated to ${ROLE_NAMES[role as keyof typeof ROLE_NAMES]}`,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user role",
    });
  }
};

// Get role statistics (Admin only)
export const getRoleStatistics = async (
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

    const roleStats = await prisma.user.groupBy({
      by: ['roles'],
      _count: {
        userid: true,
      },
    });

    // Transform data to include role names
    const statsWithNames = roleStats.map(stat => ({
      role: stat.roles,
      roleName: ROLE_NAMES[stat.roles as keyof typeof ROLE_NAMES],
      count: stat._count.userid,
    }));

    // Calculate total users
    const totalUsers = statsWithNames.reduce((sum, stat) => sum + stat.count, 0);

    res.json({
      success: true,
      data: {
        roleBreakdown: statsWithNames,
        totalUsers,
        availableRoles: Object.entries(ROLE_NAMES).map(([value, name]) => ({
          value: parseInt(value),
          name,
        })),
      },
      message: "Role statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching role statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch role statistics",
    });
  }
};

// Get current user's role info
export const getCurrentUserRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.roles;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        userId,
        role: userRole,
        roleName: ROLE_NAMES[userRole as keyof typeof ROLE_NAMES],
        permissions: {
          canViewAllReports: userRole === ROLES.ADMIN || userRole === ROLES.LEGAL_OFFICER,
          canManageLegalCases: userRole === ROLES.ADMIN || userRole === ROLES.LEGAL_OFFICER,
          canAccessAdmin: userRole === ROLES.ADMIN,
          canManageUsers: userRole === ROLES.ADMIN,
          canDeleteReports: userRole === ROLES.ADMIN,
          canApproveComments: userRole === ROLES.ADMIN,
        },
      },
      message: "User role information retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user role information",
    });
  }
};
