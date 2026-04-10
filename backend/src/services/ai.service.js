const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");

// Initialize with your API Key
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY
});

// ======================
// INTERVIEW REPORT
// ======================
async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  try {
    const prompt = `
      You are an expert interview coach. Analyze the provided resume, self-description, and job description.
      
      Requirements:
      1. Provide exactly 3 highly relevant technicalQuestions.
      2. Provide exactly 3 highly relevant behavioralQuestions.
      3. Generate a comprehensive 7-day preparationPlan (Days 1 through 7).
      
      Return STRICT JSON ONLY in this format:
      {
        "title": "Role Title",
        "matchScore": number,
        "technicalQuestions": [
          { "question": "string", "intention": "string", "answer": "string" },
          { "question": "string", "intention": "string", "answer": "string" },
          { "question": "string", "intention": "string", "answer": "string" }
        ],
        "behavioralQuestions": [
          { "question": "string", "intention": "string", "answer": "string" },
          { "question": "string", "intention": "string", "answer": "string" },
          { "question": "string", "intention": "string", "answer": "string" }
        ],
        "skillGaps": [{ "skill": "string", "severity": "low|medium|high" }],
        "preparationPlan": [
          { "day": 1, "focus": "string", "tasks": ["string"] },
          { "day": 2, "focus": "string", "tasks": ["string"] },
          { "day": 3, "focus": "string", "tasks": ["string"] },
          { "day": 4, "focus": "string", "tasks": ["string"] },
          { "day": 5, "focus": "string", "tasks": ["string"] },
          { "day": 6, "focus": "string", "tasks": ["string"] },
          { "day": 7, "focus": "string", "tasks": ["string"] }
        ]
      }

      Resume: ${resume}
      Self Description: ${selfDescription}
      Job Description: ${jobDescription}
    `;

    // FIX: Using "models/" prefix and correct array structure for @google/genai
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview", // 1.5-flash has better quota than 2.0-flash
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    // FIX: Navigating the specific response object of @google/genai
    const text = response.candidates[0].content.parts[0].text;

    console.log("🔥 AI RESPONSE RECEIVED");

    // Extract JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      title: parsed.title || "Interview Report",
      matchScore: parsed.matchScore || 70,
      technicalQuestions: parsed.technicalQuestions || [],
      behavioralQuestions: parsed.behavioralQuestions || [],
      skillGaps: parsed.skillGaps || [],
      preparationPlan: parsed.preparationPlan || []
    };

  } catch (err) {
    console.error("❌ AI ERROR:", err.message);
    
    // Fallback data so the UI doesn't break when Quota (429) is hit
    return {
      title: "Analysis Paused (Rate Limit)",
      matchScore: 0,
      technicalQuestions: [{ question: "API is cooling down. Please wait 60 seconds.", intention: "Quota limit", answer: "N/A" }],
      behavioralQuestions: [],
      skillGaps: [{ skill: "API Quota Exceeded", severity: "high" }],
      preparationPlan: []
    };
  }
}

// ======================
// PDF GENERATION
// ======================
async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" }
  });
  await browser.close();
  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  try {
    const prompt = `Generate a professional resume in HTML format. Return JSON: { "html": "..." }
    Resume: ${resume} 
    Job Description: ${jobDescription}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const text = response.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch[0]);

    return await generatePdfFromHtml(parsed.html);

  } catch (err) {
    console.error("PDF ERROR:", err);
    throw err;
  }
}

module.exports = {
  generateInterviewReport,
  generateResumePdf
};