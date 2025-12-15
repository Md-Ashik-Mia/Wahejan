"use client";
import React from "react";

const RenewalReminders = ({ reminders }: any) => {
  return (
    <section>
      <h3 className="text-lg font-semibold mb-4">Renewal Reminders & Payment Retries</h3>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-gray-800 p-5 rounded-lg">
          <p className="font-medium">Renewal Reminders</p>
          <p className="text-gray-400 text-sm mb-2">Send email reminders before renewal</p>
          <select className="bg-gray-700 p-2 rounded-md text-sm">
            <option>{reminders.sendReminder}</option>
          </select>
        </div>
        <div className="bg-gray-800 p-5 rounded-lg">
          <p className="font-medium">Failed Payment Retries</p>
          <p className="text-gray-400 text-sm mb-2">Retry failed payments automatically</p>
          <p className="text-gray-400 text-sm">
            Retry <span className="text-white">{reminders.retryItems}</span> over{" "}
            <span className="text-white">{reminders.retryDays}</span>
          </p>
        </div>
        <div className="bg-gray-800 p-5 rounded-lg">
          <p className="font-medium">Expiration Notifications</p>
          <p className="text-gray-400 text-sm mb-2">Notify customers before expiration</p>
          <select className="bg-gray-700 p-2 rounded-md text-sm">
            <option>{reminders.notifyBefore}</option>
          </select>
        </div>
      </div>
    </section>
  );
};

export default RenewalReminders;
