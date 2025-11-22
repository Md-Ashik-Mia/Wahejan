'use client';
import React, { useState } from 'react';

const AIAssistantDashboard: React.FC = () => {
  const [openingHours, setOpeningHours] = useState({ start: '9.00', end: '9.00', day: 'Monday' });
  const [services, setServices] = useState([
    { name: 'Basic Consultation', price: '99.99', start: '11.00 am', end: '11.00 pm' },
    { name: 'Standard Website', price: '99.99', start: '11.00 am', end: '11.00 pm' }
  ]);
  const [tone, setTone] = useState(5);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      {/* Company Info */}
      <section className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold">AI Assistant</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="bg-gray-900 p-3 rounded-lg" placeholder="Company name here" />
          <select className="bg-gray-900 p-3 rounded-lg">
            <option>Technology</option>
            <option>Education</option>
            <option>Health</option>
          </select>
          <textarea className="col-span-2 bg-gray-900 p-3 rounded-lg" placeholder="What does your company do?" />
        </div>

        {/* Opening Hours */}
        <div className="pt-4">
          <h3 className="font-semibold mb-2">Opening Hours</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <input className="bg-gray-900 p-2 rounded-lg w-24" value={openingHours.start} />
            <span>to</span>
            <input className="bg-gray-900 p-2 rounded-lg w-24" value={openingHours.end} />
            <select className="bg-gray-900 p-2 rounded-lg">
              <option>Monday</option>
              <option>Tuesday</option>
            </select>
            <button className="bg-red-600 px-3 py-2 rounded-lg">Delete</button>
          </div>
        </div>

        {/* Location */}
        <div className="pt-4">
          <h3 className="font-semibold mb-2">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="bg-gray-900 p-3 rounded-lg" placeholder="Address" />
            <input className="bg-gray-900 p-3 rounded-lg" placeholder="City" />
            <input className="bg-gray-900 p-3 rounded-lg" placeholder="Country" />
          </div>
        </div>

        <button className="mt-4 bg-blue-600 px-6 py-2 rounded-lg">Update</button>
      </section>

      {/* Prices & Services */}
      <section className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold">Prices & Services (Optional)</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-gray-900">
              <th>Service Name</th>
              <th>Price</th>
              <th>Start Time</th>
              <th>End Time</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, idx) => (
              <tr key={idx} className="border-b border-gray-900">
                <td>{service.name}</td>
                <td>${service.price}</td>
                <td>{service.start}</td>
                <td>{service.end}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3">
          <input className="bg-gray-900 p-2 rounded-lg" placeholder="Service Name" />
          <input className="bg-gray-900 p-2 rounded-lg" placeholder="Price ($)" />
          <input className="bg-gray-900 p-2 rounded-lg" placeholder="Start Time" />
          <input className="bg-gray-900 p-2 rounded-lg" placeholder="End Time" />
        </div>
        <button className="mt-3 bg-blue-600 px-6 py-2 rounded-lg">+ Add</button>
      </section>

      {/* Tone & Training */}
      <section className="bg-[#272727] rounded-2xl p-6 shadow-lg grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Tone & Personality</h3>
          <p>Adjust how the AI speaks for your brand.</p>
          <input type="range" min="0" max="10" value={tone} onChange={(e) => setTone(Number(e.target.value))} className="w-full mt-3" />
          <button className="bg-blue-600 mt-3 px-4 py-2 rounded-lg">Save Tone</button>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Train AI</h3>
          <div className="border-2 border-dashed border-gray-900 p-6 text-center rounded-xl">
            <p>Drag files here, or click to browse</p>
            <p className="text-gray-400 text-sm mt-2">Supports PDF, DOCX, CSV (max 10MB each)</p>
          </div>
        </div>
      </section>

      {/* Website & Knowledge Base */}
      <section className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Add Your Website</h3>
          <input className="bg-gray-900 p-3 rounded-lg w-full" placeholder="Input your website link..." />
        </div>

        <div>
          <h3 className="font-semibold mb-4">AI Assistant Knowledge Base</h3>
          <button className="bg-blue-600 px-4 py-2 rounded-lg mb-3">+ Add New Topic</button>

          <div className="space-y-3">
            {["Day Pass", "Opening Hours", "Refund Policy", "Membership Plans", "Shipping Information"].map((topic, i) => (
              <div key={i} className="bg-gray-900 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{topic}</h4>
                  <p className="text-gray-400 text-sm">Added: 15 Oct 2023</p>
                </div>
                <div className="flex gap-3">
                  <button className="bg-blue-500 px-3 py-1 rounded-lg">✏️</button>
                  <button className="bg-red-600 px-3 py-1 rounded-lg">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIAssistantDashboard;
