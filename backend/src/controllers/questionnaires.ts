import { Request, Response } from "express";
import { prisma } from "../index";
import { createObjectCsvStringifier } from "csv-writer";
import PDFDocument from "pdfkit";

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    roles: number;
  };
}

// Create a new questionnaire
export const createQuestionnaire = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { title, description, questions } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if user is a legal officer
    const user = await prisma.user.findUnique({
      where: { userid: userId },
    });

    if (!user || user.roles !== 2) {
      return res.status(403).json({
        success: false,
        error: "Only legal officers can create questionnaires",
      });
    }

    const questionnaire = await prisma.questionnaire.create({
      data: {
        title,
        description,
        createdBy: userId,
        questions: {
          create: questions.map((q: any, index: number) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options ? JSON.stringify(q.options) : null,
            isRequired: q.isRequired,
            orderIndex: index,
          })),
        },
      },
      include: {
        questions: true,
        createdByUser: {
          select: { username: true, name: true },
        },
      },
    });

    res.status(201).json({ success: true, data: questionnaire });
  } catch (error) {
    console.error("Error creating questionnaire:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create questionnaire" });
  }
};

// Get all questionnaires for a legal officer
export const getMyQuestionnaires = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const questionnaires = await prisma.questionnaire.findMany({
      where: { createdBy: userId },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: { responses: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: questionnaires });
  } catch (error) {
    console.error("Error fetching questionnaires:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch questionnaires" });
  }
};

// Get a specific questionnaire
export const getQuestionnaire = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: parseInt(id) },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
        createdByUser: {
          select: { username: true, name: true },
        },
      },
    });

    if (!questionnaire) {
      return res
        .status(404)
        .json({ success: false, error: "Questionnaire not found" });
    }

    res.json({ success: true, data: questionnaire });
  } catch (error) {
    console.error("Error fetching questionnaire:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch questionnaire" });
  }
};

// Update a questionnaire
export const updateQuestionnaire = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { title, description, questions } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if user owns the questionnaire
    const existingQuestionnaire = await prisma.questionnaire.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingQuestionnaire || existingQuestionnaire.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to edit this questionnaire",
      });
    }

    // Update questionnaire and questions
    const questionnaire = await prisma.$transaction(async (tx) => {
      // Update questionnaire
      const updatedQuestionnaire = await tx.questionnaire.update({
        where: { id: parseInt(id) },
        data: { title, description },
      });

      // Delete existing questions
      await tx.questionnaireQuestion.deleteMany({
        where: { questionnaireId: parseInt(id) },
      });

      // Create new questions
      const updatedQuestions = await tx.questionnaireQuestion.createMany({
        data: questions.map((q: any, index: number) => ({
          questionnaireId: parseInt(id),
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options ? JSON.stringify(q.options) : null,
          isRequired: q.isRequired,
          orderIndex: index,
        })),
      });

      return updatedQuestionnaire;
    });

    res.json({ success: true, data: questionnaire });
  } catch (error) {
    console.error("Error updating questionnaire:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update questionnaire" });
  }
};

// Delete a questionnaire
export const deleteQuestionnaire = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if user owns the questionnaire
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: parseInt(id) },
    });

    if (!questionnaire || questionnaire.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this questionnaire",
      });
    }

    await prisma.questionnaire.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: "Questionnaire deleted successfully" });
  } catch (error) {
    console.error("Error deleting questionnaire:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete questionnaire" });
  }
};

// Publish/unpublish a questionnaire
export const toggleQuestionnaireStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if user owns the questionnaire
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: parseInt(id) },
    });

    if (!questionnaire || questionnaire.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to modify this questionnaire",
      });
    }

    const updatedQuestionnaire = await prisma.questionnaire.update({
      where: { id: parseInt(id) },
      data: { isActive },
    });

    res.json({ success: true, data: updatedQuestionnaire });
  } catch (error) {
    console.error("Error updating questionnaire status:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update questionnaire status" });
  }
};

// Get active questionnaires for users to answer
export const getActiveQuestionnaires = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const questionnaires = await prisma.questionnaire.findMany({
      where: { isActive: true },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
        createdByUser: {
          select: { username: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: questionnaires });
  } catch (error) {
    console.error("Error fetching active questionnaires:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch active questionnaires" });
  }
};

// Submit questionnaire response
export const submitQuestionnaireResponse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { questionnaireId, answers } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if questionnaire is active
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: questionnaireId },
    });

    if (!questionnaire || !questionnaire.isActive) {
      return res
        .status(400)
        .json({ success: false, error: "Questionnaire is not available" });
    }

    // Create response and answers
    const response = await prisma.$transaction(async (tx) => {
      const questionnaireResponse = await tx.questionnaireResponse.create({
        data: {
          questionnaireId,
          userId,
          status: "completed",
          completedAt: new Date(),
        },
      });

      const questionnaireAnswers = await tx.questionnaireAnswer.createMany({
        data: answers.map((answer: any) => ({
          questionId: answer.questionId,
          responseId: questionnaireResponse.id,
          answerText: answer.answerText,
          answerOptions: answer.answerOptions
            ? JSON.stringify(answer.answerOptions)
            : null,
          answerRating: answer.answerRating,
        })),
      });

      return questionnaireResponse;
    });

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    console.error("Error submitting questionnaire response:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit questionnaire response",
    });
  }
};

