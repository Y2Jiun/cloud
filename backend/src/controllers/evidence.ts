import { Request, Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../middleware/auth";

// Create new evidence
export const createEvidence = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, fileUrl, caseId } = req.body;
    const userRole = req.user?.roles;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check if user has permission (officers and admins)
    if (userRole !== 1 && userRole !== 2) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if the case exists
    const legalCase = await prisma.legalCase.findUnique({
      where: { id: caseId },
    });

    if (!legalCase) {
      return res.status(404).json({ error: "Legal case not found" });
    }

    // Officers can only add evidence to their own cases
    if (userRole === 2 && legalCase.createdBy !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const evidence = await prisma.evidence.create({
      data: {
        title,
        description,
        fileUrl,
        caseId,
      },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            createdByUser: {
              select: {
                userid: true,
                username: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: "Evidence created successfully",
      evidence,
    });
  } catch (error) {
    console.error("Error creating evidence:", error);
    return res.status(500).json({ error: "Failed to create evidence" });
  }
};

// Get evidence for a specific case
export const getEvidenceByCase = async (req: AuthRequest, res: Response) => {
  try {
    const { caseId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.roles;

    // Check if the case exists
    const legalCase = await prisma.legalCase.findUnique({
      where: { id: parseInt(caseId) },
    });

    if (!legalCase) {
      return res.status(404).json({ error: "Legal case not found" });
    }

    // Officers can only see evidence for their own cases
    if (userRole === 2 && legalCase.createdBy !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const evidence = await prisma.evidence.findMany({
      where: { caseId: parseInt(caseId) },
      include: {
        case: {
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

    res.json({ evidence });
  } catch (error) {
    console.error("Error fetching evidence:", error);
    return res.status(500).json({ error: "Failed to fetch evidence" });
  }
};

// Get all evidence (Admin only)
export const getAllEvidence = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.roles;

    if (userRole !== 1) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const evidence = await prisma.evidence.findMany({
      include: {
        case: {
          select: {
            id: true,
            title: true,
            createdByUser: {
              select: {
                userid: true,
                username: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ evidence });
  } catch (error) {
    console.error("Error fetching all evidence:", error);
    return res.status(500).json({ error: "Failed to fetch evidence" });
  }
};

// Get single evidence
export const getEvidence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.roles;

    const evidence = await prisma.evidence.findUnique({
      where: { id: parseInt(id) },
      include: {
        case: {
          include: {
            createdByUser: {
              select: {
                userid: true,
                username: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!evidence) {
      return res.status(404).json({ error: "Evidence not found" });
    }

    // Officers can only see evidence for their own cases
    if (userRole === 2 && evidence.case.createdBy !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ evidence });
  } catch (error) {
    console.error("Error fetching evidence:", error);
    return res.status(500).json({ error: "Failed to fetch evidence" });
  }
};

// Update evidence
export const updateEvidence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, fileUrl } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.roles;

    const existingEvidence = await prisma.evidence.findUnique({
      where: { id: parseInt(id) },
      include: {
        case: true,
      },
    });

    if (!existingEvidence) {
      return res.status(404).json({ error: "Evidence not found" });
    }

    // Officers can only update evidence for their own cases
    if (userRole === 2 && existingEvidence.case.createdBy !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedEvidence = await prisma.evidence.update({
      where: { id: parseInt(id) },
      data: { title, description, fileUrl },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            createdByUser: {
              select: {
                userid: true,
                username: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.json({
      message: "Evidence updated successfully",
      evidence: updatedEvidence,
    });
  } catch (error) {
    console.error("Error updating evidence:", error);
    return res.status(500).json({ error: "Failed to update evidence" });
  }
};

// Delete evidence
export const deleteEvidence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.roles;

    const existingEvidence = await prisma.evidence.findUnique({
      where: { id: parseInt(id) },
      include: {
        case: true,
      },
    });

    if (!existingEvidence) {
      return res.status(404).json({ error: "Evidence not found" });
    }

    // Officers can only delete evidence for their own cases
    if (userRole === 2 && existingEvidence.case.createdBy !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.evidence.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Evidence deleted successfully" });
  } catch (error) {
    console.error("Error deleting evidence:", error);
    return res.status(500).json({ error: "Failed to delete evidence" });
  }
};
