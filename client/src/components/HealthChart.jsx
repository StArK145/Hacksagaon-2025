import React, { useEffect, useState, useMemo } from "react";
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

// Cache for storing fetched data
let dataCache = {
  symptomData: null,
  criticalityData: null,
  lastFetch: null,
  userId: null
};

function HealthChart() {
  const { profile, loading } = useUserProfile();
  const [symptomData, setSymptomData] = useState([]);
  const [criticalityData, setCriticalityData] = useState(null);
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(false);
  const [isLoadingCriticality, setIsLoadingCriticality] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Check if we should use cached data
  const shouldUseCachedData = useMemo(() => {
    if (!profile?.uid || !dataCache.symptomData || !dataCache.criticalityData) return false;
    
    // Use cache if same user and data was fetched within last hour
    const oneHour = 60 * 60 * 1000;
    const isSameUser = dataCache.userId === profile.uid;
    const isRecentFetch = dataCache.lastFetch && (Date.now() - dataCache.lastFetch) < oneHour;
    
    return isSameUser && isRecentFetch;
  }, [profile?.uid]);

  useEffect(() => {
    const fetchData = async () => {
      if (loading || !profile?.uid) return;

      // Use cached data if available and recent
      if (shouldUseCachedData) {
        setSymptomData(dataCache.symptomData);
        setCriticalityData(dataCache.criticalityData);
        return;
      }

      setIsLoadingSymptoms(true);
      setHasError(false);

      try {
        const data = await fetchSymptomsLast7Days(profile.uid);
        setSymptomData(data);
        
        // Update cache
        dataCache.symptomData = data;
        dataCache.userId = profile.uid;
        dataCache.lastFetch = Date.now();
        
        console.log("✅ Fetched symptom data:", data);
      } catch (err) {
        console.error("❌ Error fetching symptoms:", err);
        setHasError(true);
      } finally {
        setIsLoadingSymptoms(false);
      }
    };

    fetchData();
  }, [loading, profile, shouldUseCachedData]);

  useEffect(() => {
    const analyze = async () => {
      if (!symptomData || symptomData.length === 0) return;

      // Use cached criticality data if available
      if (shouldUseCachedData && dataCache.criticalityData) {
        setCriticalityData(dataCache.criticalityData);
        return;
      }

      setIsLoadingCriticality(true);

      try {
        const res = await getCriticalityAnalysis(symptomData);
        console.log("🩺 Gemini criticality response:", res);
        setCriticalityData(res);
        
        // Update cache
        dataCache.criticalityData = res;
        
      } catch (err) {
        console.error("❌ Error during criticality analysis:", err);
        setCriticalityData({ error: "Error analyzing symptoms." });
      } finally {
        setIsLoadingCriticality(false);
      }
    };

    analyze();
  }, [symptomData, shouldUseCachedData]);

  // Process data for charts if available
  const chartData = criticalityData?.data?.dailyCriticality || [];
  
  // Prepare data for line chart (totalDailyScore vs date)
  const lineChartData = useMemo(() => ({
    labels: chartData.map(day => day.date),
    datasets: [
      {
        label: "Total Daily Symptom Score",
        data: chartData.map(day => day.totalDailyScore),
        borderColor: "#5CC4A2",
        backgroundColor: "rgba(92, 196, 162, 0.1)",
        borderWidth: 3,
        pointBackgroundColor: "#5CC4A2",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 3,
        pointHoverRadius: 8,
        pointRadius: 6,
        tension: 0.4,
        fill: true,
        shadowColor: "rgba(92, 196, 162, 0.3)",
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
      },
    ],
  }), [chartData]);

  // Enhanced pie chart colors matching HealthSync theme
  const pieChartData = useMemo(() => {
    const latestDay = chartData[chartData.length - 1];
    return latestDay ? {
      labels: latestDay.symptoms.map(s => s.name),
      datasets: [
        {
          data: latestDay.symptoms.map(s => s.criticality),
          backgroundColor: [
            "#5CC4A2",
            "#4AAE90", 
            "#6FC4A7",
            "#479B7E",
            "#B0F0DE",
            "#B0E1F5",
            "#C4DFF6",
            "#A8D6C4",
            "#C2E7DB",
            "#4CAF90",
            "#5CB3A7",
            "#7ECBB7"
          ],
          hoverBackgroundColor: [
            "#4CAF90",
            "#3E9B82",
            "#5CB3A7",
            "#3E8670",
            "#9DEBD0",
            "#9DD8EC",
            "#B6D6ED",
            "#9ACBB6",
            "#B4DECF",
            "#439C82",
            "#4EA899",
            "#70C2A9"
          ],
          borderWidth: 0,
          hoverBorderWidth: 3,
          hoverBorderColor: "#FFFFFF",
        },
      ],
    } : null;
  }, [chartData]);

  // Enhanced chart options with HealthSync styling
  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#2D5A4A",
          font: {
            size: 14,
            weight: "600"
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: "Daily Symptom Severity Trend",
        color: "#2D5A4A",
        font: {
          size: 18,
          weight: "700"
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: "rgba(45, 90, 74, 0.95)",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        borderColor: "#5CC4A2",
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
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
          color: "#2D5A4A",
          font: {
            size: 14,
            weight: "600"
          }
        },
        grid: {
          color: "rgba(92, 196, 162, 0.1)",
          lineWidth: 1
        },
        ticks: {
          color: "#2D5A4A",
          font: {
            size: 12
          }
        }
      },
      x: {
        title: {
          display: true,
          text: "Date",
          color: "#2D5A4A",
          font: {
            size: 14,
            weight: "600"
          }
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#2D5A4A",
          font: {
            size: 12
          }
        }
      },
    },
    elements: {
      line: {
        cubicInterpolationMode: 'monotone'
      }
    }
  }), []);

  const pieOptions = useMemo(() => {
    const latestDay = chartData[chartData.length - 1];
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "#2D5A4A",
            font: {
              size: 12,
              weight: "500"
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        title: {
          display: true,
          text: latestDay ? `Symptom Distribution (${latestDay.date})` : "Symptom Distribution",
          color: "#2D5A4A",
          font: {
            size: 18,
            weight: "700"
          },
          padding: {
            top: 10,
            bottom: 30
          }
        },
        tooltip: {
          backgroundColor: "rgba(45, 90, 74, 0.95)",
          titleColor: "#FFFFFF",
          bodyColor: "#FFFFFF",
          borderColor: "#5CC4A2",
          borderWidth: 2,
          cornerRadius: 12,
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
  }, [chartData]);

  // Enhanced Loading component
  const LoadingSpinner = ({ text = "Loading..." }) => (
    <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100">
      <div className="absolute inset-0 bg-gradient-to-br from-[#C2E7DB] to-[#A8D6C4] opacity-5"></div>
      <div className="relative flex flex-col items-center justify-center h-80 p-8">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#B0F0DE] border-t-[#5CC4A2] rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#4AAE90] rounded-full animate-spin animation-delay-150"></div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-[#2D5A4A] font-semibold text-lg">{text}</p>
          <div className="flex justify-center mt-3 space-x-1">
            <div className="w-2 h-2 bg-[#5CC4A2] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#4AAE90] rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-2 h-2 bg-[#6FC4A7] rounded-full animate-pulse animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Error component
  const ErrorDisplay = ({ message }) => (
    <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-lg border border-red-200">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-200 opacity-20"></div>
      <div className="relative flex items-center justify-center h-80 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <div className="text-red-500 text-4xl">⚠️</div>
          </div>
          <h3 className="text-red-800 font-bold text-xl mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 font-medium">{message}</p>
          <button className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  const isLoadingCharts = isLoadingSymptoms || isLoadingCriticality;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C2E7DB] to-[#A8D6C4] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#5CC4A2] to-[#4AAE90] rounded-2xl shadow-lg">
              <span className="text-3xl">🧠</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2D5A4A] to-[#479B7E] bg-clip-text text-transparent">
                Health Dashboard
              </h1>
              <p className="text-[#479B7E] font-medium mt-1">Monitor your wellness journey with AI-powered insights</p>
            </div>
          </div>
          
          {shouldUseCachedData && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-[#B0F0DE] to-[#C4DFF6] px-4 py-2 rounded-full shadow-md">
              <span className="text-lg">📊</span>
              <span className="text-[#2D5A4A] font-semibold text-sm">Using cached data</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        {hasError ? (
          <ErrorDisplay message="Failed to load symptom data. Please try again." />
        ) : isLoadingCharts ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <LoadingSpinner text="Loading symptom trends..." />
            <LoadingSpinner text="Analyzing symptoms..." />
          </div>
        ) : chartData.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Line Chart Card */}
            <div className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5CC4A2] to-[#4AAE90] opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#B0F0DE] to-[#B0E1F5] rounded-xl flex items-center justify-center">
                      <span className="text-xl">📈</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#2D5A4A]">Symptom Trends</h3>
                  </div>
                  <div className="w-3 h-3 bg-[#5CC4A2] rounded-full animate-pulse"></div>
                </div>
                <div className="h-80">
                  <Line data={lineChartData} options={lineOptions} />
                </div>
              </div>
            </div>
            
            {/* Pie Chart Card */}
            {pieChartData && (
              <div className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6FC4A7] to-[#479B7E] opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#C4DFF6] to-[#B0E1F5] rounded-xl flex items-center justify-center">
                        <span className="text-xl">🥧</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#2D5A4A]">Current Distribution</h3>
                    </div>
                    <div className="w-3 h-3 bg-[#6FC4A7] rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-80">
                    <Pie data={pieChartData} options={pieOptions} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Enhanced Empty State
          <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C2E7DB] to-[#A8D6C4] opacity-5"></div>
            <div className="relative p-12 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#B0F0DE] to-[#C4DFF6] rounded-full mb-8 shadow-lg">
                <span className="text-5xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-[#2D5A4A] mb-4">Ready to Start Your Health Journey?</h3>
              <p className="text-[#479B7E] text-lg mb-2 max-w-md mx-auto">
                No symptom data available for the last 7 days.
              </p>
              <p className="text-[#6FC4A7] font-medium mb-8">
                Start logging symptoms to see your personalized health trends and AI-powered insights.
              </p>
              <button className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-[#479B7E] to-[#6FC4A7] text-white font-bold rounded-xl hover:from-[#3E8670] hover:to-[#5CB3A7] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <span>🚀</span>
                <span>Start Logging Symptoms</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        {chartData.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5CC4A2] to-[#4AAE90] rounded-xl flex items-center justify-center">
                  <span className="text-xl text-white">📅</span>
                </div>
                <div>
                  <p className="text-[#2D5A4A] font-bold text-2xl">{chartData.length}</p>
                  <p className="text-[#479B7E] font-medium">Days Tracked</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6FC4A7] to-[#479B7E] rounded-xl flex items-center justify-center">
                  <span className="text-xl text-white">⚡</span>
                </div>
                <div>
                  <p className="text-[#2D5A4A] font-bold text-2xl">
                    {Math.round(chartData.reduce((sum, day) => sum + day.totalDailyScore, 0) / chartData.length)}
                  </p>
                  <p className="text-[#479B7E] font-medium">Avg Daily Score</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#B0F0DE] to-[#B0E1F5] rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <p className="text-[#2D5A4A] font-bold text-2xl">
                    {chartData[chartData.length - 1]?.symptoms?.length || 0}
                  </p>
                  <p className="text-[#479B7E] font-medium">Symptoms Today</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HealthChart;