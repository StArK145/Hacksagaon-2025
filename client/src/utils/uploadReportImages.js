export const uploadReportImages = async (imageFiles) => {
  const formData = new FormData();

  // Append each image to the FormData
  imageFiles.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await fetch("http://localhost:8000/analyze-reports/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Report Analysis Error:", error);
    throw error;
  }
};
