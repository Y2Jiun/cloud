import { Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../middleware/auth";

// Create a checklist
export const createChecklist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, items } = req.body as {
      title: string;
      description?: string;
      items?: Array<{ text: string; category?: string; orderIndex?: number }>;
    };

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const checklist = await prisma.userChecklist.create({
      data: {
        userId,
        title: title.trim(),
        description: description?.trim() || null,
        items:
          items && items.length > 0
            ? {
                create: items.map((i, idx) => ({
                  text: i.text,
                  category: i.category || "GENERAL",
                  orderIndex: i.orderIndex ?? idx,
                })),
              }
            : undefined,
      },
      include: { items: true },
    });

    return res.status(201).json({ success: true, data: checklist });
  } catch (error) {
    console.error("Error creating checklist:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to create checklist" });
  }
};

// Get all checklists for current user
export const getChecklists = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const lists = await prisma.userChecklist.findMany({
      where: { userId },
      include: { items: { orderBy: { orderIndex: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: lists });
  } catch (error) {
    console.error("Error fetching checklists:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch checklists" });
  }
};

// Update a checklist (title/description/isCompleted)
export const updateChecklist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { title, description, isCompleted } = req.body as {
      title?: string;
      description?: string;
      isCompleted?: boolean;
    };

    const existing = await prisma.userChecklist.findUnique({
      where: { id: Number(id) },
    });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    const updated = await prisma.userChecklist.update({
      where: { id: Number(id) },
      data: {
        title: title?.trim(),
        description:
          description === undefined ? undefined : description?.trim() || null,
        isCompleted,
      },
      include: { items: true },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating checklist:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to update checklist" });
  }
};

// Delete a checklist
export const deleteChecklist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;

    const existing = await prisma.userChecklist.findUnique({
      where: { id: Number(id) },
    });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    await prisma.checklistItem.deleteMany({
      where: { checklistId: Number(id) },
    });
    await prisma.userChecklist.delete({ where: { id: Number(id) } });

    return res.json({ success: true, message: "Checklist deleted" });
  } catch (error) {
    console.error("Error deleting checklist:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to delete checklist" });
  }
};

// Add item to checklist
export const addItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { checklistId } = req.params;
    const { text, category, orderIndex } = req.body as {
      text: string;
      category?: string;
      orderIndex?: number;
    };

    const checklist = await prisma.userChecklist.findUnique({
      where: { id: Number(checklistId) },
    });
    if (!checklist || checklist.userId !== userId)
      return res.status(404).json({ error: "Checklist not found" });

    const item = await prisma.checklistItem.create({
      data: {
        checklistId: Number(checklistId),
        text,
        category: category || "GENERAL",
        orderIndex: orderIndex ?? 0,
      },
    });

    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error("Error adding item:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to add item" });
  }
};

// Update item
export const updateItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { itemId } = req.params;
    const { text, category, isCompleted, orderIndex } = req.body as {
      text?: string;
      category?: string;
      isCompleted?: boolean;
      orderIndex?: number;
    };

    const existing = await prisma.checklistItem.findUnique({
      where: { id: Number(itemId) },
      include: { checklist: true },
    });

    if (!existing || existing.checklist.userId !== userId) {
      return res.status(404).json({ error: "Item not found" });
    }

    const updated = await prisma.checklistItem.update({
      where: { id: Number(itemId) },
      data: { text, category, isCompleted, orderIndex },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating item:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to update item" });
  }
};

// Delete item
export const deleteItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { itemId } = req.params;

    const existing = await prisma.checklistItem.findUnique({
      where: { id: Number(itemId) },
      include: { checklist: true },
    });

    if (!existing || existing.checklist.userId !== userId) {
      return res.status(404).json({ error: "Item not found" });
    }

    await prisma.checklistItem.delete({ where: { id: Number(itemId) } });
    return res.json({ success: true, message: "Item deleted" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to delete item" });
  }
};




