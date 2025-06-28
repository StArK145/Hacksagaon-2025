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
  <div className="flex h-screen bg-gradient-to-br from-[#C1FAF5] via-[#A0F0E8] to-[#6CD4C7] relative overflow-hidden">
    {/* Floating Background Decorations */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-10 left-20 w-64 h-64 bg-[#FFB6C1]/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/3 right-10 w-48 h-48 bg-[#FFDEE9]/25 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-[#CBFDF1]/15 rounded-full blur-3xl"></div>
      <div className="absolute top-2/3 right-1/3 w-32 h-32 bg-[#A0F1DD]/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-1/3 right-20 w-24 h-24 bg-[#FFDDE5]/20 rounded-full blur-lg"></div>
    </div>

    {/* Sidebar */}
    <div className={`${
      sidebarOpen ? "w-80" : "w-0"
    } transition-all duration-500 ease-out backdrop-blur-xl bg-white/70 border-r border-[#FFE4EC] flex flex-col overflow-hidden relative z-20 shadow-2xl`}>
      <div className="p-6 border-b border-[#FFD6E8]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF8FA3] to-[#FFB6C1] backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-white drop-shadow-sm" />
            </div>
            <span className="font-bold text-2xl text-[#222] drop-shadow-sm tracking-tight">HealthSync</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-[#FFE4EC]/60 rounded-xl lg:hidden transition-all duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style> */}
        {healthFeatures.map((feature, index) => (
          <button
            key={feature.id}
            onClick={() => setSelectedChat(feature.id)}
            className={`w-full text-left p-5 rounded-2xl transition-all duration-300 group backdrop-blur-sm border ${
              selectedChat === feature.id
                ? "bg-gradient-to-r from-[#FF8FA3]/90 to-[#FFA6C1]/90 text-white shadow-xl border-pink-200 scale-[1.02]"
                : "hover:bg-white/60 text-gray-700 border-pink-100 hover:border-pink-300 hover:scale-[1.01] bg-white/40"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                selectedChat === feature.id ? "bg-white/30 shadow-lg" : "bg-pink-100/60 group-hover:bg-pink-200/60"
              }`}>
                <feature.icon className={`w-6 h-6 drop-shadow-sm ${
                  selectedChat === feature.id ? "text-white" : "text-[#FF5D8F]"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-base truncate">{feature.title}</span>
                  <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ${
                    selectedChat === feature.id ? "text-white/80" : "text-pink-500"
                  }`} />
                </div>
                <p className={`text-sm mb-1 line-clamp-1 ${
                  selectedChat === feature.id ? "text-pink-100" : "text-gray-600"
                }`}>
                  {feature.preview}
                </p>
                <p>set</p>
                <p className={`text-xs ${
                  selectedChat === feature.id ? "text-pink-200" : "text-gray-500"
                }`}>
                  {feature.lastActivity}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col relative z-10">
      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        {!selectedChat && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FF8FA3] to-[#FFA6C1] backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Heart className="w-14 h-14 text-white drop-shadow-lg" />
              </div>
              <h1 className="text-6xl font-black text-gray-600 mb-6 drop-shadow-lg tracking-tight">
                Welcome to HealthSync
              </h1>
              <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
                Transform Your Wellness Journey with AI-Powered Health Insights
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {welcomeCards.map((card, index) => (
                <button
                  key={index}
                  onClick={card.action}
                  className="p-8 backdrop-blur-xl bg-white/60 rounded-3xl border border-pink-200 hover:bg-white/80 hover:shadow-3xl transition-all duration-500 text-left group transform hover:scale-105 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-6">
                    <div className="p-4 bg-gradient-to-br from-[#FF8FA3] to-[#FFA6C1] rounded-2xl group-hover:from-[#FF7096] group-hover:to-[#FF94B8] transition-all duration-300 shadow-lg">
                      <card.icon className="w-8 h-8 text-white drop-shadow-sm" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-700 mb-3 drop-shadow-sm">
                        {card.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-base">
                        {card.description}
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-pink-500 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conditional Tabs */}
        {selectedChat === "symptom-chat" && <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-pink-200 shadow-2xl"><SymptomChat /></div>}
        {selectedChat === "nearby-hospitals" && <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-pink-200 shadow-2xl"><NearbyHospitals /></div>}
        {selectedChat === "health-chart" && <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-pink-200 shadow-2xl"><HealthChart /></div>}
        {selectedChat === "monthly-report" && <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-pink-200 shadow-2xl"><MonthlyReport /></div>}
        {selectedChat === "reminders" && <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-pink-200 shadow-2xl"><Reminders /></div>}
        {selectedChat === "profile" && <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-pink-200 shadow-2xl"><Profile /></div>}
        {selectedChat === "emergency" && <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-pink-200 shadow-2xl"><EmergencySOS /></div>}
      </div>
    </div>
  </div>
);
};

export default Dashboard;
