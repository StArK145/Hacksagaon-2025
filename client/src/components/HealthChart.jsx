import React, { useEffect, useState } from "react";
import useUserProfile from "../utils/useUserProfile";
import { fetchSymptomsLast7Days } from "../utils/saveHistory";
import { getCriticalityAnalysis } from "../utils/gemini";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function HealthChart() {
  const { profile, loading } = useUserProfile();
  const [symptomData, setSymptomData] = useState([]);
  const [criticalityData, setCriticalityData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (loading || !profile?.uid) return;

      try {
        const data = await fetchSymptomsLast7Days(profile.uid);
        setSymptomData(data);
        console.log("✅ Fetched symptom data:", data);
      } catch (err) {
        console.error("❌ Error fetching symptoms:", err);
      }
    };

    fetchData();
  }, [loading, profile]);

  useEffect(() => {
    const analyze = async () => {
      if (!symptomData || symptomData.length === 0) return;

      try {
        const res = await getCriticalityAnalysis(symptomData);
        console.log("🩺 Gemini criticality response:", res);
        setCriticalityData(res);
      } catch (err) {
        console.error("❌ Error during criticality analysis:", err);
        setCriticalityData({ error: "Error analyzing symptoms." });
      }
    };

    analyze();
  }, [symptomData]);

  // Process data for charts if available
  const chartData = criticalityData?.data?.dailyCriticality || [];
  
  // Prepare data for line chart (totalDailyScore vs date)
  const lineChartData = {
    labels: chartData.map(day => day.date),
    datasets: [
      {
        label: "Total Daily Symptom Score",
        data: chartData.map(day => day.totalDailyScore),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.3)",
        borderWidth: 2,
        pointBackgroundColor: "rgb(53, 162, 235)",
        pointBorderColor: "#fff",
        pointHoverRadius: 5,
        pointRadius: 4,
        tension: 0.2,
        fill: true,
      },
    ],
  };

  // Prepare data for pie chart (symptoms distribution for latest day)
  const latestDay = chartData[chartData.length - 1];
  const pieChartData = latestDay ? {
    labels: latestDay.symptoms.map(s => s.name),
    datasets: [
      {
        data: latestDay.symptoms.map(s => s.criticality),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8AC926",
          "#1982C4",
          "#6A4C93",
          "#F15BB5",
          "#00BBF9",
          "#00F5D4"
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8AC926",
          "#1982C4",
          "#6A4C93",
          "#F15BB5",
          "#00BBF9",
          "#00F5D4"
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  // Chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Daily Symptom Severity Trend",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Symptom Score",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        }
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
        grid: {
          display: false,
        }
      },
    },
    elements: {
      line: {
        cubicInterpolationMode: 'monotone'
      }
    }
  };

  
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: latestDay ? `Symptom Distribution (${latestDay.date})` : "Symptom Distribution",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🧠 Health Dashboard</h2>

      {chartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="h-80">
              <Line data={lineChartData} options={lineOptions} />
            </div>
          </div>
          
          {pieChartData && (
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="h-80">
                <Pie data={pieChartData} options={pieOptions} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm text-gray-600 mb-1">Last 7 Days Symptoms</h4>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto max-h-60">
            {JSON.stringify(symptomData, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="text-sm text-gray-600 mb-1">Criticality Report</h4>
          <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap overflow-x-auto max-h-60">
            {criticalityData?.data
              ? JSON.stringify(criticalityData.data, null, 2)
              : criticalityData?.error || "Analyzing symptoms..."}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default HealthChart;