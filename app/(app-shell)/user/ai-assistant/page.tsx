// 'use client';
// import React, { useState } from 'react';

// const AIAssistantDashboard: React.FC = () => {
//   const [openingHours, setOpeningHours] = useState({ start: '9.00', end: '9.00', day: 'Monday' });
//   const [services, setServices] = useState([
//     { name: 'Basic Consultation', price: '99.99', start: '11.00 am', end: '11.00 pm' },
//     { name: 'Standard Website', price: '99.99', start: '11.00 am', end: '11.00 pm' }
//   ]);
//   const [tone, setTone] = useState(5);

//   return (
//     <div className="min-h-screen bg-black text-white p-6 space-y-8">
//       {/* Company Info */}
//       <section className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-4">
//         <h2 className="text-xl font-semibold">AI Assistant</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <input className="bg-gray-900 p-3 rounded-lg" placeholder="Company name here" />
//           <select className="bg-gray-900 p-3 rounded-lg">
//             <option>Technology</option>
//             <option>Education</option>
//             <option>Health</option>
//           </select>
//           <textarea className="col-span-2 bg-gray-900 p-3 rounded-lg" placeholder="What does your company do?" />
//         </div>

//         {/* Opening Hours */}
//         <div className="pt-4">
//           <h3 className="font-semibold mb-2">Opening Hours</h3>
//           <div className="flex flex-wrap gap-3 items-center">
//             <input className="bg-gray-900 p-2 rounded-lg w-24" value={openingHours.start} />
//             <span>to</span>
//             <input className="bg-gray-900 p-2 rounded-lg w-24" value={openingHours.end} />
//             <select className="bg-gray-900 p-2 rounded-lg">
//               <option>Monday</option>
//               <option>Tuesday</option>
//             </select>
//             <button className="bg-red-600 px-3 py-2 rounded-lg">Delete</button>
//           </div>
//         </div>

//         {/* Location */}
//         <div className="pt-4">
//           <h3 className="font-semibold mb-2">Location</h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//             <input className="bg-gray-900 p-3 rounded-lg" placeholder="Address" />
//             <input className="bg-gray-900 p-3 rounded-lg" placeholder="City" />
//             <input className="bg-gray-900 p-3 rounded-lg" placeholder="Country" />
//           </div>
//         </div>

//         <button className="mt-4 bg-blue-600 px-6 py-2 rounded-lg">Update</button>
//       </section>

//       {/* Prices & Services */}
//       <section className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-4">
//         <h2 className="text-xl font-semibold">Prices & Services (Optional)</h2>
//         <table className="w-full text-left">
//           <thead>
//             <tr className="text-gray-400 border-b border-gray-900">
//               <th>Service Name</th>
//               <th>Price</th>
//               <th>Start Time</th>
//               <th>End Time</th>
//             </tr>
//           </thead>
//           <tbody>
//             {services.map((service, idx) => (
//               <tr key={idx} className="border-b border-gray-900">
//                 <td>{service.name}</td>
//                 <td>${service.price}</td>
//                 <td>{service.start}</td>
//                 <td>{service.end}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3">
//           <input className="bg-gray-900 p-2 rounded-lg" placeholder="Service Name" />
//           <input className="bg-gray-900 p-2 rounded-lg" placeholder="Price ($)" />
//           <input className="bg-gray-900 p-2 rounded-lg" placeholder="Start Time" />
//           <input className="bg-gray-900 p-2 rounded-lg" placeholder="End Time" />
//         </div>
//         <button className="mt-3 bg-blue-600 px-6 py-2 rounded-lg">+ Add</button>
//       </section>

//       {/* Tone & Training */}
//       <section className="bg-[#272727] rounded-2xl p-6 shadow-lg grid md:grid-cols-2 gap-6">
//         <div>
//           <h3 className="font-semibold mb-2">Tone & Personality</h3>
//           <p>Adjust how the AI speaks for your brand.</p>
//           <input type="range" min="0" max="10" value={tone} onChange={(e) => setTone(Number(e.target.value))} className="w-full mt-3" />
//           <button className="bg-blue-600 mt-3 px-4 py-2 rounded-lg">Save Tone</button>
//         </div>

