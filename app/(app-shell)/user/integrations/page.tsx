'use client';
import React, { useState } from 'react';

const IntegrationPage: React.FC = () => {
  const [integrations, setIntegrations] = useState([
    { name: 'Facebook Messenger', desc: 'Connect to automate replies', connected: true },
    { name: 'WhatsApp Business', desc: 'Connect to automate replies', connected: true },
    { name: 'Instagram DM', desc: 'Connect to automate replies', connected: true },
    { name: 'Calendar', desc: 'Connect to automate booking', connected: true },
    { name: 'CRM (Zapier)', desc: 'Connect to automate replies', connected: true }
  ]);

  const toggleIntegration = (index: number) => {
    setIntegrations(prev =>
      prev.map((item, i) => (i === index ? { ...item, connected: !item.connected } : item))
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {integrations.map((integration, index) => (
          <div key={index} className="bg-[#272727] rounded-xl p-5 flex flex-col justify-between shadow-lg hover:bg-gray-700 transition">
            <div>
              <h2 className="text-lg font-semibold mb-1">{integration.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{integration.desc}</p>
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  integration.connected ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                {integration.connected ? 'Connected' : 'Connect'}
              </button>
            </div>

            {/* Toggle Switch */}
            <div className="flex justify-end mt-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={integration.connected}
                  onChange={() => toggleIntegration(index)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationPage;

