import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import {
  saveDiagnosisHistory,
  fetchAllChatSummariesGrouped,
  fetchChatHistoryByChatId,
  deleteChatHistoryByChatId,
  updateChatTitle,
} from "../utils/saveHistory";
import { getAuth } from "firebase/auth";
import useUserProfile from "../utils/useUserProfile";
import {
  Menu,
  X,
  MessageSquareText,
  Trash2,
  Pencil,
  ImagePlus,
  Sparkles,
  Activity,
  Send,
  AlertTriangle,
  CheckCircle,
  Info,
  Heart,
  Clock,
  User,
  FileText,
  Lightbulb,
  Shield,
} from "lucide-react";
import { fetchDiagnosis, fetchImageDiagnosis } from "../utils/fetchDiagnosis";
import { fetchSummary } from "../utils/fetchSummary";
import { uploadMedicineImage } from "../utils/uploadMedicineImage";
import { uploadReportImages } from "../utils/uploadReportImages";

const generateChatId = () => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 7);
  return `chat_${timestamp}_${randomPart}`;
};

// Enhanced AI Response Component
const EnhancedAIResponse = ({ response, isImageAnalysis = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Parse the response to extract structured information
  const parseResponse = (text) => {
    const sections = {
      overview: '',
      symptoms: '',
      recommendations: '',
      precautions: '',
      followUp: ''
    };
    
    // Simple parsing logic - you can enhance this based on your API response format
    const lines = text.split('\n');
    let currentSection = 'overview';
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('symptom') || lowerLine.includes('condition')) {
        currentSection = 'symptoms';
      } else if (lowerLine.includes('recommend') || lowerLine.includes('treatment') || lowerLine.includes('suggest')) {
        currentSection = 'recommendations';
      } else if (lowerLine.includes('precaution') || lowerLine.includes('warning') || lowerLine.includes('avoid')) {
        currentSection = 'precautions';
      } else if (lowerLine.includes('follow') || lowerLine.includes('monitor') || lowerLine.includes('doctor')) {
        currentSection = 'followUp';
      }
      
      if (line.trim()) {
        sections[currentSection] += line + '\n';
      }
    });
    
    return sections;
  };
  
  const sections = parseResponse(response);
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText, color: 'emerald' },
    { id: 'symptoms', label: 'Analysis', icon: Activity, color: 'blue' },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, color: 'amber' },
    { id: 'precautions', label: 'Precautions', icon: AlertTriangle, color: 'red' },
    { id: 'followUp', label: 'Follow-up', icon: Clock, color: 'purple' }
  ];
  
  const getTabColorClasses = (color, isActive) => {
    const colors = {
      emerald: isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'text-emerald-600 hover:bg-emerald-50',
      blue: isActive ? 'bg-blue-100 text-blue-700 border-blue-300' : 'text-blue-600 hover:bg-blue-50',
      amber: isActive ? 'bg-amber-100 text-amber-700 border-amber-300' : 'text-amber-600 hover:bg-amber-50',
      red: isActive ? 'bg-red-100 text-red-700 border-red-300' : 'text-red-600 hover:bg-red-50',
      purple: isActive ? 'bg-purple-100 text-purple-700 border-purple-300' : 'text-purple-600 hover:bg-purple-50'
    };
    return colors[color] || colors.emerald;
  };
  
  const getSectionIcon = (sectionId) => {
    switch(sectionId) {
      case 'overview': return <FileText className="w-5 h-5" />;
      case 'symptoms': return <Activity className="w-5 h-5" />;
      case 'recommendations': return <Lightbulb className="w-5 h-5" />;
      case 'precautions': return <AlertTriangle className="w-5 h-5" />;
      case 'followUp': return <Clock className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };
  
  const getSectionBgColor = (sectionId) => {
    switch(sectionId) {
      case 'overview': return 'bg-emerald-50 border-emerald-200';
      case 'symptoms': return 'bg-blue-50 border-blue-200';
      case 'recommendations': return 'bg-amber-50 border-amber-200';
      case 'precautions': return 'bg-red-50 border-red-200';
      case 'followUp': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">
              {isImageAnalysis ? 'Image Analysis Results' : 'AI Health Assessment'}
            </h3>
            <p className="text-emerald-100 text-sm">
              {isImageAnalysis ? 'Medical image analysis completed' : 'Based on your symptoms and medical history'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const hasContent = sections[tab.id]?.trim();
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={!hasContent}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? getTabColorClasses(tab.color, true)
                    : hasContent 
                      ? getTabColorClasses(tab.color, false)
                      : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
                {hasContent && activeTab !== tab.id && (
                  <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {sections[activeTab]?.trim() ? (
          <div className={`p-4 rounded-xl border-2 ${getSectionBgColor(activeTab)}`}>
            <div className="flex items-center gap-2 mb-3">
              {getSectionIcon(activeTab)}
              <h4 className="font-semibold text-gray-800 capitalize">
                {activeTab === 'followUp' ? 'Follow-up Care' : activeTab}
              </h4>
            </div>
            <div
              className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: marked(sections[activeTab]) }}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Info className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No specific information available for this section.</p>
          </div>
        )}
      </div>
      
      {/* Footer with Important Notice */}
      <div className="bg-amber-50 border-t border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-amber-800 text-sm font-medium mb-1">Important Medical Disclaimer</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              This AI analysis is for informational purposes only and should not replace professional medical advice. 
              Please consult with a qualified healthcare provider for proper diagnosis and treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SymptomChat = ({ onBack }) => {
  const [chatId, setChatId] = useState(null);
  const [symptom, setSymptom] = useState("");
  const [diagnosisResult, setDiagnosisResult] = useState("");
  const [summaryHistory, setSummaryHistory] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [renamingId, setRenamingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const chatBoxRef = useRef(null);
  const { profile } = useUserProfile();
  const auth = getAuth();

  useEffect(() => {
    const startNewChat = async () => {
      const summaries = await fetchAllChatSummariesGrouped();
      setSummaryHistory(summaries || {});
      const newChatId = generateChatId();
      setSummaryHistory((prev) => ({
        ...prev,
        [newChatId]: { title: null, entries: [] },
      }));
      setChatId(newChatId);
      setChatMessages([]);
    };
    startNewChat();
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages, loading]);

  const handleHealthQuery = async () => {
    if (!symptom.trim() && !previewImage) return;
    setLoading(true);
    setError("");
    try {
      const diseases = profile?.diseases || [];
      const summariesArray = summaryHistory[chatId]?.entries || [];
      const pastSummaries = summariesArray.map((item) => item.summary);
      let result = "";
      let responseSummary = "";
      let title = "Symptom Diagnosis Summary";

      if (symptom.trim()) {
        const textResult = await fetchDiagnosis(symptom, diseases, pastSummaries);
        const aiSummary = await fetchSummary(textResult);
        result += textResult;
        responseSummary += aiSummary.summary;
        title = aiSummary.title || title;

        setChatMessages((prev) => [
          ...prev,
          {
            symptom,
            response: textResult,
            summary: aiSummary.summary,
            isImageAnalysis: false,
          },
        ]);
      }

      if (previewImage) {
        const imageResult = await fetchImageDiagnosis(previewImage);
        result += `\n\n**Image Analysis:**\n${imageResult}`;
        responseSummary += `\n\n${imageResult}`;

        setChatMessages((prev) => [
          ...prev,
          {
            symptom: "🖼 Uploaded Image",
            imagePreview: URL.createObjectURL(previewImage),
            response: imageResult,
            summary: imageResult,
            isImageAnalysis: true,
          },
        ]);

        setPreviewImage(null);
      }

      await saveDiagnosisHistory({
        uid: auth.currentUser.uid,
        symptom: symptom || "Image Uploaded",
        response: result,
        summary: responseSummary,
        chatId,
        title,
      });

      setSummaryHistory((prev) => ({
        ...prev,
        [chatId]: {
          title,
          entries: [
            ...(prev[chatId]?.entries || []),
            { summary: responseSummary, timestamp: { seconds: Date.now() / 1000 } },
          ],
        },
      }));

      setSymptom("");
      setDiagnosisResult(result);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      console.error("❌ Diagnosis error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewImage(file);
  };

  const handleMedicineImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const result = await uploadMedicineImage(file);
      setChatMessages((prev) => [
        ...prev,
        {
          symptom: "🧾 Medicine Image",
          imagePreview: URL.createObjectURL(file),
          response: result.analysis,
          summary: "Medicine analysis completed",
          isImageAnalysis: true,
        },
      ]);
    } catch (err) {
      setError(err.message || "Failed to analyze medicine image.");
    } finally {
      setLoading(false);
    }
  };

  const handleReportImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setLoading(true);
    try {
      const result = await uploadReportImages(files);
      setChatMessages((prev) => [
        ...prev,
        {
          symptom: "📄 Report Images Uploaded",
          imagePreview: URL.createObjectURL(files[0]),
          response: result.analysis,
          summary: "Report analysis completed",
          isImageAnalysis: true,
        },
      ]);
    } catch (err) {
      setError(err.message || "Failed to analyze report images.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadChat = async (selectedChatId) => {
    const fullChat = await fetchChatHistoryByChatId(selectedChatId);
    setChatId(selectedChatId);
    setChatMessages(fullChat);
    setSymptom("");
    setDiagnosisResult("");
  };

  const handleDeleteChat = async (id) => {
    await deleteChatHistoryByChatId(id);
    const updated = await fetchAllChatSummariesGrouped();
    setSummaryHistory(updated);
    if (chatId === id) {
      setChatId(null);
      setChatMessages([]);
    }
  };

  const handleRenameChat = async (id) => {
    await updateChatTitle(id, newTitle);
    const updated = await fetchAllChatSummariesGrouped();
    setSummaryHistory(updated);
    setRenamingId(null);
    setNewTitle("");
  };

  const sortedChats = Object.entries(summaryHistory).sort((a, b) => {
    if (a[0] === chatId) return -1;
    if (b[0] === chatId) return 1;
    return (b[1]?.entries?.[0]?.timestamp?.seconds || 0) -
           (a[1]?.entries?.[0]?.timestamp?.seconds || 0);
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {sidebarOpen && (
        <aside className="w-80 bg-gradient-to-b from-emerald-900 via-teal-900 to-emerald-800 text-white flex flex-col shadow-2xl border-r border-emerald-700/30">
          {/* Header */}
          <div className="p-6 border-b border-emerald-700/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-600/20 rounded-xl backdrop-blur-sm">
                  <Activity className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">HealthSync</h2>
                  <p className="text-emerald-300 text-sm">Chat History</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-emerald-700/30 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5 text-emerald-300" />
              </button>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sortedChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquareText className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                <p className="text-emerald-300 text-sm">No conversations yet</p>
                <p className="text-emerald-400 text-xs mt-1">Start your first health chat!</p>
              </div>
            ) : (
              sortedChats.map(([id, data]) => (
                <div key={id} className="relative group">
                  {renamingId === id ? (
                    <div className="flex items-center gap-2 bg-emerald-800/50 p-3 rounded-xl backdrop-blur-sm">
                      <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="bg-emerald-700/50 text-white text-sm px-3 py-2 rounded-lg w-full border border-emerald-600/30 focus:border-emerald-400 focus:outline-none placeholder-emerald-300"
                        placeholder="Enter chat title..."
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameChat(id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-2 rounded-lg transition-all duration-200"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleLoadChat(id)}
                      className={`w-full text-left text-sm p-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                        id === chatId
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                          : "bg-emerald-800/30 hover:bg-emerald-700/40 text-emerald-100 backdrop-blur-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                            <span className="font-semibold truncate text-white">
                              {data.title || "New Consultation"}
                            </span>
                          </div>
                          <div className="text-xs text-emerald-200 leading-relaxed line-clamp-2">
                            {data.entries?.[data.entries.length - 1]?.summary?.slice(0, 80) || "Start a new health conversation..."}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingId(id);
                              setNewTitle(data.title || "");
                            }}
                            className="p-1.5 hover:bg-emerald-600/50 rounded-lg transition-all duration-200"
                          >
                            <Pencil className="w-3.5 h-3.5 text-emerald-300" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(id);
                            }}
                            className="p-1.5 hover:bg-red-500/30 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-300" />
                          </button>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-emerald-700/30 space-y-3">
            <label className="flex items-center gap-3 p-3 text-sm text-emerald-200 cursor-pointer hover:text-white hover:bg-emerald-700/30 rounded-xl transition-all duration-200 group">
              <div className="p-2 bg-emerald-600/20 rounded-lg group-hover:bg-emerald-600/30 transition-all duration-200">
                <ImagePlus className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">Analyze Medicine</div>
                <div className="text-xs text-emerald-300">Upload medicine images</div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleMedicineImageUpload}
                hidden
              />
            </label>
            <label className="flex items-center gap-3 p-3 text-sm text-emerald-200 cursor-pointer hover:text-white hover:bg-emerald-700/30 rounded-xl transition-all duration-200 group">
              <div className="p-2 bg-emerald-600/20 rounded-lg group-hover:bg-emerald-600/30 transition-all duration-200">
                <ImagePlus className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">Analyze Reports</div>
                <div className="text-xs text-emerald-300">Upload medical reports</div>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleReportImagesUpload}
                hidden
              />
            </label>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm px-8 py-6 border-b border-emerald-200/50 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-3 hover:bg-emerald-100 rounded-xl transition-all duration-200 group"
                >
                  <Menu className="w-6 h-6 text-emerald-600 group-hover:text-emerald-700" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    AI Health Assistant
                  </h1>
                  <p className="text-emerald-600 text-sm">Powered by advanced AI diagnostics</p>
                </div>
              </div>
            </div>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden p-8">
          <div ref={chatBoxRef} className="flex-1 overflow-y-auto space-y-6 mb-6">
            {chatMessages.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-800 mb-3">Welcome to AI Health Assistant</h3>
                <p className="text-emerald-600 text-lg max-w-md mx-auto">
                  Describe your symptoms or upload medical images for instant AI-powered health insights.
                </p>
              </div>
            )}
            
            {chatMessages.map((msg, index) => (
              <div key={index} className="space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl rounded-tr-lg max-w-lg shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium opacity-90">You</span>
                    </div>
                    <div className="font-medium text-sm whitespace-pre-line">
                      {msg.symptom}
                    </div>
                  </div>
                </div>
                
                {/* Image Preview */}
                {msg.imagePreview && (
                  <div className="flex justify-end">
                    <img
                      src={msg.imagePreview}
                      alt="Uploaded Preview"
                      className="w-48 h-auto rounded-2xl shadow-lg border-2 border-emerald-200"
                    />
                  </div>
                )}
                
                {/* Enhanced AI Response */}
                <div className="flex justify-start">
                  <div className="max-w-4xl w-full">
                    <EnhancedAIResponse 
                      response={msg.response} 
                      isImageAnalysis={msg.isImageAnalysis}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-6 rounded-2xl rounded-tl-lg shadow-lg border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      <span className="text-emerald-600 font-medium ml-2">Analyzing symptoms...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex justify-start">
                <div className="bg-red-50 border border-red-200 p-4 rounded-2xl rounded-tl-lg max-w-lg">
                  <div className="text-red-700 font-medium">
                    ❌ {error}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-200/50 shadow-xl p-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 relative">
                <textarea
                  rows={1}
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleHealthQuery();
                    }
                  }}
                  placeholder="Describe your symptoms in detail..."
                  className="w-full resize-none border-none focus:ring-0 focus:outline-none text-gray-700 bg-transparent placeholder-emerald-400 text-lg p-2"
                />
                {previewImage && (
                  <div className="absolute bottom-full left-0 mb-2">
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(previewImage)}
                        alt="Preview"
                        className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-300"
                      />
                      <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <label className="cursor-pointer p-3 hover:bg-emerald-100 rounded-xl transition-all duration-200 group">
                  <ImagePlus className="w-6 h-6 text-emerald-600 group-hover:text-emerald-700" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    hidden
                  />
                </label>
                
                <button
                  onClick={handleHealthQuery}
                  disabled={loading || (!symptom.trim() && !previewImage)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none group"
                >
                  <Send className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomChat;