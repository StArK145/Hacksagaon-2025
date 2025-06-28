import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthDashboard from "./pages/AuthDashboard";
import Dashboard from "./pages/Dashboard";
import ProfileChecker from "./contextes/ProfileChecker";
import CompleteProfile from "./pages/CompleteProfile";
import UserProfile from "./pages/UserProfile";
import GettingStarted from "./pages/GettingStarted";


function App() {
  return (
    <Routes>
      <Route path="/" element={<GettingStarted />} />
      <Route path="/profile" element={<UserProfile />} />
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
