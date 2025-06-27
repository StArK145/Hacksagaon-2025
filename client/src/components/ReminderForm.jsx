import React, { useState } from "react";
import { addReminder } from "../utils/reminderUtils";

const ReminderForm = () => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [repeat, setRepeat] = useState("daily");

  const formatTimeToAMPM = (time24) => {
    const [hourStr, minute] = time24.split(":");
    const hour = parseInt(hourStr);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute} ${suffix}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addReminder({ title, time, repeat });
    setTitle("");
    setTime("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded shadow"
    >
      <input
        type="text"
        placeholder="Reminder Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <div
        className="flex flex-col cursor-pointer"
        onClick={() => document.getElementById("time-input").showPicker?.()}
      >
        <input
          id="time-input"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border p-2 rounded cursor-pointer"
          required
        />
        {time && (
          <span className="mt-1 text-sm text-blue-600 font-medium">
            {formatTimeToAMPM(time)}
          </span>
        )}
      </div>

      <select
        value={repeat}
        onChange={(e) => setRepeat(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Reminder
      </button>
    </form>
  );
};

export default ReminderForm;