// Export questionnaire responses as CSV
export const exportResponsesCSV = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Validate questionnaire ID
    const questionnaireIdInt = parseInt(id);
    if (isNaN(questionnaireIdInt)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid questionnaire ID" });
    }

    // Check if user owns the questionnaire
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: questionnaireIdInt },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!questionnaire || questionnaire.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to export this questionnaire",
      });
    }

    const responses = await prisma.questionnaireResponse.findMany({
      where: { questionnaireId: parseInt(id) },
      include: {
        user: {
          select: { username: true, name: true, email: true },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (responses.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No responses found for this questionnaire",
      });
    }

    // Create CSV
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "responseId", title: "Response ID" },
        { id: "username", title: "Username" },
        { id: "name", title: "Name" },
        { id: "email", title: "Email" },
        { id: "startedAt", title: "Started At" },
        { id: "completedAt", title: "Completed At" },
        ...questionnaire.questions.map((q: any, index: number) => ({
          id: `question${index + 1}`,
          title: `Q${index + 1}: ${q.questionText}`,
        })),
      ],
    });

    const records = responses.map((response) => {
      const record: any = {
        responseId: response.id,
        username: response.user.username,
        name: response.user.name || "",
        email: response.user.email,
        startedAt: response.startedAt.toISOString(),
        completedAt: response.completedAt?.toISOString() || "",
      };

      // Add answers
      response.answers.forEach((answer, index) => {
        let answerText = "";
        if (answer.answerText) answerText = answer.answerText;
        else if (answer.answerOptions)
          answerText = JSON.parse(answer.answerOptions).join(", ");
        else if (answer.answerRating)
          answerText = answer.answerRating.toString();

        record[`question${index + 1}`] = answerText;
      });

      return record;
    });

    const csvContent =
      csvStringifier.getHeaderString() +
      csvStringifier.stringifyRecords(records);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="questionnaire-${id}-responses.csv"`
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({ success: false, error: "Failed to export CSV" });
  }
};

// Export questionnaire responses as PDF
export const exportResponsesPDF = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    console.log(`PDF Export - Requested ID: ${id}, User ID: ${userId}`);

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Validate questionnaire ID
    const questionnaireIdInt = parseInt(id);
    if (isNaN(questionnaireIdInt)) {
      console.log(`PDF Export - Invalid ID format: ${id}`);
      return res
        .status(400)
        .json({ success: false, error: "Invalid questionnaire ID format" });
    }

    // Check if user owns the questionnaire
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: questionnaireIdInt },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!questionnaire || questionnaire.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to export this questionnaire",
      });
    }

    const responses = await prisma.questionnaireResponse.findMany({
      where: { questionnaireId: parseInt(id) },
      include: {
        user: {
          select: { username: true, name: true, email: true },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (responses.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "No responses found for this questionnaire. Please ensure the questionnaire has been completed by users before exporting.",
      });
    }

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="questionnaire-${id}-responses.pdf"`
    );
    doc.pipe(res);

    // Add title
    doc
      .fontSize(20)
      .text(`Questionnaire: ${questionnaire.title}`, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Total Responses: ${responses.length}`, { align: "center" });
    doc.moveDown(2);

    // Add responses
    responses.forEach((response, index) => {
      doc.fontSize(14).text(`Response ${index + 1}`, { underline: true });
      doc
        .fontSize(10)
        .text(
          `User: ${response.user.username} (${response.user.name || "N/A"})`
        );
      doc.fontSize(10).text(`Email: ${response.user.email}`);
      doc.fontSize(10).text(`Started: ${response.startedAt.toLocaleString()}`);
      doc
        .fontSize(10)
        .text(`Completed: ${response.completedAt?.toLocaleString() || "N/A"}`);
      doc.moveDown();

      // Add answers
      response.answers.forEach((answer, answerIndex) => {
        const question = questionnaire.questions.find(
          (q) => q.id === answer.questionId
        );
        if (question) {
          doc
            .fontSize(10)
            .text(`Q${answerIndex + 1}: ${question.questionText}`, {
              continued: true,
            });

          let answerText = "";
          if (answer.answerText) answerText = answer.answerText;
          else if (answer.answerOptions)
            answerText = JSON.parse(answer.answerOptions).join(", ");
          else if (answer.answerRating)
            answerText = answer.answerRating.toString();

          doc.fontSize(10).text(` - ${answerText}`);
        }
      });

      doc.moveDown(2);
    });

    doc.end();
  } catch (error) {
    console.error("Error exporting PDF:", error);
    res.status(500).json({ success: false, error: "Failed to export PDF" });
  }
};
