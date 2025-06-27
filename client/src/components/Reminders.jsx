import React from 'react'
import ReminderForm from './ReminderForm'
import ReminderList from './ReminderList'
function Reminders() {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-center">Health Reminders</h2>
      <ReminderForm />
      <ReminderList />
    </div>
  )
}

export default Reminders