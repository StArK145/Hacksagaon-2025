// routes/analyze.js

import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  const { symptom, diseases = [], summaries = [] } = req.body;

  if (!symptom) {
    return res.status(400).json({ error: "Symptom is required" });
  }

  try {
    // 📌 Construct a comprehensive context-based prompt
    const prompt = `
You are an AI health assistant. The user has the following past medical context:

🩺 Previous Diseases:
${diseases.length > 0 ? diseases.map((d, i) => `${i + 1}. ${d}`).join('\n') : "None"}

📄 Previous Summaries of Diagnoses:
${summaries.length > 0 ? summaries.map((s, i) => `${i + 1}. ${s}`).join('\n') : "None"}

🆕 Current Symptom Reported:
"${symptom}"

Based on the user's history and current symptom, provide:
- A probable diagnosis or explanation (not a medical confirmation)
- Suggested actions or precautions
- When to see a doctor
- Answer in a helpful and empathetic tone.
`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const message = response.data.choices[0].message.content;
    res.json({ result: message });
  } catch (error) {
    console.error("🛑 GROQ error:", error.response?.data || error.message);
    res.status(500).json({ error: "GROQ AI request failed." });
  }
});

export default router;
