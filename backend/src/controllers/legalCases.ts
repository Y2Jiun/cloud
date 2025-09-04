import { Request, Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../middleware/auth";

// Create a new legal case (Legal Officer only)
export const createLegalCase = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, caseNumber, priority } = req.body;
    const userId = Number(req.user?.id);
    const userRole = req.user?.roles;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (userRole !== 2) {
      return res.status(403).json({ error: "Access denied. Legal Officer only." });
    }

    // Validate required fields
    if (!title || !description || !caseNumber) {
      return res.status(400).json({ error: "Title, description, and case number are required" });
    }

    // Check if case number already exists
    const existingCase = await prisma.legalCase.findUnique({
      where: { caseNumber },
    });

    if (existingCase) {
      return res.status(400).json({ error: "Case number already exists" });
    }

    const legalCase = await prisma.legalCase.create({
      data: {
        title,
        description,
        caseNumber,
        priority: priority || "MEDIUM",
        status: "pending", // Default status - needs admin approval
        createdBy: userId,
        isActive: true,
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
        evidence: true,
        documents: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Legal case created successfully",
      data: legalCase,
    });
  } catch (error) {
    console.error("Error creating legal case:", error);
    return res.status(500).json({ success: false, error: "Failed to create legal case" });
  }
};

// Get legal cases based on user role
export const getLegalCases = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const userRole = req.user?.roles;
    const { status } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    let whereClause: any = {};

    // Different access based on user role
    if (userRole === 1) {
      // Admin - see all cases
      if (status) {
        whereClause.status = status;
      }
    } else if (userRole === 2) {
      // Legal Officer - see own cases + approved cases
      if (status) {
        whereClause.OR = [
          { createdBy: userId },
          { status: "approved" }
        ];
        whereClause.status = status;
      } else {
        whereClause.OR = [
          { createdBy: userId },
          { status: "approved" }
        ];
      }
    } else {
      // Regular user - see only approved cases
      whereClause.status = "approved";
      if (status && status !== "approved") {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const legalCases = await prisma.legalCase.findMany({
      where: whereClause,
      include: {
        createdByUser: {
          select: {
            userid: true,
            username: true,
            name: true,
            email: true,
          },
        },
        approvedByUser: {
          select: {
            userid: true,
            username: true,
            name: true,
            email: true,
          },
        },
        evidence: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
        documents: {
          select: {
            id: true,
            title: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: legalCases,
    });
  } catch (error) {
    console.error("Error fetching legal cases:", error);
    res.status(500).json({ success: false, error: "Failed to fetch legal cases" });
  }
};

// Get a single legal case
export const getLegalCase = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(req.user?.id);
    const userRole = req.user?.roles;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const legalCase = await prisma.legalCase.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdByUser: {
          select: {
            userid: true,
            username: true,
            name: true,
            email: true,
          },
        },
        approvedByUser: {
          select: {
            userid: true,
            username: true,
            name: true,
            email: true,
          },
        },
        evidence: {
          orderBy: {
            createdAt: "desc",
          },
        },
        documents: {
          orderBy: {
            createdAt: "desc",
          },
        },
        scamReports: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!legalCase) {
      return res.status(404).json({ error: "Legal case not found" });
    }

    // Check permissions
    if (userRole === 2 && legalCase.createdBy !== userId && legalCase.status !== "approved") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (userRole === 3 && legalCase.status !== "approved") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({
      success: true,
      data: legalCase,
    });
  } catch (error) {
    console.error("Error fetching legal case:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch legal case" });
  }
};

// Update legal case (Legal Officer only, own cases)
export const updateLegalCase = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;
    const userId = Number(req.user?.id);
    const userRole = req.user?.roles;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (userRole !== 2) {
      return res.status(403).json({ error: "Access denied. Legal Officer only." });
    }

    const existingCase = await prisma.legalCase.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCase) {
      return res.status(404).json({ error: "Legal case not found" });
    }

    // Check permissions - Legal Officers can only edit their own cases
    if (existingCase.createdBy !== userId) {
      return res.status(403).json({ error: "Access denied. You can only edit your own cases." });
    }

    // Cannot edit approved/rejected cases
    if (existingCase.status !== "pending") {
      return res.status(400).json({ error: "Cannot edit case that has been processed" });
    }

    const updatedCase = await prisma.legalCase.update({
      where: { id: parseInt(id) },
      data: { 
        title, 
        description, 
        priority,
        status: "pending", // Reset to pending for admin review
        approvedBy: null, // Clear previous approval
        adminNotes: null, // Clear previous notes
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
        evidence: true,
        documents: true,
      },
    });

    res.json({
      success: true,
      message: "Legal case updated successfully",
      data: updatedCase,
    });
  } catch (error) {
    console.error("Error updating legal case:", error);
    return res.status(500).json({ success: false, error: "Failed to update legal case" });
  }
};

