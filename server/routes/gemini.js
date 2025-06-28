// routes/gemini.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/criticality", async (req, res) => {
  const { data } = req.body;

  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: "Invalid input format. Expecting daily symptoms array." });
  }

  const prompt = `
You are a health assistant AI. Analyze the following array of daily symptoms per date and assign a criticality score from 1 (mild) to 10 (severe) for each symptom. Then compute the totalDailyScore per day.

Return the response as JSON in this format:

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

Only return JSON. Here is the data:
${JSON.stringify(data, null, 2)}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      }
    );

    const result = await response.json();
    const output = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    try {
      const parsed = JSON.parse(output);
      return res.json(parsed);
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse Gemini response", raw: output });
    }
  } catch (error) {
    console.error("❌ Gemini error:", error);
    return res.status(500).json({ error: "Gemini API error" });
  }
});

export default router;
