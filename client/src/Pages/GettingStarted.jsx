import React from 'react';
import { ArrowRight, Activity, Heart, Shield } from 'lucide-react';

const GettingStarted = () => {
  const handleGetStarted = () => {
    // Replace this with your actual navigation logic
    // For example: navigate('/auth-dashboard') or router.push('/auth-dashboard')
    console.log('Redirecting to AuthDashboard...');
    alert('This would redirect to the AuthDashboard page');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://img.freepik.com/free-photo/top-view-medical-desk-composition-with-copy-space_23-2148502942.jpg?semt=ais_hybrid&w=740')`
        }}
      >
      </div>
      <div className=" flex justify-end">
        <p className="font-black text-gray-800 pr-6 pt-6 drop-shadow-lg tracking-tight">Login</p>
      </div>
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo/Icon Section */}
          <div className="mb-8 flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 border border-white/20">
              <Activity className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mb-12 space-y-6">
            <h1 className="text-6xl font-black text-gray-800 mb-6 drop-shadow-lg tracking-tight">
              Welcome to HealthSync
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Transform Your Wellness Journey with AI-Powered Health Insights
            </p>


          </div>

          {/* Features Preview */}


          {/* Get Started Button */}
          <div className="space-y-4">
            <button
              onClick={handleGetStarted}
              className="group bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white font-semibold px-12 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg inline-flex items-center gap-3"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>


          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
    </div>
  );
};

export default GettingStarted;