// Delete legal case (Legal Officer only, own cases)
export const deleteLegalCase = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(req.user?.id);
    const userRole = req.user?.roles;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (userRole !== 2) {
      return res.status(403).json({ error: "Access denied. Legal Officer only." });
    }

    const existingCase = await prisma.legalCase.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCase) {
      return res.status(404).json({ error: "Legal case not found" });
    }

    // Check permissions - Legal Officers can only delete their own cases
    if (existingCase.createdBy !== userId) {
      return res.status(403).json({ error: "Access denied. You can only delete your own cases." });
    }

    // Cannot delete approved/rejected cases
    if (existingCase.status !== "pending") {
      return res.status(400).json({ error: "Cannot delete case that has been processed" });
    }

    // Delete associated documents first
    await prisma.legalCaseDocument.deleteMany({
      where: { caseId: parseInt(id) },
    });

    // Delete associated evidence
    await prisma.evidence.deleteMany({
      where: { caseId: parseInt(id) },
    });

    // Then delete the case
    await prisma.legalCase.delete({
      where: { id: parseInt(id) },
    });

    res.json({ 
      success: true,
      message: "Legal case deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting legal case:", error);
    return res.status(500).json({ success: false, error: "Failed to delete legal case" });
  }
};

// Approve legal case (Admin only)
export const approveLegalCase = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const userId = Number(req.user?.id);
    const userRole = req.user?.roles;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (userRole !== 1) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const existingCase = await prisma.legalCase.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCase) {
      return res.status(404).json({ error: "Legal case not found" });
    }

    if (existingCase.status !== "pending") {
      return res.status(400).json({ error: "Case is not pending approval" });
    }

    const updatedCase = await prisma.legalCase.update({
      where: { id: parseInt(id) },
      data: {
        status: "approved",
        approvedBy: userId,
        adminNotes: adminNotes || null,
        isActive: true,
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
        approvedByUser: {
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
      message: "Legal case approved successfully",
      data: updatedCase,
    });
  } catch (error) {
    console.error("Error approving legal case:", error);
    return res.status(500).json({ success: false, error: "Failed to approve legal case" });
  }
};

// Reject legal case (Admin only)
export const rejectLegalCase = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const userId = Number(req.user?.id);
    const userRole = req.user?.roles;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (userRole !== 1) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    if (!adminNotes || !adminNotes.trim()) {
      return res.status(400).json({ error: "Admin notes are required for rejection" });
    }

    const existingCase = await prisma.legalCase.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCase) {
      return res.status(404).json({ error: "Legal case not found" });
    }

    if (existingCase.status !== "pending") {
      return res.status(400).json({ error: "Case is not pending approval" });
    }

    const updatedCase = await prisma.legalCase.update({
      where: { id: parseInt(id) },
      data: {
        status: "rejected",
        approvedBy: userId,
        adminNotes: adminNotes.trim(),
        isActive: false,
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
        approvedByUser: {
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
      message: "Legal case rejected successfully",
      data: updatedCase,
    });
  } catch (error) {
    console.error("Error rejecting legal case:", error);
    return res.status(500).json({ success: false, error: "Failed to reject legal case" });
  }
};

