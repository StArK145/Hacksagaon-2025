import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const addReminder = async ({ title, time, repeat }) => {
  const user = getAuth().currentUser;
  if (!user) return;

  // Get FCM token from localStorage or Firestore
  const deviceToken = localStorage.getItem("deviceToken");

  await addDoc(collection(db, "reminders"), {
    title,
    time,
    repeat,
    userId: user.uid,
    active: true,
    deviceToken: deviceToken || null,
    createdAt: new Date(),
  });
};

export const fetchReminders = async () => {
  const user = getAuth().currentUser;
  if (!user) return [];
  const q = query(collection(db, "reminders"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateReminderStatus = async (id, isActive) => {
  const reminderRef = doc(db, "reminders", id);
  await updateDoc(reminderRef, { active: isActive });
};

export const deleteReminder = async (id) => {
  const reminderRef = doc(db, "reminders", id);
  await deleteDoc(reminderRef);
};