// utils/historyService.js

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase"; // adjust the path as needed

// /**
//  * Save diagnosis history to Firestore
//  * @param {Object} payload - { symptom, response, summary }
//  */
export const saveDiagnosisHistory = async ({ symptom, response, summary, chatId, title }) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await addDoc(collection(db, "history"), {
      uid: user.uid,
      chatId,
      title, // ✅ Add this
      symptom,
      response,
      summary,
      timestamp: Timestamp.now(),
    });
    console.log("✅ Saved chat entry with chatId:", chatId);
  } catch (err) {
    console.error("❌ Failed to save chat:", err);
  }
};

export const fetchChatHistoryByChatId = async (chatId) => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      collection(db, "history"),
      where("uid", "==", user.uid),
      where("chatId", "==", chatId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("❌ Error fetching chat:", err);
    return [];
  }
};



export const fetchAllChatSummariesGrouped = async () => {
  const user = auth.currentUser;
  if (!user) return {};

  try {
    const q = query(collection(db, "history"), where("uid", "==", user.uid));
    const snapshot = await getDocs(q);

    const summariesByChat = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const { chatId, title, summary, timestamp } = data;

      if (!summariesByChat[chatId]) {
        summariesByChat[chatId] = {
          title: title || 'Untitled Chat', // fallback if null
          entries: [],
        };
      }

      summariesByChat[chatId].entries.push({
        id: doc.id,
        summary,
        timestamp,
      });
    });

    // Optional: Sort entries inside each chat
    Object.keys(summariesByChat).forEach(chatId => {
      summariesByChat[chatId].entries.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
    });

    return summariesByChat;
  } catch (err) {
    console.error("❌ Error fetching grouped summaries:", err);
    return {};
  }
};