//         <div>
//           <h3 className="font-semibold mb-2">Train AI</h3>
//           <div className="border-2 border-dashed border-gray-900 p-6 text-center rounded-xl">
//             <p>Drag files here, or click to browse</p>
//             <p className="text-gray-400 text-sm mt-2">Supports PDF, DOCX, CSV (max 10MB each)</p>
//           </div>
//         </div>
//       </section>

//       {/* Website & Knowledge Base */}
//       <section className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-4">
//         <div>
//           <h3 className="font-semibold mb-2">Add Your Website</h3>
//           <input className="bg-gray-900 p-3 rounded-lg w-full" placeholder="Input your website link..." />
//         </div>

//         <div>
//           <h3 className="font-semibold mb-4">AI Assistant Knowledge Base</h3>
//           <button className="bg-blue-600 px-4 py-2 rounded-lg mb-3">+ Add New Topic</button>

//           <div className="space-y-3">
//             {["Day Pass", "Opening Hours", "Refund Policy", "Membership Plans", "Shipping Information"].map((topic, i) => (
//               <div key={i} className="bg-gray-900 p-4 rounded-xl flex justify-between items-center">
//                 <div>
//                   <h4 className="font-semibold">{topic}</h4>
//                   <p className="text-gray-400 text-sm">Added: 15 Oct 2023</p>
//                 </div>
//                 <div className="flex gap-3">
//                   <button className="bg-blue-500 px-3 py-1 rounded-lg">✏️</button>
//                   <button className="bg-red-600 px-3 py-1 rounded-lg">🗑️</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default AIAssistantDashboard;






"use client";

import React, { useRef, useState, FormEvent } from "react";

type OpeningSlot = {
  id: number;
  day: string;
  start: string;
  end: string;
};

type Service = {
  id: number;
  name: string;
  price: string;
  start: string;
  end: string;
};

type KnowledgeTopic = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
};

