const SUMMARY_API = 'http://localhost:5000/api/summary';

export const fetchSummary = async (diagnosis) => {
  const response = await fetch(SUMMARY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ diagnosis }), // ✅ match backend
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("❌ Summary API error:", errText);
    throw new Error("Failed to generate summary.");
  }

  const data = await response.json();
  return {
    title: data.title,
    summary: data.summary,
  };
  
  
  
};
