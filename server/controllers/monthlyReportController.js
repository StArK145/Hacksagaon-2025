// controllers/monthlyReportController.js
import fetch from 'node-fetch';

export const generateMonthlyReport = async (req, res) => {
  const { monthlyCriticality } = req.body;

  if (!Array.isArray(monthlyCriticality)) {
    return res.status(400).json({ error: "monthlyCriticality must be an array." });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const prompt = `
You are a health assistant. Using the following monthly symptom data, generate a detailed health report:
- Summarize symptom trends and frequency.
- Identify commonly occurring symptoms.
- Detect any signs of improvement or worsening.
- Offer helpful health advice or early warnings.

Data:
${JSON.stringify(monthlyCriticality, null, 2)}
`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const result = await response.json();

    const report = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!report) {
      return res.status(500).json({ error: "No report generated." });
    }

    res.status(200).json({ report });
  } catch (err) {
    console.error("❌ Gemini API error:", err);
    res.status(500).json({ error: "Failed to generate monthly report." });
  }
};
