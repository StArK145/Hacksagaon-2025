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

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <aside className="w-72 bg-gray-900 text-white flex flex-col border-r border-gray-800">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquareText className="w-5 h-5 text-blue-400" />
              <span className="text-lg font-semibold">Symptom History</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="hover:bg-gray-800 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sortedChats.length === 0 ? (
              <p className="text-sm text-gray-400">No chats yet</p>
            ) : (
              sortedChats.map(([id, data]) => (
                <div key={id} className="relative group">
                  {renamingId === id ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="bg-gray-700 text-white text-sm px-2 py-1 rounded w-full"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameChat(id)}
                        className="text-blue-400 text-xs px-2"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleLoadChat(id)}
                      className={`w-full text-left text-sm p-3 rounded-lg transition-all ${
                        id === chatId
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate">
                          {data.title || "New Chat"}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                          <Pencil
                            className="w-4 h-4 text-gray-400 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingId(id);
                              setNewTitle(data.title || "");
                            }}
                          />
                          <Trash2
                            className="w-4 h-4 text-red-400 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(id);
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        {data.entries?.[data.entries.length - 1]?.summary?.slice(0, 60) || ""}
                      </div>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-800 space-y-3">
            <label className="flex items-center gap-2 text-sm text-blue-400 cursor-pointer hover:text-white">
              <ImagePlus className="w-4 h-4" />
              Analyze Medicine
              <input
                type="file"
                accept="image/*"
                onChange={handleMedicineImageUpload}
                hidden
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-blue-400 cursor-pointer hover:text-white">
              <ImagePlus className="w-4 h-4" />
              Analyze Reports
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
        <div className="bg-white px-6 py-4 border-b flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h1 className="text-lg font-semibold text-gray-800">Symptom Chat</h1>
          </div>
          <button
            onClick={onBack}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-sm transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between overflow-y-auto p-6">
          <div ref={chatBoxRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
            {chatMessages.map((msg, index) => (
              <div key={index}>
                <div className="bg-blue-100 p-3 rounded-xl text-sm self-end max-w-md ml-auto whitespace-pre-line mb-2">
                  {msg.symptom}
                </div>
                {msg.imagePreview && (
                  <img
                    src={msg.imagePreview}
                    alt="Uploaded Preview"
                    className="w-40 h-auto rounded-xl mb-2"
                  />
                )}
                <div
                  className="bg-gray-100 p-3 text-sm rounded-xl max-w-xl whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: marked(msg.response) }}
                />
              </div>
            ))}
            {loading && (
              <div className="text-sm text-gray-500 animate-pulse">
                Analyzing symptoms...
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 font-medium">
                ❌ {error}
              </div>
            )}
          </div>

          <div className="flex items-end gap-2 border rounded-xl px-4 py-3 bg-white shadow-sm">
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
              placeholder="Describe your symptoms..."
              className="flex-1 resize-none border-none focus:ring-0 focus:outline-none text-sm"
            />
            {previewImage && (
              <img
                src={URL.createObjectURL(previewImage)}
                alt="Preview"
                className="w-10 h-10 rounded object-cover"
              />
            )}
            <label className="cursor-pointer">
              <ImagePlus className="w-5 h-5 text-blue-500" />
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomChat;
