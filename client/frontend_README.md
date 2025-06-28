
# 🩺 Smart Health Tracker – Frontend

This is the **React.js + Tailwind CSS** based frontend of the Smart Health Tracker app, a comprehensive AI-powered health assistant designed for symptom analysis, emergency alerts, hospital locator, health trend visualization, and AI-generated reports.

## 🚀 Features

- 🧠 AI Symptom Analyzer (text + image input)
- 🧾 Image analysis of prescriptions and medical reports
- 🏥 Nearby hospital locator with maps
- 📊 Health trend charts using Chart.js
- 📋 Monthly PDF health reports
- 🚨 Emergency SOS email with location
- 🔐 Firebase authentication and user profile

## 🛠️ Tech Stack

- **React.js** (with Vite)
- **Tailwind CSS**
- **Chart.js** (Line + Pie charts)
- **Firebase Auth + Firestore**
- **EmailJS** for emergency mail alerts
- **jsPDF** for PDF generation
- **Geolocation API + OpenStreetMap Overpass API**

## 📦 Project Structure

```
frontend/
├── components/          # Shared UI components
├── pages/               # Core feature views (Dashboard, Chat, Reports)
├── utils/               # API utilities and Firebase config
├── App.jsx              # Main app logic
├── main.jsx             # Entry point
├── index.css            # Tailwind base styles
```

## 📲 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Setup Environment Variables
Create a `.env` file:

```env
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
VITE_GOOGLE_MAPS_API_KEY=...
```

### 3. Run the App
```bash
npm run dev
```

App will run at: `http://localhost:5173`

## 📌 Notes

- Requires backend running at `http://localhost:5000` for distance calculations and Gemini API.
- You can deploy using **Vercel** or **Netlify**.

## 🧑‍💻 Developed By

- Namrata Ghayal  
- Sushil Phadtare  
- Tanuja Saste  
- Hackathon: **Hacksagaon 2025**
