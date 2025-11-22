// "use client";
// import React, { useState } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
// import { EventInput } from "@fullcalendar/core";


// const CalendarPage: React.FC = () => {
//   const [currentView, setCurrentView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("dayGridMonth");
//   const [showForm, setShowForm] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<string | null>(null);
//   const [events, setEvents] = useState<EventInput[]>([
//     { title: "Client Meeting", date: "2025-10-12" },
//     { title: "Haircut Appointment", date: "2025-10-15" },
//   ]);
//   const [formData, setFormData] = useState({ title: "", date: "" });

// const handleDateClick = (arg: DateClickArg) => {
//   setSelectedDate(arg.dateStr);
//   setFormData({ ...formData, date: arg.dateStr });
//   setShowForm(true);
// };
// ;

//   const handleEventClick = (info: EventClickArg) => {
//     alert(`Event: ${info.event.title}`);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.title || !formData.date) return;
//     setEvents([...events, { title: formData.title, date: formData.date }]);
//     setShowForm(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-6">
//       <h1 className="text-2xl font-semibold mb-6">Agenda Calendar</h1>

//       {!showForm ? (
//         <>
//           {/* Calendar Header */}
//           <div className="flex justify-between items-center mb-4">
//             <div className="flex gap-2">
//               <button
//                 className={`px-3 py-1 rounded ${currentView === "dayGridMonth" ? "bg-blue-600" : "bg-gray-700"}`}
//                 onClick={() => setCurrentView("dayGridMonth")}
//               >
//                 Month
//               </button>
//               <button
//                 className={`px-3 py-1 rounded ${currentView === "timeGridWeek" ? "bg-blue-600" : "bg-gray-700"}`}
//                 onClick={() => setCurrentView("timeGridWeek")}
//               >
//                 Week
//               </button>
//               <button
//                 className={`px-3 py-1 rounded ${currentView === "timeGridDay" ? "bg-blue-600" : "bg-gray-700"}`}
//                 onClick={() => setCurrentView("timeGridDay")}
//               >
//                 Day
//               </button>
//             </div>
//             <button onClick={() => setShowForm(true)} className="bg-blue-600 px-4 py-2 rounded">
//               + Add Appointment
//             </button>
//           </div>

//           {/* FullCalendar Component */}
//           <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
//             <FullCalendar
//               plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//               initialView={currentView}
//               selectable={true}
//               editable={true}
//               height="auto"
//               events={events}
//               dateClick={handleDateClick}
//               eventClick={handleEventClick}
//               headerToolbar={false}
//               dayMaxEventRows={true}
//               eventDisplay="block"
//               eventColor="#2563eb"
//               eventTextColor="#fff"
//             />
//           </div>

//           {/* Google Calendar Integration */}
//           <div className="bg-gray-800 rounded-lg p-6 mt-6">
//             <div className="flex justify-between items-center mb-2">
//               <h3 className="font-semibold">Calendar Integration</h3>
//               <span className="text-sm text-gray-400">Auto-sync enabled</span>
//             </div>
//             <div className="bg-gray-700 p-3 rounded flex items-center gap-3">
//               <img src="https://www.gstatic.com/images/branding/product/2x/calendar_48dp.png" alt="Google Calendar" className="w-6 h-6" />
//               <p>Google Calendar</p>
//               <button className="ml-auto bg-blue-600 px-3 py-1 rounded text-sm">Connected</button>
//             </div>
//             <p className="text-xs text-gray-400 mt-2">
//               All appointments are automatically synchronized with your connected calendars.
//             </p>
//           </div>
//         </>
//       ) : (
//         // Appointment Form
//         <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4 max-w-xl">
//           <h2 className="text-lg font-semibold">Add Appointment</h2>
//           <input
//             type="text"
//             placeholder="Title"
//             value={formData.title}
//             className="w-full p-2 rounded bg-gray-700"
//             onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//             required
//           />
//           <input
//             type="date"
//             value={formData.date}
//             className="w-full p-2 rounded bg-gray-700"
//             onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//             required
//           />
//           <div className="flex gap-3">
//             <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Save</button>
//             <button type="button" onClick={() => setShowForm(false)} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// };

// export default CalendarPage;


"use client";
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg } from "@fullcalendar/core";

const AgendaIntegrationPage: React.FC = () => {
  const [events, setEvents] = useState<EventInput[]>([
    {
      title: "Morning Meeting",
      start: "2025-10-13T09:00:00",
      end: "2025-10-13T10:00:00",
    },
    {
      title: "Client Appointment",
      start: "2025-10-14T13:00:00",
      end: "2025-10-14T14:30:00",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", start: "", end: "" });

  // Triggered when clicking on a time slot
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setFormData({
      ...formData,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
    setShowForm(true);
  };

  // Add appointment to calendar
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start || !formData.end) return;

    setEvents([
      ...events,
      { title: formData.title, start: formData.start, end: formData.end },
    ]);

    setShowForm(false);
    setFormData({ title: "", start: "", end: "" });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">Agenda Calendar</h1>

      {!showForm ? (
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            selectable={true}
            editable={true}
            selectMirror={true}
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            nowIndicator={true}
            height="auto"
            events={events}
            select={handleDateSelect}
            eventColor="#2563eb"
            eventTextColor="#fff"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "timeGridDay,timeGridWeek,dayGridMonth",
            }}
          />
        </div>
      ) : (
        // Appointment Form
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-6 rounded-xl space-y-4 max-w-xl"
        >
          <h2 className="text-lg font-semibold">Add Appointment</h2>
          <input
            type="text"
            placeholder="Appointment Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 rounded bg-gray-700"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="datetime-local"
              value={formData.start}
              onChange={(e) =>
                setFormData({ ...formData, start: e.target.value })
              }
              className="p-2 rounded bg-gray-700"
              required
            />
            <input
              type="datetime-local"
              value={formData.end}
              onChange={(e) =>
                setFormData({ ...formData, end: e.target.value })
              }
              className="p-2 rounded bg-gray-700"
              required
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="bg-blue-600 px-4 py-2 rounded">
              Save Appointment
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-600 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AgendaIntegrationPage;
