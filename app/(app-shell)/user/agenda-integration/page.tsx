"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addMonths, format, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Send } from "lucide-react";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

const AgendaIntegrationPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 9, 12)); // Oct 12, 2025 as per design
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<"month" | "week" | "day">("month");

  // Custom navigation for the internal calendar instance to match design
  const [calendarDate, setCalendarDate] = useState<Date>(new Date(2025, 9, 1));

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    price: "",
    reminder: "1 Hour Ago",
    client: "",
    whatsapp: "",
    location: "",
    service: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setShowForm(false);
  };

  const handleClear = () => {
    setFormData({
      title: "",
      date: "",
      time: "",
      price: "",
      reminder: "1 Hour Ago",
      client: "",
      whatsapp: "",
      location: "",
      service: "",
      notes: "",
    });
  };

  const nextMonth = () => setCalendarDate(addMonths(calendarDate, 1));
  const prevMonth = () => setCalendarDate(subMonths(calendarDate, 1));

  if (showForm) {
    return (
      <div className="min-h-screen bg-black text-white p-6 font-sans">
        <div className="max-w-2xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setShowForm(false)}
              className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"
            >
              <ChevronLeft className="w-4 h-4 text-gray-300" />
            </button>
            <h1 className="text-xl font-semibold">Add Appointments</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-gray-400 font-normal">Title</Label>
              <Input
                placeholder="Appointments title here"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-[#1C1C1E] border-none text-gray-200 placeholder:text-gray-600 h-11"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                 <Label className="text-gray-400 font-normal">Date</Label>
                 <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="bg-[#1C1C1E] border-none text-gray-200 h-11 [color-scheme:dark]"
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-gray-400 font-normal">Time</Label>
                 <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="bg-[#1C1C1E] border-none text-gray-200 h-11 [color-scheme:dark]"
                 />
              </div>
            </div>

            {/* Price & Reminder */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                 <Label className="text-gray-400 font-normal">Price $ ( optional )</Label>
                 <Input
                    placeholder="$ 100.00"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="bg-[#1C1C1E] border-none text-gray-200 h-11"
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-gray-400 font-normal">Reminder</Label>
                 <Input
                    value={formData.reminder}
                    onChange={(e) => setFormData({...formData, reminder: e.target.value})}
                    className="bg-[#1C1C1E] border-none text-gray-200 h-11"
                 />
              </div>
            </div>

            {/* Client */}
            <div className="space-y-2">
              <Label className="text-gray-400 font-normal">Client</Label>
              <Input
                placeholder="Client name here"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="bg-[#1C1C1E] border-none text-gray-200 h-11"
              />
            </div>

            {/* Whatsapp */}
            <div className="space-y-2">
              <Label className="text-gray-400 font-normal">Whats App Number</Label>
              <Input
                placeholder="+880123456789"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="bg-[#1C1C1E] border-none text-gray-200 h-11"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
               <Label className="text-gray-400 font-normal">Location</Label>
               <Input
                 placeholder="Location here"
                 value={formData.location}
                 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                 className="bg-[#1C1C1E] border-none text-gray-200 h-11"
               />
            </div>

            {/* Service */}
            <div className="space-y-2">
               <Label className="text-gray-400 font-normal">Service</Label>
               <Input
                 placeholder="Service here"
                 value={formData.service}
                 onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                 className="bg-[#1C1C1E] border-none text-gray-200 h-11"
               />
            </div>

            {/* Notes */}
            <div className="space-y-2">
               <Label className="text-gray-400 font-normal">Notes (optional)</Label>
               <Textarea
                 placeholder="Free text for internal information."
                 value={formData.notes}
                 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                 className="bg-[#1C1C1E] border-none text-gray-200 min-h-[120px] resize-none"
               />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 flex items-center gap-2">
                 <Send className="w-4 h-4" />
                 Save & Send WhatsApp
              </Button>
              <Button
                type="button"
                onClick={handleClear}
                variant="outline"
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 rounded-md px-6"
              >
                Clear
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-wrap gap-4 justify-between items-center">

          {/* Title & Navigation */}
          <div className="flex items-center gap-8">
             <h1 className="text-xl font-bold">Agenda Calendar</h1>
             <div className="flex items-center gap-3 text-sm">
                <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition">
                  <ChevronLeft className="w-4 h-4 text-gray-300" />
                </button>
                <span className="font-medium text-gray-200">12 Oct 2025</span>
                <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition">
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
             </div>
          </div>

          {/* View Toggles & Action */}
          <div className="flex items-center gap-6">
            <div className="flex border border-gray-700 rounded-lg p-1 gap-1">
              {['Today', 'Week', 'Month'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v.toLowerCase() as any)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    view === v.toLowerCase()
                      ? 'bg-[#1C1C1E] text-white border border-gray-600'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 h-9 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Appointments
            </Button>
          </div>
        </div>

        {/* Calendar Card Section */}
        <div className="space-y-0">
          {/* Blue Header Bar */}
          <div className="bg-blue-600 h-10 px-4 flex items-center justify-between rounded-t-lg text-xs font-semibold">
            <span>Monthly View</span>
            <span>12 Oct 2025</span>
          </div>

          {/* Main Card Content */}
          <div className="bg-[#121212] border border-gray-800 rounded-b-xl p-8 min-h-[500px] relative">
            <div className="max-w-3xl mx-auto">
              {/* Internal Month Header */}
              <div className="flex justify-between items-end mb-12 px-4">
                 <div className="flex items-baseline gap-4">
                    <span className="text-3xl text-gray-100 font-medium">{format(calendarDate, 'MMM')}</span>
                    <span className="text-6xl text-white font-normal tracking-tight">{format(calendarDate, 'yyyy')}</span>
                 </div>
                 <div className="flex gap-6 mb-2">
                    <button onClick={prevMonth}><ChevronLeft className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                    <button onClick={nextMonth}><ChevronRight className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                 </div>
              </div>

              {/* Grid Style Override */}
              <style jsx global>{`
                .rdp { margin: 0; width: 100%; }
                .rdp-month { width: 100%; }
                .rdp-table { width: 100%; max-width: 100%; border-collapse: collapse; }

                /* Hide standard header */
                .rdp-head_row { display: none; }

                /* Basic cell styling */
                .rdp-cell { text-align: center; height: 80px; width: 14.28%; vertical-align: middle; }

                /* The day button number */
                .rdp-button {
                   width: 100%; height: 100%;
                   font-size: 2.25rem; font-weight: 400; color: #fff;
                   background: transparent; border: none;
                }
                .rdp-button:hover:not([disabled]) { background-color: transparent; }

                /* Selected state (Blue Circle) */
                .rdp-day_selected {
                   background-color: #0066FF !important;
                   color: white !important;
                   border-radius: 9999px;
                   width: 64px !important; height: 64px !important;
                   margin: 0 auto;
                }

                /* Outside days (gray) */
                .rdp-day_outside { color: #555 !important; }
              `}</style>

              <Calendar
                mode="single"
                month={calendarDate}
                onMonthChange={setCalendarDate}
                selected={date}
                onSelect={setDate}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Integration Section */}
        <div className="space-y-0">
          {/* Blue Header Bar */}
          <div className="bg-blue-600 h-10 px-4 flex items-center justify-between rounded-t-lg text-xs font-semibold">
            <span>Calendar Integration</span>
            <span className="opacity-90">Auto-sync enabled</span>
          </div>

          <div className="bg-[#121212] border border-gray-800 rounded-b-xl p-6">
             {/* Google Card */}
             <div className="bg-[#1C1C1E] rounded-lg p-4 flex items-center gap-4 max-w-2xl mb-8">
                <div className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center shrink-0">
                  <FcGoogle className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                   <span className="text-sm font-medium text-gray-200">Google Calendars</span>
                   <button className="text-xs text-blue-500 hover:text-blue-400 text-left">Connect</button>
                </div>
             </div>

             {/* Footer Info */}
             <div>
                <h3 className="text-white font-medium mb-1">Sync Information</h3>
                <p className="text-gray-500 text-xs max-w-xl leading-relaxed">
                  All appointments are automatically synchronized with your connected calendars.
                  Changes made in this agenda will reflect in Google Calendar and vice versa.
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgendaIntegrationPage;

