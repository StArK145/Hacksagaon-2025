import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { getAuth } from "firebase/auth";
import useUserProfile from "../utils/useUserProfile";
import { fetchDiagnosis } from "../utils/fetchDiagnosis";

const generateChatId = () => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 7);
  return `chat_${timestamp}_${randomPart}`;
};

const SymptomChat = ({ onBack }) => {
  const [chatId, setChatId] = useState(null);
  const [symptom, setSymptom] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatBoxRef = useRef(null);

  const { profile } = useUserProfile();
  const auth = getAuth();

  useEffect(() => {
    const newChatId = generateChatId();
    setChatId(newChatId);
    setChatMessages([]);
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
      const result = await fetchDiagnosis(symptom, diseases, []);

      setChatMessages((prev) => [
        ...prev,
        {
          symptom,
          response: result,
        },
      ]);

      setSymptom("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      console.error("❌ Diagnosis error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen p-6 bg-gray-50 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-lg font-semibold">Symptom Diagnosis</h2>
      </div>

      <div ref={chatBoxRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
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
          <div className="text-sm text-red-600 font-medium">❌ {error}</div>
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
        <button
          onClick={handleHealthQuery}
          disabled={loading || !symptom.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SymptomChat;
