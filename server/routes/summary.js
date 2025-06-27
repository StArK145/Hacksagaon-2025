import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/', async (req, res) => {
  const { diagnosis } = req.body;

  if (!diagnosis) {
    return res.status(400).json({ message: 'Diagnosis text is required.' });
  }

  try {
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `
Based on the following medical diagnosis, do two things:

1. Generate a short, meaningful **title** (max 6 words) that summarizes the key health issue.
2. Provide a clear and medically relevant **summary** in 3–5 bullet points that includes:
   - core symptoms,
   - potential causes,
   - suggested treatments or precautions.

**Format your response like this:**

---
Title: [insert title here]

Summary:
• Bullet 1  
• Bullet 2  
• Bullet 3  
---

Diagnosis:
"""
${diagnosis}
"""
              `,
            },
          ],
        },
      ],
    };

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: process.env.GEMINI_API_KEY,
        },
      }
    );

    const fullText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!fullText) {
      throw new Error('No summary returned by Gemini API.');
    }

    // ✅ Extract title and summary
    const titleMatch = fullText.match(/Title:\s*(.+)/i);
    const summaryMatch = fullText.match(/Summary:\s*([\s\S]*)/i);

    const title = titleMatch ? titleMatch[1].trim() : "Untitled Diagnosis";
    const summary = summaryMatch ? summaryMatch[1].trim() : fullText.trim();

    res.status(200).json({ title, summary });

  } catch (error) {
    console.error('❌ Summary generation error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to generate summary.',
      error: error.response?.data || error.message,
    });
  }
});

export default router;
