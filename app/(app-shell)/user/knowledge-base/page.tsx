import Link from "next/link";
import React from 'react';

const AIKnowledgeBase: React.FC = () => {
  // Fake Data
  const knowledgeHealth = 70;
  const missingTopics = ['Service Prices', 'Refund Policy', 'Delivery Times'];
  const categories = [
    { name: 'Company Info', items: 5, icon: '🏢' },
    { name: 'Services', items: 7, icon: '🛠️' },
    { name: 'Prices', items: 12, icon: '💲' },
    { name: 'Opening Hours', items: 3, icon: '🕒' },
    { name: 'Policies', items: 2, icon: '📜' },
    { name: 'FAQs', items: 14, icon: '❓' }
  ];

  const logs = [
    { title: 'Price list updated', desc: 'Haircut price changed from €12 to €15', time: 'Today, 10:24 AM' },
    { title: 'New FAQ added', desc: '“What payment methods do you accept?”', time: 'Yesterday, 3:45 PM' },
    { title: 'Working hours updated', desc: 'Extended Saturday hours', time: 'Oct 21, 2023' },
    { title: 'Service removed', desc: '“Beard trimming” service deleted', time: 'Oct 18, 2023' }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      {/* Header */}
      <h1 className="text-2xl font-bold">AI Knowledge Base</h1>

      {/* Knowledge Base Health */}
      <section className="bg-[#272727] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center shadow-lg">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
              <path
                className="text-gray-700"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500"
                strokeWidth="4"
                strokeDasharray={`${knowledgeHealth}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold">
              {knowledgeHealth}%
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Knowledge Base Health</h3>
            <p className="text-gray-400">Your AI knowledge is {knowledgeHealth}% complete. Add missing information to improve customer interactions.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {missingTopics.map((topic, idx) => (
                <span key={idx} className="bg-red-700 px-3 py-1 rounded-full text-sm">{topic}</span>
              ))}
            </div>
          </div>
        </div>
         <Link href="/user/ai-assistant#knowledge-base">
        <button className="bg-blue-600 px-4 py-2 rounded-lg mt-4 md:mt-0">+ Add Missing Info</button>
        </Link>
      </section>

      {/* Knowledge Categories */}
      <section>
        <h2 className="text-lg font-semibold bg-blue-600 px-4 py-2 rounded-t-lg">Knowledge Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-black p-4 rounded-b-lg">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-[#272727] rounded-xl p-6 flex flex-col items-center justify-center shadow-md hover:bg-gray-700 transition">
              <div className="text-4xl mb-2">{cat.icon}</div>
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="text-gray-400 text-sm">{cat.items} items</p>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Log */}
      <section>
        <h2 className="text-lg font-semibold bg-blue-600 px-4 py-2 rounded-t-lg">Activity Log</h2>
        <div className="bg-[#272727] p-6 rounded-b-lg space-y-4">
          {logs.map((log, idx) => (
            <div key={idx} className="border-b border-gray-700 pb-3">
              <h4 className="font-semibold flex items-center gap-2">🔹 {log.title}</h4>
              <p className="text-gray-300 text-sm">{log.desc}</p>
              <p className="text-gray-500 text-xs">{log.time}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Import/Export */}
      <section>
        <h2 className="text-lg font-semibold bg-blue-600 px-4 py-2 rounded-t-lg">Import/Export</h2>
        <div className="bg-[#272727] p-6 rounded-b-lg">
          <p className="text-gray-300 mb-3">Upload files to add information in bulk or export your AI knowledge for review.</p>
          <button className="bg-blue-600 px-4 py-2 rounded-lg">⬇️ Export</button>
        </div>
      </section>
    </div>
  );
};

export default AIKnowledgeBase;

