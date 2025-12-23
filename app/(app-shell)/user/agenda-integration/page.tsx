"use client";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addMonths, format, parseISO, subMonths } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Menu,
} from "lucide-react";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

type Appointment = {
  id: string;
  title: string;
  startDate: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  endDate: string; // yyyy-MM-dd
  endTime: string; // HH:mm
  clientEmail: string;
  whatsappNumber: string;
  location: string;
  description: string;
};

function toISODate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function formatChipNumber(value: number) {
  return String(value);
}

const AgendaIntegrationPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 11, 9));
  const [showForm, setShowForm] = useState(false);

  const selectedDate = date ?? new Date();

  const [calendarDate, setCalendarDate] = useState<Date>(
    new Date(2025, 11, 1)
  );

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const mk = (partial: Omit<Appointment, "id"> & { id?: string }) => ({
      id: partial.id ?? String(Math.random()).slice(2),
      ...partial,
    });

    // Seed a few items so the UI matches the screenshot behavior.
    return [
      mk({
        title: "Consultation",
        startDate: "2025-12-09",
        startTime: "09:13",
        endDate: "2025-12-09",
        endTime: "09:43",
        clientEmail: "drzraju@gmail.com",
        whatsappNumber: "+880123456789",
        location: "123 Business Rd, New York, NY",
        description: "",
      }),
      mk({
        title: "Follow-up",
        startDate: "2025-12-05",
        startTime: "10:00",
        endDate: "2025-12-05",
        endTime: "10:30",
        clientEmail: "client@example.com",
        whatsappNumber: "+880123456789",
        location: "Online",
        description: "",
      }),
      mk({
        title: "Review",
        startDate: "2025-12-06",
        startTime: "14:30",
        endDate: "2025-12-06",
        endTime: "15:00",
        clientEmail: "client2@example.com",
        whatsappNumber: "+880123456789",
        location: "Office",
        description: "",
      }),
      mk({
        title: "Kickoff",
        startDate: "2025-12-07",
        startTime: "11:00",
        endDate: "2025-12-07",
        endTime: "12:00",
        clientEmail: "client3@example.com",
        whatsappNumber: "+880123456789",
        location: "Office",
        description: "",
      }),
      mk({
        title: "Check-in",
        startDate: "2025-12-10",
        startTime: "16:00",
        endDate: "2025-12-10",
        endTime: "16:20",
        clientEmail: "client4@example.com",
        whatsappNumber: "+880123456789",
        location: "Online",
        description: "",
      }),
      mk({
        title: "Planning",
        startDate: "2025-12-11",
        startTime: "13:00",
        endDate: "2025-12-11",
        endTime: "13:45",
        clientEmail: "client5@example.com",
        whatsappNumber: "+880123456789",
        location: "Office",
        description: "",
      }),
      mk({
        title: "Consultation",
        startDate: "2025-12-16",
        startTime: "09:30",
        endDate: "2025-12-16",
        endTime: "10:00",
        clientEmail: "client6@example.com",
        whatsappNumber: "+880123456789",
        location: "Office",
        description: "",
      }),
      mk({
        title: "Touchpoint",
        startDate: "2025-12-23",
        startTime: "10:45",
        endDate: "2025-12-23",
        endTime: "11:15",
        clientEmail: "client7@example.com",
        whatsappNumber: "+880123456789",
        location: "Online",
        description: "",
      }),
    ];
  });

  const selectedISO = toISODate(selectedDate);

  const appointmentDates = Array.from(
    new Set(appointments.map((a) => a.startDate))
  ).map((d) => parseISO(d));

  const selectedAppointments = appointments
    .filter((a) => a.startDate === selectedISO)
    .slice()
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const [formData, setFormData] = useState(() => {
    const initialISO = toISODate(selectedDate);
    return {
      title: "",
      startDate: initialISO,
      startTime: "",
      endDate: initialISO,
      endTime: "",
      clientEmail: "",
      whatsappNumber: "",
      location: "",
      description: "",
    };
  });

  const nextMonth = () => setCalendarDate(addMonths(calendarDate, 1));
  const prevMonth = () => setCalendarDate(subMonths(calendarDate, 1));

  const openForm = () => {
    const iso = toISODate(selectedDate);
    setFormData((prev) => ({
      ...prev,
      startDate: prev.startDate || iso,
      endDate: prev.endDate || iso,
    }));
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = formData.title.trim();
    if (!title) return;
    if (!formData.startDate || !formData.startTime) return;
    if (!formData.endDate || !formData.endTime) return;

    const newAppointment: Appointment = {
      id: String(Date.now()),
      title,
      startDate: formData.startDate,
      startTime: formData.startTime,
      endDate: formData.endDate,
      endTime: formData.endTime,
      clientEmail: formData.clientEmail.trim(),
      whatsappNumber: formData.whatsappNumber.trim(),
      location: formData.location.trim(),
      description: formData.description.trim(),
    };

    setAppointments((prev) => [...prev, newAppointment]);
    setDate(parseISO(newAppointment.startDate));
    setShowForm(false);
    setFormData((prev) => ({
      ...prev,
      title: "",
      startTime: "",
      endTime: "",
      clientEmail: "",
      whatsappNumber: "",
      location: "",
      description: "",
    }));
  };

  const handleCancel = () => setShowForm(false);

  function AgendaDayButton(
    props: React.ComponentProps<typeof CalendarDayButton>
  ) {
    const iso = toISODate(props.day.date);
    const hasAppointment = appointments.some((a) => a.startDate === iso);
    const isToday = props.modifiers.today;
    return (
      <CalendarDayButton
        {...props}
        data-has-appointment={hasAppointment ? "true" : "false"}
        data-is-today={isToday ? "true" : "false"}
      />
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-black text-white px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-md md:max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleCancel}
              className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#1C1C1E] border border-gray-800 flex items-center justify-center"
              aria-label="Back"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
            </button>
            <h1 className="text-xl md:text-2xl font-semibold">Add Appointments</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-gray-400 font-normal">Title</Label>
              <Input
                placeholder="Appointments title here"
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
                className="bg-[#1C1C1E] border-gray-800 text-gray-200 placeholder:text-gray-600 h-12 md:h-14 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400 font-normal">Starting Date & Time</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, startDate: e.target.value }))
                  }
                  className="bg-[#1C1C1E] border-gray-800 text-gray-200 h-12 md:h-14 rounded-xl scheme-dark"
                />
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, startTime: e.target.value }))
                  }
                  className="bg-[#1C1C1E] border-gray-800 text-gray-200 h-12 md:h-14 rounded-xl scheme-dark"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400 font-normal">Ending Date & Time</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, endDate: e.target.value }))
                  }
                  className="bg-[#1C1C1E] border-gray-800 text-gray-200 h-12 md:h-14 rounded-xl scheme-dark"
                />
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, endTime: e.target.value }))
                  }
                  className="bg-[#1C1C1E] border-gray-800 text-gray-200 h-12 md:h-14 rounded-xl scheme-dark"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400 font-normal">Client Email</Label>
              <Input
                placeholder="Client's email here"
                value={formData.clientEmail}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, clientEmail: e.target.value }))
                }
                className="bg-[#1C1C1E] border-gray-800 text-gray-200 h-12 md:h-14 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400 font-normal">Whatsapp Number</Label>
              <Input
                placeholder="Client's number here"
                value={formData.whatsappNumber}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, whatsappNumber: e.target.value }))
                }
                className="bg-[#1C1C1E] border-gray-800 text-gray-200 h-12 md:h-14 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400 font-normal">Location</Label>
              <Input
                placeholder="Location here"
                value={formData.location}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, location: e.target.value }))
                }
                className="bg-[#1C1C1E] border-gray-800 text-gray-200 h-12 md:h-14 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400 font-normal">Description</Label>
              <Textarea
                placeholder="Free text for internal information."
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                className="bg-[#1C1C1E] border-gray-800 text-gray-200 min-h-[140px] resize-none rounded-xl"
              />
            </div>

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                className="w-full h-12 md:h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base md:text-lg"
              >
                Save & Send Whatsapp
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="w-full h-12 md:h-14 rounded-xl bg-transparent border-gray-700 text-gray-200 hover:bg-[#1C1C1E] text-base md:text-lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-md md:max-w-4xl space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#1C1C1E] border border-gray-800 flex items-center justify-center"
            aria-label="Menu"
            type="button"
          >
            <Menu className="w-4 h-4 md:w-5 md:h-5 text-gray-200" />
          </button>
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">
            Appointments
          </h1>
        </div>

        {/* Date chips + CTA */}
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-14 h-11 md:w-20 md:h-14 rounded-xl bg-[#1C1C1E] border border-gray-800 flex items-center justify-center text-lg md:text-2xl font-semibold">
              {formatChipNumber(selectedDate.getDate())}
            </div>
            <div className="w-14 h-11 md:w-20 md:h-14 rounded-xl bg-[#1C1C1E] border border-gray-800 flex items-center justify-center text-lg md:text-2xl font-semibold text-gray-300">
              {formatChipNumber(selectedDate.getMonth() + 1)}
            </div>
            <div className="w-20 h-11 md:w-28 md:h-14 rounded-xl bg-[#1C1C1E] border border-gray-800 flex items-center justify-center text-lg md:text-2xl font-semibold">
              {formatChipNumber(selectedDate.getFullYear())}
            </div>
          </div>
          <Button
            onClick={openForm}
            className="ml-auto h-11 md:h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-8 text-sm md:text-lg"
          >
            Add Appointment
          </Button>
        </div>

        {/* Calendar */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between px-1 pb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-transparent flex items-center justify-center"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
            </button>

            <div className="text-center">
              <div className="text-xl font-medium">{format(calendarDate, "MMMM yyyy")}</div>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-transparent flex items-center justify-center"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
            </button>
          </div>

          <div className="agenda-rdp">
            <style jsx global>{`
              .agenda-rdp [data-slot='calendar'] {
                width: 100%;
              }
              .agenda-rdp .rdp {
                width: 100%;
              }
              .agenda-rdp .rdp-months {
                width: 100%;
              }
              .agenda-rdp .rdp-month {
                width: 100%;
              }
              .agenda-rdp .rdp-weekday {
                color: rgba(156, 163, 175, 1);
                font-size: 0.95rem;
                font-weight: 500;
              }

              /* Make day buttons look like the app circles */
              .agenda-rdp button[data-day] {
                width: 44px !important;
                height: 44px !important;
                border-radius: 9999px !important;
                margin: 0 auto;
                font-size: 1.05rem;
                font-weight: 500;
              }

              @media (min-width: 768px) {
                .agenda-rdp button[data-day] {
                  width: 64px !important;
                  height: 64px !important;
                  font-size: 1.35rem;
                }
                .agenda-rdp .rdp-weekday {
                  font-size: 1.05rem;
                }
              }

              /* Has appointment (blue circle) */
              .agenda-rdp button[data-has-appointment='true'] {
                background-color: rgb(37 99 235) !important;
                color: white !important;
              }

              /* Today (green circle) */
              .agenda-rdp button[data-is-today='true'] {
                background-color: rgb(16 185 129) !important;
                color: white !important;
              }

              /* Selected overrides everything (blue circle) */
              .agenda-rdp button[data-selected-single='true'] {
                background-color: rgb(37 99 235) !important;
                color: white !important;
              }
            `}</style>

            <Calendar
              mode="single"
              month={calendarDate}
              onMonthChange={setCalendarDate}
              selected={date}
              onSelect={(d) => {
                setDate(d);
                if (
                  d &&
                  (d.getFullYear() !== calendarDate.getFullYear() ||
                    d.getMonth() !== calendarDate.getMonth())
                ) {
                  setCalendarDate(new Date(d.getFullYear(), d.getMonth(), 1));
                }
              }}
              showOutsideDays
              components={{ DayButton: AgendaDayButton }}
              modifiers={{ hasAppointment: appointmentDates }}
              className="w-full"
              classNames={{
                nav: "hidden",
                month_caption: "hidden",
                months: "w-full",
                month: "w-full",
                table: "w-full border-collapse",
                head_row: "",
                row: "",
                cell: "w-1/7 py-1",
              }}
            />
          </div>
        </div>

        {/* Calendar Integration */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-xl md:text-2xl font-semibold">
            Calendar Integration
          </div>
          <div className="text-blue-500 text-base md:text-lg font-medium">
            Auto-sync enabled
          </div>
        </div>

        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-4 md:p-6">
          <div className="bg-[#1C1C1E] rounded-2xl p-4 md:p-6 flex items-center gap-4 md:gap-5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#2C2C2E] flex items-center justify-center shrink-0">
              <FcGoogle className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <div className="flex-1">
              <div className="text-lg md:text-xl font-semibold">
                Google Calendar
              </div>
              <div className="mt-2 inline-flex items-center rounded-xl bg-red-900/40 px-4 py-1 text-sm md:text-base text-red-200">
                connected
              </div>
            </div>
          </div>
        </div>

        {/* Appointments list (changes when date changes) */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xl md:text-2xl font-semibold">Appointments</div>
            <div className="text-gray-500 text-base md:text-lg">
              {format(selectedDate, "d-M-yyyy")}
            </div>
          </div>

          {selectedAppointments.length === 0 ? (
            <div className="bg-[#121212] border border-gray-800 rounded-2xl p-4 md:p-6 text-gray-500 md:text-lg">
              No appointments for this date.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedAppointments.map((a) => (
                <div
                  key={a.id}
                  className="bg-[#121212] border border-gray-800 rounded-2xl p-4 md:p-6"
                >
                  <div className="flex gap-4">
                    <div className="text-blue-500 text-lg md:text-xl font-semibold shrink-0 pt-1">
                      {format(parseISO(`${a.startDate}T${a.startTime}:00`), "h:mm a")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-2xl md:text-3xl font-semibold leading-tight">
                        {a.title}
                      </div>
                      {a.clientEmail ? (
                        <div className="text-gray-400 text-lg md:text-xl truncate">
                          {a.clientEmail}
                        </div>
                      ) : null}
                      {a.location ? (
                        <div className="text-gray-500 text-base md:text-lg truncate">
                          {a.location}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        className="mt-3 inline-flex items-center gap-2 text-blue-500 text-base md:text-lg font-medium"
                      >
                        Open in Calendar
                        <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendaIntegrationPage;

