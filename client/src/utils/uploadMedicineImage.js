export const uploadMedicineImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch("http://localhost:8000/analyze-medicine/", {
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
    console.error("❌ Medicine Analysis Error:", error);
    throw error;
  }
};
