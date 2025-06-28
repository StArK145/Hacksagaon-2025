import React, { useEffect, useState } from "react";
import useUserProfile from "../utils/useUserProfile";
import { fetchSymptomsLast7Days } from "../utils/saveHistory";
import { getCriticalityAnalysis } from "../utils/gemini";
function HealthChart() {
  const { profile, loading } = useUserProfile();
  const [symptomData, setSymptomData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (loading) return;         // Wait until user profile finishes loading
      if (!profile?.uid) return;   // Prevent invalid UID

      try {
        const data = await fetchSymptomsLast7Days(profile.uid);
        setSymptomData(data);
        console.log("Fetched symptom data:", data);
      } catch (err) {
        console.error("Error fetching symptoms:", err);
      }
    };

    fetchData();
  }, [loading, profile]);
  
  const res = getCriticalityAnalysis();
  console.log(res);
  
  return (
    <div>
      <h2>Health Chart</h2>
      <pre>{JSON.stringify(symptomData, null, 2)}</pre>
    </div>
  );
}

export default HealthChart;
