import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * Save diagnosis history to Firestore
 */
export const saveDiagnosisHistory = async ({ symptom, response, summary, chatId, title }) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await addDoc(collection(db, "history"), {
      uid: user.uid,
      chatId,
      title,
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

/**
 * Fetch complete chat messages by chatId
 */
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

    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds); // sort oldest to newest
  } catch (err) {
    console.error("❌ Error fetching chat:", err);
    return [];
  }
};

/**
 * Group chat summaries by chatId
 */
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
          title: title || 'Untitled Chat',
          entries: [],
        };
      }

      summariesByChat[chatId].entries.push({
        id: doc.id,
        summary,
        timestamp,
      });
    });

    // Sort each chat's entries by time
    Object.values(summariesByChat).forEach(chat =>
      chat.entries.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds)
    );

    return summariesByChat;
  } catch (err) {
    console.error("❌ Error fetching grouped summaries:", err);
    return {};
  }
};

/**
 * Delete all messages in a chat
 */
export const deleteChatHistoryByChatId = async (chatId) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const q = query(
      collection(db, "history"),
      where("uid", "==", user.uid),
      where("chatId", "==", chatId)
    );
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "history", docSnap.id));
    }

    console.log(`🗑️ Deleted chat with ID: ${chatId}`);
  } catch (err) {
    console.error("❌ Error deleting chat:", err);
  }
};

/**
 * Update chat title
 */
export const updateChatTitle = async (chatId, newTitle) => {
  const user = auth.currentUser;
  if (!user || !newTitle.trim()) return;

  try {
    const q = query(
      collection(db, "history"),
      where("uid", "==", user.uid),
      where("chatId", "==", chatId)
    );
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(db, "history", docSnap.id), {
        title: newTitle.trim(),
      });
    }

    console.log(`✏️ Renamed chat "${chatId}" to "${newTitle}"`);
  } catch (err) {
    console.error("❌ Error renaming chat:", err);
  }
};
