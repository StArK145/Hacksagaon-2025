import React, { useState } from "react";
import {
  Heart,
  MapPin,
  Activity,
  Calendar,
  Bell,
  User,
  Plus,
  Menu,
  Settings,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";

import Reminders from '../components/Reminders';
import Profile from './UserProfile';
import EmergencySOS from '../components/EmergencySOS';
import SymptomChat from '../components/SymptomChat';
import NearbyHospitals from '../components/NearbyHospitals';
import HealthChart from '../components/HealthChart';
import MonthlyReport from '../components/Report';

const Dashboard = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const healthFeatures = [
    {
      id: "symptom-chat",
      title: "New Health Query",
      icon: Plus,
      description: "Describe your health symptoms",
      lastActivity: "Just now",
      preview: "Start a new conversation",
    },
    {
      id: "nearby-hospitals",
      title: "Nearby Hospitals",
      icon: MapPin,
      description: "Find hospitals and clinics near you",
      lastActivity: "2 hours ago",
      preview: "Found 5 hospitals within 10km",
    },
    {
      id: "health-chart",
      title: "Health Chart",
      icon: Activity,
      description: "View your health metrics and trends",
      lastActivity: "Today",
      preview: "Heart rate: 72 bpm, Steps: 8,542",
    },
    {
      id: "monthly-report",
      title: "Monthly Report",
      icon: Calendar,
      description: "Comprehensive health summary",
      lastActivity: "Yesterday",
      preview: "June report generated successfully",
    },
    {
      id: "reminders",
      title: "Reminders",
      icon: Bell,
      description: "Medication and appointment alerts",
      lastActivity: "30 min ago",
      preview: "3 reminders active",
    },
    {
      id: "profile",
      title: "Health Profile",
      icon: User,
      description: "Manage your health information",
      lastActivity: "1 week ago",
      preview: "Profile 95% complete",
    },
    {
      id: "emergency",
      title: "Emergency",
      icon: Shield,
      description: "Quick access to emergency services",
      lastActivity: "Never used",
      preview: "Emergency contacts ready",
    },
  ];

  const welcomeCards = [
    {
      title: "Check Health Metrics",
      description: "View your latest health data and trends",
      icon: Activity,
      action: () => setSelectedChat("health-chart"),
    },
    {
      title: "Find Nearby Care",
      description: "Locate hospitals and clinics in your area",
      icon: MapPin,
      action: () => setSelectedChat("nearby-hospitals"),
    },
    {
      title: "Set Reminders",
      description: "Never miss medications or appointments",
      icon: Bell,
      action: () => setSelectedChat("reminders"),
    },
    {
      title: "Emergency Help",
      description: "Quick access to emergency services",
      icon: Shield,
      action: () => setSelectedChat("emergency"),
    },
  ];

  // 👉 Render SymptomChat full-screen (bypassing layout)
  if (selectedChat === "symptom-chat") {
    return <SymptomChat onBack={() => setSelectedChat(null)} />;
  }

  return (
   <div className="flex h-screen bg-gradient-to-br from-[#C2E7DB] to-[#A8D6C4]">
  {/* Sidebar */}
  <div
    className={`${
      sidebarOpen ? "w-80" : "w-0"
    } transition-all duration-300 bg-[#4CAF90]/80 backdrop-blur-md border-r border-white/20 text-white flex flex-col overflow-hidden shadow-xl`}
  >
    <div className="p-4 border-b border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-red-400" />
          <span className="font-bold text-lg text-white">HealthTracker</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1 hover:bg-white/20 rounded-lg lg:hidden transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {healthFeatures.map((feature) => (
        <button
          key={feature.id}
          onClick={() => setSelectedChat(feature.id)}
          className={`w-full text-left p-3 rounded-xl transition-all group backdrop-blur-sm ${
            selectedChat === feature.id
              ? "bg-white/30 text-white shadow-lg"
              : "hover:bg-white/20 text-white/90"
          }`}
        >
          <div className="flex items-start space-x-3">
            <feature.icon className="w-5 h-5 flex-shrink-0 mt-1 text-white" />
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-medium">{feature.title}</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-white/70 mt-1">
                {feature.preview}
              </p>
              <p className="text-xs text-white/60">
                {feature.lastActivity}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>

    <div className="p-4 border-t border-white/20 flex items-center space-x-3">
      <div className="w-8 h-8 bg-gradient-to-r from-[#479B7E] to-[#6FC4A7] rounded-full flex items-center justify-center shadow-md">
        <span className="text-white text-sm font-medium">U</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">Your Account</p>
        <p className="text-xs text-white/70">Manage settings</p>
      </div>
      <Settings className="w-4 h-4 text-white/70" />
    </div>
  </div>

  {/* Main Content */}
  <div className="flex-1 flex flex-col">
    {/* Top Bar */}
    {/* <div className="bg-white/80 backdrop-blur-md border-b border-white/20 p-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-4">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-800">
          {selectedChat
            ? healthFeatures.find((f) => f.id === selectedChat)?.title
            : "Health Dashboard"}
        </h1>
      </div>
      <button className="p-2 hover:bg-white/50 rounded-lg relative transition-colors">
        <Bell className="w-5 h-5 text-gray-700" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
      </button>
    </div> */}

    {/* Content Area */}
    <div className="flex-1 overflow-y-auto p-6 md:p-10">
      {!selectedChat && (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-[#5CC4A2] to-[#4AAE90] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to HealthTracker
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your personal health companion. Monitor your health, find
              care, and stay on top of your wellness journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {welcomeCards.map((card, index) => (
              <button
                key={index}
                onClick={card.action}
                className="p-6 bg-[#4CAF90]/80 backdrop-blur-md rounded-2xl border border-white/30 hover:bg-[#4CAF90]/90 hover:shadow-xl transition-all duration-300 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {card.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {card.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedChat === "nearby-hospitals" && <NearbyHospitals />}
      {selectedChat === "health-chart" && <HealthChart />}
      {selectedChat === "monthly-report" && <MonthlyReport />}
      {selectedChat === "reminders" && <Reminders />}
      {selectedChat === "profile" && <Profile />}
      {selectedChat === "emergency" && <EmergencySOS />}
    </div>
  </div>
</div>
  );
};

export default Dashboard;
