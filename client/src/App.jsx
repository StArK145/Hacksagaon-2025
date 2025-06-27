import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthDashboard from "./pages/AuthDashboard";
import Dashboard from "./pages/Dashboard";
import ProfileChecker from "./contextes/ProfileChecker";
import CompleteProfile from "./pages/CompleteProfile";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthDashboard />} />
      <Route path="/profile" element={<UserProfile/>} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      
      {/* Protect dashboard route */}
      <Route element={<ProfileChecker />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Optionally: handle unmatched routes */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default App;