// Upload document to legal case (Legal Officer only)
export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id: caseId } = req.params;
    const { title, description } = req.body;
    const userId = Number(req.user?.id);
    const userRole = req.user?.roles;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (userRole !== 2) {
      return res.status(403).json({ error: "Access denied. Legal Officer only." });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Check if case exists and belongs to the user
    const legalCase = await prisma.legalCase.findUnique({
      where: { id: parseInt(caseId) },
    });

    if (!legalCase) {
      return res.status(404).json({ error: "Legal case not found" });
    }

    if (legalCase.createdBy !== userId) {
      return res.status(403).json({ error: "Access denied. You can only upload documents to your own cases." });
    }

    // Get file information
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const fileSize = req.file.size;
    const fileUrl = req.file.path; // This will be the path to the uploaded file

    const document = await prisma.legalCaseDocument.create({
      data: {
        title: title || fileName,
        description: description || "",
        fileName,
        fileUrl,
        fileType,
        fileSize,
        caseId: parseInt(caseId),
        uploadedBy: userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return res.status(500).json({ success: false, error: "Failed to upload document" });
  }
};

// Get documents for a specific legal case
export const getCaseDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { id: caseId } = req.params;
    const userId = Number(req.user?.id);
    const userRole = req.user?.roles;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check if case exists
    const legalCase = await prisma.legalCase.findUnique({
      where: { id: parseInt(caseId) },
    });

    if (!legalCase) {
      return res.status(404).json({ error: "Legal case not found" });
    }

    // Check access permissions
    if (userRole === 1) {
      // Admin can see all documents
    } else if (userRole === 2) {
      // Legal Officer can see documents from their own cases or approved cases
      if (legalCase.createdBy !== userId && legalCase.status !== "approved") {
        return res.status(403).json({ error: "Access denied" });
      }
    } else {
      // Regular users can only see documents from approved cases
      if (legalCase.status !== "approved") {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const documents = await prisma.legalCaseDocument.findMany({
      where: { caseId: parseInt(caseId) },
      include: {
        uploadedByUser: {
          select: {
            userid: true,
            username: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("Error getting case documents:", error);
    return res.status(500).json({ success: false, error: "Failed to get case documents" });
  }
};

// Download document
export const downloadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = Number(req.user?.id);
    const userRole = req.user?.roles;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const document = await prisma.legalCaseDocument.findUnique({
      where: { id: parseInt(documentId) },
      include: {
        case: true,
      },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Check access permissions
    if (userRole === 1) {
      // Admin can download all documents
    } else if (userRole === 2) {
      // Legal Officer can download documents from their own cases or approved cases
      if (document.case.createdBy !== userId && document.case.status !== "approved") {
        return res.status(403).json({ error: "Access denied" });
      }
    } else {
      // Regular users can only download documents from approved cases
      if (document.case.status !== "approved") {
        return res.status(403).json({ error: "Access denied. Case must be approved by admin." });
      }
    }

    // Set headers for file download
    res.setHeader("Content-Type", document.fileType);
    res.setHeader("Content-Disposition", `attachment; filename="${document.fileName}"`);
    
    // Send the file
    res.download(document.fileUrl);
  } catch (error) {
    console.error("Error downloading document:", error);
    return res.status(500).json({ success: false, error: "Failed to download document" });
  }
};

// Delete document from legal case (Legal Officer only)
export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = Number(req.user?.id);
    const userRole = req.user?.roles;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (userRole !== 2) {
      return res.status(403).json({ error: "Access denied. Legal Officer only." });
    }

    const document = await prisma.legalCaseDocument.findUnique({
      where: { id: parseInt(documentId) },
      include: {
        case: true,
      },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Check if user owns the case
    if (document.case.createdBy !== userId) {
      return res.status(403).json({ error: "Access denied. You can only delete documents from your own cases." });
    }

    await prisma.legalCaseDocument.delete({
      where: { id: parseInt(documentId) },
    });

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return res.status(500).json({ success: false, error: "Failed to delete document" });
  }
};

// Get case statistics (for Legal Officers and Admins)
export const getCaseStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const userRole = req.user?.roles;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (userRole === 3) {
      return res.status(403).json({ error: "Access denied" });
    }

    let whereClause: any = {};

    // Legal Officers can only see stats for their own cases
    if (userRole === 2) {
      whereClause.createdBy = userId;
    }

    const [total, pending, approved, rejected, closed] = await Promise.all([
      prisma.legalCase.count({ where: whereClause }),
      prisma.legalCase.count({
        where: { ...whereClause, status: "pending" },
      }),
      prisma.legalCase.count({
        where: { ...whereClause, status: "approved" },
      }),
      prisma.legalCase.count({
        where: { ...whereClause, status: "rejected" },
      }),
      prisma.legalCase.count({
        where: { ...whereClause, status: "closed" },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        closed,
      },
    });
  } catch (error) {
    console.error("Error fetching case statistics:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch case statistics" });
  }
};
