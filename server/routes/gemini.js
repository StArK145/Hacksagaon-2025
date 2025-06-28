import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/criticality", async (req, res) => {
  const { data } = req.body;

  if (!data || !Array.isArray(data)) {
    return res.status(400).json({
      error: "Invalid input format. Expecting daily symptoms array.",
    });
  }

  const prompt = `
You are a health assistant AI. Analyze the following array of daily symptoms per date and assign a criticality score from 1 (mild) to 10 (severe) for each symptom. Then compute the totalDailyScore per day.

Return only raw JSON (no explanation, no markdown, no formatting). It must strictly follow this format:

{
  "dailyCriticality": [
    {
      "date": "YYYY-MM-DD",
      "symptoms": [
        { "name": "symptomName", "criticality": 1-10 }
      ],
      "totalDailyScore": sum of criticality scores
    }
  ]
}

Here is the data:
${JSON.stringify(data, null, 2)}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const json = await response.json();

    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 🔍 Clean markdown formatting
    const cleanedText = rawText.replace(/```json|```/g, "").trim();

    // ✅ Parse to JSON
    const parsedJson = JSON.parse(cleanedText);

    return res.json(parsedJson);
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    return res.status(500).json({
      error: "Failed to parse Gemini response",
      raw: error.message || error,
    });
  }
});

export default router;
