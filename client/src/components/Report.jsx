import React, { useEffect, useState } from "react";
import useUserProfile from "../utils/useUserProfile";
import { fetchSymptomsLast30Days } from "../utils/saveHistory"; // you'll need to implement this if not already
import { generateMonthlyReport } from "../utils/report"; // the fetch function to POST to your backend

const HealthReport = () => {
  const { profile, loading } = useUserProfile();
  const [symptomData, setSymptomData] = useState([]);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    const fetchAndGenerateReport = async () => {
      if (loading || !profile?.uid) return;

      try {
        const data = await fetchSymptomsLast30Days(profile.uid);
        setSymptomData(data);
        console.log("📅 Fetched 30-day symptom data:", data);

        if (data.length > 0) {
          setLoadingReport(true);
          const res = await generateMonthlyReport(data);
          setReport(res);
        } else {
          setReport("No symptoms recorded in the last 30 days.");
        }
      } catch (err) {
        console.error("❌ Report generation error:", err);
        setError("Failed to generate health report.");
      } finally {
        setLoadingReport(false);
      }
    };

    fetchAndGenerateReport();
  }, [loading, profile]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📋 Monthly Health Report</h2>

      {loadingReport && (
        <div className="text-blue-500 font-medium mb-4">Generating report...</div>
      )}

      {error && (
        <div className="text-red-500 font-medium mb-4">{error}</div>
      )}

      {report && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-2">🧠 Gemini AI Analysis</h3>
          <pre className="whitespace-pre-wrap text-sm">{report}</pre>
        </div>
      )}

      <div>
        <h4 className="text-sm text-gray-600 mb-1">Last 30 Days Symptoms</h4>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto max-h-60">
          {JSON.stringify(symptomData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default HealthReport;
