import express from 'express';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              inline_data: {
                mime_type: req.file.mimetype, // e.g. image/jpeg
                data: base64Image,
              },
            },
            {
              text: 'What skin condition does this image suggest? Give top 3 guesses.',
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

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({
      result: reply || 'No classification returned',
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: 'Gemini classification failed',
      details: err.response?.data || err.message,
    });
  } finally {
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete uploaded file:', err.message);
    });
  }
});

export default router;