const AIAssistantDashboard: React.FC = () => {
  /* ─────────────────────────────────────
     Opening hours state
  ───────────────────────────────────── */
  const [openingSlots, setOpeningSlots] = useState<OpeningSlot[]>([
    { id: 1, day: "Monday", start: "09:00", end: "17:00" },
  ]);
  const [openingForm, setOpeningForm] = useState<{
    id: number | null;
    day: string;
    start: string;
    end: string;
  }>({
    id: null,
    day: "Monday",
    start: "09:00",
    end: "17:00",
  });

  const handleOpeningSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!openingForm.day || !openingForm.start || !openingForm.end) return;

    if (openingForm.id === null) {
      // add new
      const newSlot: OpeningSlot = {
        id: Date.now(),
        day: openingForm.day,
        start: openingForm.start,
        end: openingForm.end,
      };
      setOpeningSlots((prev) => [...prev, newSlot]);
    } else {
      // update existing
      setOpeningSlots((prev) =>
        prev.map((slot) =>
          slot.id === openingForm.id
            ? {
                ...slot,
                day: openingForm.day,
                start: openingForm.start,
                end: openingForm.end,
              }
            : slot
        )
      );
    }

    // reset form
    setOpeningForm({
      id: null,
      day: "Monday",
      start: "09:00",
      end: "17:00",
    });
  };

  const handleOpeningEdit = (slot: OpeningSlot) => {
    setOpeningForm({
      id: slot.id,
      day: slot.day,
      start: slot.start,
      end: slot.end,
    });
  };

  const handleOpeningDelete = (id: number) => {
    setOpeningSlots((prev) => prev.filter((s) => s.id !== id));
    // if we were editing this one, reset the form
    if (openingForm.id === id) {
      setOpeningForm({
        id: null,
        day: "Monday",
        start: "09:00",
        end: "17:00",
      });
    }
  };

  /* ─────────────────────────────────────
     Services state
  ───────────────────────────────────── */
  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      name: "Basic Consultation",
      price: "99.99",
      start: "11:00",
      end: "18:00",
    },
    {
      id: 2,
      name: "Standard Website",
      price: "199.99",
      start: "10:00",
      end: "17:00",
    },
  ]);

  const [serviceForm, setServiceForm] = useState<{
    id: number | null;
    name: string;
    price: string;
    start: string;
    end: string;
  }>({
    id: null,
    name: "",
    price: "",
    start: "",
    end: "",
  });

  const handleServiceSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.price) return;

    if (serviceForm.id === null) {
      const newService: Service = {
        id: Date.now(),
        name: serviceForm.name,
        price: serviceForm.price,
        start: serviceForm.start,
        end: serviceForm.end,
      };
      setServices((prev) => [...prev, newService]);
    } else {
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceForm.id
            ? {
                ...s,
                name: serviceForm.name,
                price: serviceForm.price,
                start: serviceForm.start,
                end: serviceForm.end,
              }
            : s
        )
      );
    }

    setServiceForm({
      id: null,
      name: "",
      price: "",
      start: "",
      end: "",
    });
  };

  const handleServiceEdit = (service: Service) => {
    setServiceForm({
      id: service.id,
      name: service.name,
      price: service.price,
      start: service.start,
      end: service.end,
    });
  };

  const handleServiceDelete = (id: number) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    if (serviceForm.id === id) {
      setServiceForm({
        id: null,
        name: "",
        price: "",
        start: "",
        end: "",
      });
    }
  };

  /* ─────────────────────────────────────
     Tone & personality
  ───────────────────────────────────── */
  const [tone, setTone] = useState(5);

  /* ─────────────────────────────────────
     Train AI – file upload
  ───────────────────────────────────── */
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploadedFiles(Array.from(files));
  };

  /* ─────────────────────────────────────
     Knowledge base (topics + modal)
  ───────────────────────────────────── */
  const [topics, setTopics] = useState<KnowledgeTopic[]>([
    {
      id: 1,
      title: "Day Pass",
      description: "Information about day passes.",
      createdAt: "2023-10-15",
    },
    {
      id: 2,
      title: "Opening Hours",
      description: "Details about when we are open.",
      createdAt: "2023-10-15",
    },
  ]);

  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [kbForm, setKbForm] = useState<{
    id: number | null;
    title: string;
    description: string;
  }>({
    id: null,
    title: "",
    description: "",
  });

  const openNewTopicModal = () => {
    setKbForm({ id: null, title: "", description: "" });
    setIsKbModalOpen(true);
  };

  const openEditTopicModal = (topic: KnowledgeTopic) => {
    setKbForm({
      id: topic.id,
      title: topic.title,
      description: topic.description,
    });
    setIsKbModalOpen(true);
  };

  const handleKbSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!kbForm.title || !kbForm.description) return;

    if (kbForm.id === null) {
      const newTopic: KnowledgeTopic = {
        id: Date.now(),
        title: kbForm.title,
        description: kbForm.description,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setTopics((prev) => [...prev, newTopic]);
    } else {
      setTopics((prev) =>
        prev.map((t) =>
          t.id === kbForm.id
            ? { ...t, title: kbForm.title, description: kbForm.description }
            : t
        )
      );
    }

    setIsKbModalOpen(false);
  };

  const handleTopicDelete = (id: number) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
    if (kbForm.id === id) {
      setKbForm({ id: null, title: "", description: "" });
    }
  };

  /* ───────────────────────────────────── */

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      {/* Company Info & Opening Hours & Location */}
      <section className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-6">
        <h2 className="text-xl font-semibold">AI Assistant</h2>

        {/* Basic company info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="bg-gray-900 p-3 rounded-lg"
            placeholder="Company name here"
          />
          <select className="bg-gray-900 p-3 rounded-lg">
            <option>Technology</option>
            <option>Education</option>
            <option>Health</option>
          </select>
          <textarea
            className="col-span-1 md:col-span-2 bg-gray-900 p-3 rounded-lg"
            placeholder="What does your company do?"
          />
        </div>

        {/* Opening Hours list */}
        <div>
          <h3 className="font-semibold mb-2">Opening Hours</h3>

          <div className="flex flex-wrap gap-3 mb-4">
            {openingSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-gray-900 px-4 py-3 rounded-xl flex items-center gap-3"
              >
                <div>
                  <div className="font-semibold">{slot.day}</div>
                  <div className="text-sm text-gray-300">
                    {slot.start} – {slot.end}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => handleOpeningEdit(slot)}
                    className="text-xs bg-blue-600 px-3 py-1 rounded-lg"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpeningDelete(slot.id)}
                    className="text-xs bg-red-600 px-3 py-1 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {openingSlots.length === 0 && (
              <p className="text-sm text-gray-400">
                No opening hours added yet.
              </p>
            )}
          </div>

          {/* Opening hours form */}
          <form
            onSubmit={handleOpeningSubmit}
            className="flex flex-wrap gap-3 items-center"
          >
            <select
              className="bg-gray-900 p-2 rounded-lg"
              value={openingForm.day}
              onChange={(e) =>
                setOpeningForm((f) => ({ ...f, day: e.target.value }))
              }
            >
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <input
              className="bg-gray-900 p-2 rounded-lg w-28"
              value={openingForm.start}
              onChange={(e) =>
                setOpeningForm((f) => ({ ...f, start: e.target.value }))
              }
              placeholder="Start"
            />
            <span>to</span>
            <input
              className="bg-gray-900 p-2 rounded-lg w-28"
              value={openingForm.end}
              onChange={(e) =>
                setOpeningForm((f) => ({ ...f, end: e.target.value }))
              }
              placeholder="End"
            />
            <button
              type="submit"
              className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              {openingForm.id === null ? "Add Slot" : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Location */}
        <div>
          <h3 className="font-semibold mb-2">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="bg-gray-900 p-3 rounded-lg"
              placeholder="Address"
            />
            <input className="bg-gray-900 p-3 rounded-lg" placeholder="City" />
            <input
              className="bg-gray-900 p-3 rounded-lg"
              placeholder="Country"
            />
          </div>

          {/* Website under location (as requested) */}
          <div className="mt-3">
            <h4 className="font-semibold mb-1 text-sm">Website URL</h4>
            <input
              className="bg-gray-900 p-3 rounded-lg w-full"
              placeholder="https://your-company.com"
            />
          </div>
        </div>

        <button className="mt-2 bg-blue-600 px-6 py-2 rounded-lg">
          Update
        </button>
      </section>

      {/* Prices & Services */}
      <section className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold">Prices & Services (Optional)</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-900">
                <th className="py-2">Service Name</th>
                <th className="py-2">Price</th>
                <th className="py-2">Start Time</th>
                <th className="py-2">End Time</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-gray-900 text-sm"
                >
                  <td className="py-2">{service.name}</td>
                  <td className="py-2">${service.price}</td>
                  <td className="py-2">{service.start}</td>
                  <td className="py-2">{service.end}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleServiceEdit(service)}
                        className="text-xs bg-blue-600 px-3 py-1 rounded-lg"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => handleServiceDelete(service.id)}
                        className="text-xs bg-red-600 px-3 py-1 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {services.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 text-center text-gray-400 text-sm"
                  >
                    No services added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Service form */}
        <form
          onSubmit={handleServiceSubmit}
          className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-3"
        >
          <input
            className="bg-gray-900 p-2 rounded-lg"
            placeholder="Service Name"
            value={serviceForm.name}
            onChange={(e) =>
              setServiceForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <input
            className="bg-gray-900 p-2 rounded-lg"
            placeholder="Price ($)"
            value={serviceForm.price}
            onChange={(e) =>
              setServiceForm((f) => ({ ...f, price: e.target.value }))
            }
          />
          <input
            className="bg-gray-900 p-2 rounded-lg"
            placeholder="Start Time"
            value={serviceForm.start}
            onChange={(e) =>
              setServiceForm((f) => ({ ...f, start: e.target.value }))
            }
          />
          <input
            className="bg-gray-900 p-2 rounded-lg"
            placeholder="End Time"
            value={serviceForm.end}
            onChange={(e) =>
              setServiceForm((f) => ({ ...f, end: e.target.value }))
            }
          />
          <button
            type="submit"
            className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            {serviceForm.id === null ? "+ Add" : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Tone & Training */}
      <section className="bg-[#272727] rounded-2xl p-6 shadow-lg grid md:grid-cols-2 gap-6">
        {/* Tone */}
        <div>
          <h3 className="font-semibold mb-2">Tone & Personality</h3>
          <p className="text-sm text-gray-300">
            Adjust how the AI speaks for your brand.
          </p>
          <input
            type="range"
            min="0"
            max="10"
            value={tone}
            onChange={(e) => setTone(Number(e.target.value))}
            className="w-full mt-3"
          />
          <div className="mt-1 text-xs text-gray-400">
            Current tone: <span className="font-semibold">{tone}</span>
          </div>
          <button className="bg-blue-600 mt-3 px-4 py-2 rounded-lg">
            Save Tone
          </button>
        </div>

        {/* Train AI */}
        <div>
          <h3 className="font-semibold mb-2">Train AI</h3>
          <div
            onClick={handleFileClick}
            className="border-2 border-dashed border-gray-900 p-6 text-center rounded-xl cursor-pointer hover:bg-gray-900/40"
          >
            <p>Drag files here, or click to browse</p>
            <p className="text-gray-400 text-sm mt-2">
              Supports PDF, DOCX, CSV (max 10MB each)
            </p>
          </div>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFilesSelected}
            className="hidden"
          />

          {uploadedFiles.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-gray-300">
              {uploadedFiles.map((file) => (
                <li key={file.name}>• {file.name}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Knowledge Base */}
      <section id="knowledge-base" className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold mb-2">AI Assistant Knowledge Base</h3>
          <button
            className="bg-blue-600 px-4 py-2 rounded-lg"
            onClick={openNewTopicModal}
          >
            + Add New Topic
          </button>
        </div>

        <div className="space-y-3">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-gray-900 p-4 rounded-xl flex justify-between items-start gap-4"
            >
              <div>
                <h4 className="font-semibold">{topic.title}</h4>
                <p className="text-gray-400 text-sm mt-1">
                  {topic.description}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Added: {topic.createdAt}
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button
                  className="bg-blue-500 px-3 py-1 rounded-lg text-xs"
                  onClick={() => openEditTopicModal(topic)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="bg-red-600 px-3 py-1 rounded-lg text-xs"
                  onClick={() => handleTopicDelete(topic.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}

          {topics.length === 0 && (
            <p className="text-sm text-gray-400">
              No topics yet. Click &quot;Add New Topic&quot; to get started.
            </p>
          )}
        </div>
      </section>

      {/* Modal for Knowledge base topic */}
      {isKbModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#181818] rounded-2xl p-6 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-semibold">
              {kbForm.id === null ? "Add New Topic" : "Edit Topic"}
            </h3>
            <form onSubmit={handleKbSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Subject</label>
                <input
                  className="bg-gray-900 p-3 rounded-lg w-full"
                  placeholder="Topic subject"
                  value={kbForm.title}
                  onChange={(e) =>
                    setKbForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Description</label>
                <textarea
                  className="bg-gray-900 p-3 rounded-lg w-full min-h-[120px]"
                  placeholder="Describe this topic so the AI can answer questions about it…"
                  value={kbForm.description}
                  onChange={(e) =>
                    setKbForm((f) => ({ ...f, description: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsKbModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-semibold"
                >
                  {kbForm.id === null ? "Add Topic" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistantDashboard;
