"use client";
import React, { useState } from "react";

export default function SecurityComplianceDashboard() {
  const [settings, setSettings] = useState({
    twoFactorAuth: true,
    passwordPolicy: true,
    ipAllowList: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-10">
      <h2 className="text-xl font-semibold">Security & Compliance Dashboard</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Security Settings */}
        <div className="bg-[#272727]  p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-6">Security Settings</h3>

          <div className="space-y-6">
            {/* Two-Factor Auth */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Two-Factor Authentication (2FA)</p>
                <p className="text-gray-400 text-sm">
                  Require users to verify identity using a second factor
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.twoFactorAuth}
                  onChange={() => toggleSetting("twoFactorAuth")}
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            {/* Password Policy */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Password Policy</p>
                <p className="text-gray-400 text-sm">
                  Enforce strong password requirements
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.passwordPolicy}
                  onChange={() => toggleSetting("passwordPolicy")}
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            {/* IP Allow List */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">IP Allow-List</p>
                <p className="text-gray-400 text-sm">
                  Restrict access to specific IP addresses
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.ipAllowList}
                  onChange={() => toggleSetting("ipAllowList")}
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* GDPR Tools */}
        <div className="bg-[#272727] p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-6">GDPR Tools</h3>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Data Export</p>
                <p className="text-gray-400 text-sm">
                  Export all company data in GDPR-compliant format
                </p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md">
                Export
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Data Deletion</p>
                <p className="text-gray-400 text-sm">
                  Permanently delete all company data
                </p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md">
                Delete
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Retention Policy</p>
                <p className="text-gray-400 text-sm">
                  Configure data retention periods
                </p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md">
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
