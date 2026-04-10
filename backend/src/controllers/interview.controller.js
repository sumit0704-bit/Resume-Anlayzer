const pdfParse = require("pdf-parse");
console.log("pdfParse type:", typeof pdfParse);

const {
  generateInterviewReport,
  generateResumePdf
} = require("../services/ai.service");

const InterviewReport = require("../models/interviewReport.model");

/**
 * ✅ CREATE INTERVIEW REPORT
 */
const generateInterViewReportController = async (req, res) => {
  try {
    // 🔴 Check file
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        message: "Resume PDF is required"
      });
    }

    const { selfDescription, jobDescription } = req.body;

    // 🔴 Validate input
    if (!jobDescription) {
      return res.status(400).json({
        message: "Job description is required"
      });
    }

    // 🔥 Parse PDF safely
    let resumeText = "";
    try {
      const data = await pdfParse(req.file.buffer);
      resumeText = data.text || "";
    } catch (err) {
      console.error("PDF Parse Error:", err);
      return res.status(400).json({
        message: "Invalid or corrupted PDF file"
      });
    }

    // 🤖 AI Generation
    const aiResponse = await generateInterviewReport({
      resume: resumeText,
      selfDescription: selfDescription || "",
      jobDescription
    });

    // 💾 Save to MongoDB
    const report = await InterviewReport.create({
      user: req.user.id,
      title: aiResponse.title || "Interview Report",
      jobDescription,
      resume: resumeText,
      selfDescription: selfDescription || "",
      matchScore: aiResponse.matchScore || 0,
      technicalQuestions: Array.isArray(aiResponse.technicalQuestions) ? aiResponse.technicalQuestions : [],
      behavioralQuestions: Array.isArray(aiResponse.behavioralQuestions) ? aiResponse.behavioralQuestions : [],
      skillGaps: Array.isArray(aiResponse.skillGaps) ? aiResponse.skillGaps : [],
      preparationPlan: Array.isArray(aiResponse.preparationPlan) ? aiResponse.preparationPlan : []
    });

    return res.status(201).json({
      message: "Report generated successfully",
      report
    });

  } catch (error) {
    console.error("CRITICAL ERROR:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};


/**
 * ✅ GET SINGLE REPORT
 */
const getInterviewReportByIdController = async (req, res) => {
  try {
    const report = await InterviewReport.findOne({
      _id: req.params.interviewId,
      user: req.user.id
    });

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    return res.status(200).json(report);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


/**
 * ✅ GET ALL REPORTS
 */
const getAllInterviewReportsController = async (req, res) => {
  try {
    const reports = await InterviewReport.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("title matchScore createdAt");

    return res.status(200).json(reports);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


/**
 * ✅ GENERATE RESUME PDF
 */
const generateResumePdfController = async (req, res) => {
  try {
    const report = await InterviewReport.findById(req.params.interviewReportId);

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    const pdfBuffer = await generateResumePdf({
      resume: report.resume,
      jobDescription: report.jobDescription,
      selfDescription: report.selfDescription
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${report._id}.pdf`
    });

    return res.send(pdfBuffer);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController
};