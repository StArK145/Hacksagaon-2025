
# 🩺 Smart Health Tracker – Backend

This is the **Express.js backend server** for the Smart Health Tracker app. It supports AI diagnosis, prescription analysis, and distance calculation between user location and hospitals.

## 🔧 Features

- 🤖 Handles AI-based symptom and image diagnosis (Gemini API)
- 📍 Computes distance to hospitals using Google Maps API
- 🔐 Secured endpoints for frontend integration
- 🗃️ Organized routes for diagnosis, summary, and file upload

## 🛠️ Tech Stack

- **Node.js + Express**
- **Google Gemini API (text-based AI)**
- **Google Maps Distance Matrix API**
- **CORS + dotenv + axios**
- **Firebase Admin SDK (optional)**

## 📦 Project Structure

```
server/
├── routes/
│   ├── analyze.js        # AI symptom analysis
│   ├── summary.js        # Generate summaries
│   ├── distance.js       # Distance calculation using Maps API
│   ├── upload.js         # Image processing (optional)
├── utils/
│   ├── gemini.js         # Gemini API wrapper
├── index.js              # Express app entry point
```

## ⚙️ Setup & Run

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup `.env` file
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 3. Run Server
```bash
node index.js
```

Server will run at: `http://localhost:5000`

## 📌 API Endpoints

| Endpoint          | Method | Description                      |
|------------------|--------|----------------------------------|
| `/api/analyze`   | POST   | AI diagnosis from text           |
| `/api/summary`   | POST   | Summarize diagnosis              |
| `/api/distance`  | GET    | Calculate distance to hospitals  |
| `/api/upload`    | POST   | Image analysis (optional)        |

## 🧑‍💻 Developed By

- Namrata Ghayal  
- Sushil Phadtare  
- Tanuja Saste  
- Hackathon: **Hacksagaon 2025**
