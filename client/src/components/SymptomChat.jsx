import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import {
  saveDiagnosisHistory,
  fetchAllChatSummariesGrouped,
  fetchChatHistoryByChatId,
} from "../utils/saveHistory";
import { getAuth } from "firebase/auth";
import useUserProfile from "../utils/useUserProfile";
import { Menu, X, MessageSquareText } from "lucide-react";
import { fetchDiagnosis } from "../utils/fetchDiagnosis";
import { fetchSummary } from "../utils/fetchSummary";

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
  const chatBoxRef = useRef(null);

  const { profile } = useUserProfile();
  const auth = getAuth();

  // ✅ Always start a fresh chat session
  useEffect(() => {
    const startNewChat = async () => {
      const summaries = await fetchAllChatSummariesGrouped();
      setSummaryHistory(summaries || {});

      const newChatId = generateChatId();
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
    if (!symptom.trim()) return;

    setLoading(true);
    setError("");

    try {
      const diseases = profile?.diseases || [];
      const summariesArray = Object.values(summaryHistory[chatId] || []);
      const pastSummaries = summariesArray.map((item) => item.summary);

      const result = await fetchDiagnosis(symptom, diseases, pastSummaries);
      const aiSummary = await fetchSummary(result);
      const title = aiSummary.title || "Symptom Diagnosis Summary";

      await saveDiagnosisHistory({
        uid: auth.currentUser.uid,
        symptom,
        response: result,
        summary: aiSummary.summary,
        chatId,
        title,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          symptom,
          response: result,
          summary: aiSummary.summary,
        },
      ]);
      setSymptom("");
      setDiagnosisResult(result);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      console.error("❌ Diagnosis error:", err.message);
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
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
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {Object.keys(summaryHistory).length === 0 ? (
              <p className="text-sm text-gray-400">No chats yet</p>
            ) : (
              Object.entries(summaryHistory).map(([id, entries]) => (
                <button
                  key={id}
                  onClick={() => handleLoadChat(id)}
                  className={`w-full text-left text-sm p-3 rounded-lg transition-all ${
                    id === chatId
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  <div className="font-medium truncate">
                    {entries[0]?.title || `Chat: ${id.slice(-5)}`}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 truncate">
                    {entries[entries.length - 1]?.summary?.slice(0, 60) || ""}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <button
              onClick={onBack}
              className="text-blue-600 hover:underline text-sm"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-lg font-semibold text-gray-800 ml-2">
              Symptom Chat
            </h1>
          </div>
        </div>

        {/* Chat UI */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto p-6">
          <div
            ref={chatBoxRef}
            className="flex-1 overflow-y-auto space-y-4 mb-4"
          >
            {chatMessages.map((msg, index) => (
              <div key={index}>
                <div className="bg-blue-100 p-3 rounded-xl text-sm self-end max-w-md ml-auto whitespace-pre-line mb-2">
                  {msg.symptom}
                </div>
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

          {/* Input */}
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
            <button
              onClick={handleHealthQuery}
              disabled={loading || !symptom.trim()}
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
