// utils/fetchDiagnosis.js

const API_URL = 'http://localhost:5000/api/analyze';

export const fetchDiagnosis = async (symptom, diseases = [], summaries = []) => {
 
  
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symptom,
        diseases,
        summaries,
      }),
    });

    const data = await response.json();
    console.log('🧠 AI Diagnosis:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data.result;
  } catch (error) {
    throw new Error(error.message);
  }
};
