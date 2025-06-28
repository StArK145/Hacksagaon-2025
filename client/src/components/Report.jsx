import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import useUserProfile from "../utils/useUserProfile";
import { fetchSymptomsLast30Days } from "../utils/saveHistory";
import { generateMonthlyReport } from "../utils/report";
import { marked } from "marked";

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

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const maxLineWidth = pageWidth - margin * 2;
    const lineHeight = 18;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("📋 Monthly Health Report", margin, 60);

    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");

    let y = 100;
    const plainText = report.replace(/[#*_`>-]/g, "").replace(/\n{2,}/g, "\n");
    const lines = doc.splitTextToSize(plainText, maxLineWidth);
    lines.forEach((line) => {
      if (y > 750) {
        doc.addPage();
        y = 60;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    doc.save("Health_Report.pdf");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📋 Monthly Health Report</h2>
        {report && (
          <button
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Download PDF
          </button>
        )}
      </div>

      {loadingReport && (
        <div className="text-blue-500 font-medium mb-4">Generating report...</div>
      )}

      {error && (
        <div className="text-red-500 font-medium mb-4">{error}</div>
      )}

      {report && (
        <div className="bg-white p-6 rounded-lg shadow mb-6 text-sm leading-relaxed prose max-w-none">
          <h3 className="text-lg font-semibold mb-3 text-blue-700">🧠 Gemini AI Analysis</h3>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: marked.parse(report) }}
          />
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded">
        <h4 className="text-sm text-gray-600 mb-2">🩺 Last 30 Days Symptom Data (Raw)</h4>
        <pre className="overflow-x-auto max-h-60 text-xs">
          {JSON.stringify(symptomData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default HealthReport;


