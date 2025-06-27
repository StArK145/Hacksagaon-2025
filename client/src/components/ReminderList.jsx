import React, { useEffect, useState } from "react";
import { fetchReminders, updateReminderStatus, deleteReminder } from "../utils/reminderUtils";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const formatTimeToAMPM = (time24) => {
  const [hourStr, minute] = time24.split(":");
  const hour = parseInt(hourStr);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${suffix}`;
};

const ReminderList = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        const data = await fetchReminders();
        setReminders(data);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleActive = async (id, isActive) => {
    await updateReminderStatus(id, isActive);
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, active: isActive } : r)));
  };

  const handleDelete = async (id) => {
    await deleteReminder(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="p-4">
      {reminders.length === 0 ? (
        <p className="text-center text-gray-500">No reminders found.</p>
      ) : (
        reminders.map((reminder) => (
          <div key={reminder.id} className="flex justify-between items-center border p-3 mb-2 rounded">
            <div>
              <p className="font-medium">{reminder.title}</p>
              <p className="text-sm text-gray-500">{formatTimeToAMPM(reminder.time)} | {reminder.repeat}</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reminder.active}
                  onChange={(e) => toggleActive(reminder.id, e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-sm">{reminder.active ? "Active" : "Inactive"}</span>
              </label>
              <button onClick={() => handleDelete(reminder.id)} className="text-red-500 hover:underline text-sm">
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReminderList;