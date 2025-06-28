export const generateMonthlyReport = async (monthlyCriticalityData) => {
  const response = await fetch('http://localhost:5000/api/monthly-report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ monthlyCriticality: monthlyCriticalityData }),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.error || 'Failed to generate report');
  return data.report;
};
