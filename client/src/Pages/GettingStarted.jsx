import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity } from 'lucide-react';

const GettingStarted = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/AuthDashboard');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/background-image.png')` }}
      ></div>

      {/* Login Top Right */}
      <div className="flex justify-end">
        <p className="font-black text-gray-800 pr-6 pt-6 drop-shadow-lg tracking-tight">Login</p>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-end px-10">
        <div className="max-w-2xl text-right space-y-10">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 border border-white/20">
              <Activity className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Welcome Text */}
          <div>
            <h1 className="text-5xl font-black text-gray-800 mb-4 drop-shadow-lg tracking-tight pr-14">
              Welcome to HealthSync
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed font-light">
              Transform Your Wellness Journey with AI-Powered Health Insights
            </p>
          </div>

          {/* Get Started Button */}
          <div>
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

      {/* Decorative Circles */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
    </div>
  );
};

export default GettingStarted;
