export async function getCriticalityAnalysis(dailySymptoms) {
  try {
    const res = await fetch("http://localhost:5000/api/gemini/criticality", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dailySymptoms }),
    });

    const json = await res.json();

    return {
      ok: res.ok,
      status: res.status,
      data: json, // Clean parsed data
    };
  } catch (err) {
    return {
      ok: false,
      status: 500,
      error: err.message,
    };
  }
}
