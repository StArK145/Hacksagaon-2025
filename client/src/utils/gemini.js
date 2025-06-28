
export async function getCriticalityAnalysis(dailySymptoms) {
  try {
    const res = await fetch("http://localhost:5000/api/gemini/criticality", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dailySymptoms }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("❌ Criticality API error:", json.error || res.statusText);
      return { error: json.error || "Unknown error from Gemini API", raw: json.raw || null };
    }

    console.log("🩺 Criticality Data:", json);
    return json;
  } catch (err) {
    console.error("❌ Fetch error:", err);
    return { error: "Network error", raw: err.message };
  }
}
