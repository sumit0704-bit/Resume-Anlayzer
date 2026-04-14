const express = require("express");
const router = express.Router();

const {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
  deleteAllReportsController // ✅ import
} = require("../controllers/interview.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");

// ✅ Create Report
router.post("/", authMiddleware.authUser, upload.single("resume"), generateInterViewReportController);

// ✅ Get All Reports
router.get("/", authMiddleware.authUser, getAllInterviewReportsController);

// ✅ Get Single Report
router.get("/report/:interviewId", authMiddleware.authUser, getInterviewReportByIdController);

// ✅ Download Resume PDF
router.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, generateResumePdfController);

// ✅ NEW — Delete all reports
router.delete("/", authMiddleware.authUser, deleteAllReportsController);

module.exports = router;