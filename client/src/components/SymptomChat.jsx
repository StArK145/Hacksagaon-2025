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
  Send,
  Stethoscope,
  Clock,
  Bot,
  User,
  FileText,
  Activity,
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
            symptom: "🖼️ Uploaded Image",
            imagePreview: URL.createObjectURL(previewImage),
            response: imageResult,
            summary: imageResult,
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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {sidebarOpen && (
        <aside className="w-80 bg-gradient-to-b from-emerald-700 to-emerald-800 text-white flex flex-col shadow-2xl">
          <div className="p-6 border-b border-emerald-600/30 bg-emerald-600/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/30 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-emerald-200" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Health Assistant</h2>
                  <p className="text-xs text-emerald-100">Consultation History</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="hover:bg-emerald-600/30 p-2 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
            <style jsx>{`
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {sortedChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquareText className="w-12 h-12 text-emerald-300 mx-auto mb-3 opacity-50" />
                <p className="text-sm text-emerald-100">No consultations yet</p>
                <p className="text-xs text-emerald-200">Start a conversation to begin</p>
              </div>
            ) : (
              sortedChats.map(([id, data]) => (
                <div key={id} className="relative group">
                  {renamingId === id ? (
                    <div className="bg-emerald-600/40 p-3 rounded-xl border border-emerald-500/30">
                      <div className="flex items-center gap-2">
                        <input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="bg-emerald-600/30 text-white text-sm px-3 py-2 rounded-lg w-full border border-emerald-500/40 focus:border-emerald-300 focus:outline-none placeholder-emerald-200"
                          placeholder="Enter chat title..."
                          autoFocus
                        />
                        <button
                          onClick={() => handleRenameChat(id)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleLoadChat(id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${
                        id === chatId
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg border-emerald-400/40"
                          : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-50 border-emerald-600/20 hover:border-emerald-500/30"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-200" />
                          <span className="font-semibold text-sm truncate max-w-[180px]">
                            {data.title || "New Consultation"}
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil
                            className="w-4 h-4 text-emerald-200 hover:text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingId(id);
                              setNewTitle(data.title || "");
                            }}
                          />
                          <Trash2
                            className="w-4 h-4 text-red-300 hover:text-red-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(id);
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-emerald-100/70 mb-2 line-clamp-2">
                        {data.entries?.[data.entries.length - 1]?.summary?.slice(0, 80) || "No summary available"}
                      </div>
                      {data.entries?.[data.entries.length - 1]?.timestamp && (
                        <div className="flex items-center gap-1 text-xs text-emerald-200/60">
                          <Clock className="w-3 h-3" />
                          {formatDate(data.entries[data.entries.length - 1].timestamp.seconds)}
                        </div>
                      )}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-emerald-600/20 bg-emerald-600/10 space-y-2">
            <div className="text-xs text-emerald-100 font-medium mb-2 flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Quick Analysis
            </div>
            <label className="flex items-center gap-2 text-xs text-emerald-100 cursor-pointer hover:text-white hover:bg-emerald-600/20 p-2 rounded-lg transition-all duration-200 group">
              <div className="p-1.5 bg-emerald-500/20 rounded-md group-hover:bg-emerald-500/30 transition-all">
                <ImagePlus className="w-3 h-3" />
              </div>
              <div>
                <div className="font-medium">Medicine Analysis</div>
                <div className="text-xs text-emerald-200/80">Upload medicine photos</div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleMedicineImageUpload}
                hidden
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-emerald-100 cursor-pointer hover:text-white hover:bg-emerald-600/20 p-2 rounded-lg transition-all duration-200 group">
              <div className="p-1.5 bg-emerald-500/20 rounded-md group-hover:bg-emerald-500/30 transition-all">
                <FileText className="w-3 h-3" />
              </div>
              <div>
                <div className="font-medium">Report Analysis</div>
                <div className="text-xs text-emerald-200/80">Upload medical reports</div>
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

      <div className="flex-1 flex flex-col">
        <div className="bg-white/80 backdrop-blur-sm px-8 py-5 border-b border-emerald-200/50 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-3 hover:bg-emerald-100 rounded-xl transition-all duration-200"
              >
                <Menu className="w-6 h-6 text-emerald-700" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-emerald-900">Health Consultation</h1>
                <p className="text-sm text-emerald-600">AI-powered symptom analysis</p>
              </div>
            </div>
          </div>
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between overflow-hidden p-6">
          <div ref={chatBoxRef} className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2">
            {chatMessages.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-900 mb-2">Welcome to Health Assistant</h3>
                <p className="text-emerald-600 max-w-md mx-auto">
                  Describe your symptoms or upload medical images for AI-powered analysis and consultation.
                </p>
              </div>
            )}
            
            {chatMessages.map((msg, index) => (
              <div key={index} className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-2xl rounded-br-md max-w-md shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-medium opacity-90">You</span>
                    </div>
                    <div className="whitespace-pre-line text-sm leading-relaxed">
                      {msg.symptom}
                    </div>
                  </div>
                </div>
                
                {msg.imagePreview && (
                  <div className="flex justify-end mb-4">
                    <div className="bg-white p-3 rounded-2xl shadow-lg border border-emerald-200">
                      <img
                        src={msg.imagePreview}
                        alt="Uploaded Preview"
                        className="w-48 h-auto rounded-xl"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-start">
                  <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl rounded-bl-md max-w-4xl shadow-lg border border-emerald-200/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-emerald-700">AI Health Assistant</span>
                    </div>
                    <div 
                      className="prose prose-sm prose-emerald max-w-none"
                      dangerouslySetInnerHTML={{ __html: marked(msg.response) }}
                      style={{
                        '--tw-prose-body': 'rgb(6 78 59)',
                        '--tw-prose-headings': 'rgb(4 47 46)',
                        '--tw-prose-links': 'rgb(5 150 105)',
                        '--tw-prose-bold': 'rgb(4 47 46)',
                        '--tw-prose-counters': 'rgb(6 78 59)',
                        '--tw-prose-bullets': 'rgb(6 78 59)',
                        '--tw-prose-hr': 'rgb(209 250 229)',
                        '--tw-prose-quotes': 'rgb(6 78 59)',
                        '--tw-prose-quote-borders': 'rgb(167 243 208)',
                        '--tw-prose-captions': 'rgb(6 78 59)',
                        '--tw-prose-code': 'rgb(4 47 46)',
                        '--tw-prose-pre-code': 'rgb(229 231 235)',
                        '--tw-prose-pre-bg': 'rgb(17 24 39)',
                        '--tw-prose-th-borders': 'rgb(209 250 229)',
                        '--tw-prose-td-borders': 'rgb(229 231 235)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl rounded-bl-md shadow-lg border border-emerald-200/50">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-emerald-700">Analyzing your symptoms...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-red-700">
                  <span className="text-sm font-medium">❌ {error}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
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
                  className="w-full resize-none border-none focus:ring-0 focus:outline-none text-sm bg-transparent placeholder-emerald-400 text-emerald-900 py-3 px-4 rounded-xl"
                  style={{ minHeight: '52px' }}
                />
                {previewImage && (
                  <div className="mt-3 flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <img
                      src={URL.createObjectURL(previewImage)}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-800">Image ready for analysis</p>
                      <p className="text-xs text-emerald-600">{previewImage.name}</p>
                    </div>
                    <button
                      onClick={() => setPreviewImage(null)}
                      className="text-emerald-500 hover:text-emerald-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <label className="cursor-pointer p-3 hover:bg-emerald-100 rounded-xl transition-all duration-200 group">
                  <ImagePlus className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700" />
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
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white p-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Send className="w-5 h-5" />
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