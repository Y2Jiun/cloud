import { Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../middleware/auth";

export const getUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            {
              username: {
                contains: String(search),
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: String(search),
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          userid: true,
          email: true,
          username: true,
          contact: true,
          profilepic: true,
          roles: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting users",
    });
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { userid: Number(id) },
      select: {
        userid: true,
        email: true,
        username: true,
        contact: true,
        profilepic: true,
        roles: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting user",
    });
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, contact, profilepic } = req.body;

    const user = await prisma.user.update({
      where: { userid: Number(id) },
      data: {
        ...(username && { username }),
        ...(contact && { contact }),
        ...(profilepic && { profilepic }),
      },
      select: {
        userid: true,
        email: true,
        username: true,
        contact: true,
        profilepic: true,
        roles: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      error: "Server error updating user",
    });
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent users from deleting themselves
    if (Number(id) === req.user!.id) {
      res.status(400).json({
        success: false,
        error: "Cannot delete your own account",
      });
      return;
    }

    await prisma.user.delete({
      where: { userid: Number(id) },
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      error: "Server error deleting user",
    });
  }
};
