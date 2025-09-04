import { Request, Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../middleware/auth";

// Get all FAQs (public access)
export const getAllFAQs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search, category, status, sortBy = "lastUpdated" } = req.query;

    // Build where clause
    const where: any = {
      status: "published", // Only show published FAQs
    };

    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: "insensitive" as any } },
        { content: { contains: String(search), mode: "insensitive" as any } },
        { tags: { contains: String(search), mode: "insensitive" as any } },
      ];
    }

    if (category && category !== "All Categories") {
      where.category = category;
    }

    // Build order by clause
    let orderBy: any = { updatedAt: "desc" };
    if (sortBy === "title") {
      orderBy = { title: "asc" };
    } else if (sortBy === "views") {
      orderBy = { views: "desc" };
    } else if (sortBy === "helpful") {
      orderBy = { helpful: "desc" };
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy,
      include: {
        createdByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    console.error("Get FAQs error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting FAQs",
    });
  }
};

// Get FAQ by ID (public access)
export const getFAQById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const faq = await prisma.fAQ.findUnique({
      where: { id: Number(id) },
      include: {
        createdByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!faq) {
      res.status(404).json({
        success: false,
        error: "FAQ not found",
      });
      return;
    }

    // Increment view count
    await prisma.fAQ.update({
      where: { id: Number(id) },
      data: { views: { increment: 1 } },
    });

    res.json({
      success: true,
      data: faq,
    });
  } catch (error) {
    console.error("Get FAQ by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting FAQ",
    });
  }
};

// Create FAQ (admin only)
export const createFAQ = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content, category, tags, status, isPinned } = req.body;
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
        error: "Only admins can create FAQs",
      });
      return;
    }

    // Convert tags array to string if it's an array
    const tagsString = Array.isArray(tags) ? tags.join(", ") : tags;

    const faq = await prisma.fAQ.create({
      data: {
        title,
        content,
        category,
        tags: tagsString,
        status: status || "draft",
        isPinned: isPinned || false,
        views: 0,
        helpful: 0,
        createdBy: userId,
      },
      include: {
        createdByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: faq,
    });
  } catch (error) {
    console.error("Create FAQ error:", error);
    res.status(500).json({
      success: false,
      error: "Server error creating FAQ",
    });
  }
};

// Update FAQ (admin only)
export const updateFAQ = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, status, isPinned } = req.body;
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
        error: "Only admins can update FAQs",
      });
      return;
    }

    // Convert tags array to string if it's an array
    const tagsString = Array.isArray(tags) ? tags.join(", ") : tags;

    const faq = await prisma.fAQ.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        category,
        tags: tagsString,
        status,
        isPinned,
      },
      include: {
        createdByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: faq,
    });
  } catch (error) {
    console.error("Update FAQ error:", error);
    res.status(500).json({
      success: false,
      error: "Server error updating FAQ",
    });
  }
};

// Delete FAQ (admin only)
export const deleteFAQ = async (
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
        error: "Only admins can delete FAQs",
      });
      return;
    }

    await prisma.fAQ.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error("Delete FAQ error:", error);
    res.status(500).json({
      success: false,
      error: "Server error deleting FAQ",
    });
  }
};

// Mark FAQ as helpful
export const markHelpful = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const faq = await prisma.fAQ.update({
      where: { id: Number(id) },
      data: { helpful: { increment: 1 } },
    });

    res.json({
      success: true,
      data: faq,
    });
  } catch (error) {
    console.error("Mark helpful error:", error);
    res.status(500).json({
      success: false,
      error: "Server error marking FAQ as helpful",
    });
  }
};

// Get all FAQs for admin (including drafts)
export const getAdminFAQs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
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
        error: "Only admins can access admin FAQs",
      });
      return;
    }

    const faqs = await prisma.fAQ.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        createdByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    console.error("Get admin FAQs error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting admin FAQs",
    });
  }
};
