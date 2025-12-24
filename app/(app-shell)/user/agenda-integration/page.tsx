"use client";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { userapi } from "@/lib/http/client";
import axios, { type AxiosResponse } from "axios";
import { addMonths, format, parseISO, subMonths } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Menu,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  eventLink?: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];

  const candidates = [payload.bookings, payload.results, payload.data, payload.list];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

function coerceDateTimeString(input: string): string {
  const s = input.trim();
  if (!s) return "";
  // API example: "2025-12-05 09:13:00" -> ISO-like
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) return s.replace(" ", "T");
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s)) return s;
  return s;
}

function formatApiDateTime(input: string): { date: string; time: string } {
  const isoLike = coerceDateTimeString(input);
  if (!isoLike) return { date: "", time: "" };
  const d = parseISO(isoLike);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  return {
    date: format(d, "yyyy-MM-dd"),
    time: format(d, "HH:mm"),
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (isRecord(data) && typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
    if (typeof error.message === "string" && error.message.trim()) return error.message;
    return fallback;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

function normalizeBooking(raw: unknown): Appointment {
  const r: UnknownRecord = isRecord(raw) ? raw : {};

  const start = typeof r.start_time === "string" ? formatApiDateTime(r.start_time) : null;
  const end = typeof r.end_time === "string" ? formatApiDateTime(r.end_time) : null;

  return {
    id: typeof r.id === "number" ? String(r.id) : String(Math.random()).slice(2),
    title: typeof r.title === "string" ? r.title : "",
    startDate: start?.date || "",
    startTime: start?.time || "",
    endDate: end?.date || start?.date || "",
    endTime: end?.time || "",
    clientEmail: typeof r.client === "string" ? r.client : "",
    whatsappNumber: "",
    location: typeof r.location === "string" ? r.location : "",
    description:
      typeof r.description === "string"
        ? r.description
        : typeof r.notes === "string"
          ? r.notes
          : "",
    eventLink: typeof r.event_link === "string" ? r.event_link : undefined,
  };
}

function toApiDateTime(date: string, time: string): string {
  const d = date.trim();
  const t = time.trim();
  if (!d || !t) return "";
  // Backend example accepts: "YYYY-MM-DD HH:mm:ss"
  return `${d} ${t}:00`;
}

function toISODate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function formatChipNumber(value: number) {
  return String(value);
}

const AgendaIntegrationPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(() => new Date());
  const [showForm, setShowForm] = useState(false);

  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  const selectedDate = date ?? new Date();

  const [calendarDate, setCalendarDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [remoteAppointments, setRemoteAppointments] = useState<Appointment[]>([]);
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [dayScopedApi, setDayScopedApi] = useState(false);

  const appointments = useMemo(
    () => [...remoteAppointments, ...localAppointments],
    [remoteAppointments, localAppointments]
  );

  const bookingsEndpoints = useMemo(
    () => [
      "/bookings/monthly/",
      "/bookings/monthly",
      "/api/bookings/monthly/",
      "/api/bookings/monthly",
    ],
    []
  );

  const googleConnectEndpoints = useMemo(
    () => [
      "/google/calendar/connect/",
      "/google/calendar/connect",
      "/api/google/calendar/connect/",
      "/api/google/calendar/connect",
    ],
    []
  );

  // Use the user's browser timezone (IANA name), e.g. "Asia/Dhaka".
  // Fallback to UTC if not available.
  const timezone = useMemo(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return typeof tz === "string" && tz.trim() ? tz : "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  const fetchBookings = useCallback(
    async (params: Record<string, string | number | undefined>) => {
      let lastError: unknown = null;
      let res: AxiosResponse<unknown> | null = null;

      for (const endpoint of bookingsEndpoints) {
        try {
          res = await userapi.get(endpoint, { params });
          break;
        } catch (e: unknown) {
          lastError = e;
          if (axios.isAxiosError(e) && e.response && e.response.status === 401) throw e;
          if (axios.isAxiosError(e) && e.response && e.response.status !== 404) {
            // for 400/etc, don't keep trying wrong endpoints
            break;
          }
        }
      }

      if (!res) throw lastError ?? new Error("Failed to load bookings");
      return res.data;
    },
    [bookingsEndpoints]
  );

  const connectGoogleCalendar = useCallback(async () => {
    setGoogleConnecting(true);
    setGoogleError(null);

    let lastError: unknown = null;
    try {
      let res: AxiosResponse<unknown> | null = null;
      for (const endpoint of googleConnectEndpoints) {
        try {
          res = await userapi.post(endpoint);
          break;
        } catch (e: unknown) {
          lastError = e;
          if (axios.isAxiosError(e) && e.response && e.response.status === 401) throw e;
          if (axios.isAxiosError(e) && e.response && e.response.status !== 404) {
            // for 400/etc, don't keep trying wrong endpoints
            break;
          }
        }
      }

      if (!res) throw lastError ?? new Error("Failed to connect Google Calendar");
      const data = res.data;

      if (isRecord(data) && typeof data.auth_url === "string" && data.auth_url.trim()) {
        window.location.href = data.auth_url;
        return;
      }

      throw new Error("Missing auth_url in response");
    } catch (e: unknown) {
      setGoogleEnabled(false);
      setGoogleError(getErrorMessage(e, "Failed to connect Google Calendar"));
    } finally {
      setGoogleConnecting(false);
    }
  }, [googleConnectEndpoints]);

  const createBookingEndpoints = useMemo(
    () => ["/booking/", "/booking", "/api/booking/", "/api/booking"],
    []
  );

  const [creatingBooking, setCreatingBooking] = useState(false);
  const [createBookingError, setCreateBookingError] = useState<string | null>(null);

  const fetchMonthBookings = useCallback(
    async (targetMonth: Date, preferredDay?: number) => {
      const month = targetMonth.getMonth() + 1;
      const year = targetMonth.getFullYear();

      setAppointmentsLoading(true);
      setAppointmentsError(null);

      try {
        // Try month-level fetch first (no day).
        try {
          const data = await fetchBookings({ month, year, timezone });
          const list = extractList(data)
            .map(normalizeBooking)
            .filter((a) => Boolean(a.startDate));
          setRemoteAppointments(list);
          setDayScopedApi(false);
          return;
        } catch {
          // If the backend requires `day`, fall back to day-scoped fetch.
          const day = typeof preferredDay === "number" ? preferredDay : 1;
          const data = await fetchBookings({ month, year, timezone, day });
          const list = extractList(data)
            .map(normalizeBooking)
            .filter((a) => Boolean(a.startDate));
          setRemoteAppointments(list);
          setDayScopedApi(true);
        }
      } catch (e: unknown) {
        setRemoteAppointments([]);
        setAppointmentsError(getErrorMessage(e, "Failed to load appointments"));
      } finally {
        setAppointmentsLoading(false);
      }
    },
    [fetchBookings, timezone]
  );

  useEffect(() => {
    const preferredDay = (date ?? new Date()).getDate();
    void fetchMonthBookings(calendarDate, preferredDay);
  }, [calendarDate, date, fetchMonthBookings]);

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
      client: "",
      number: "",
      notes: "",
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setCreateBookingError(null);

    const title = formData.title.trim();
    if (!title) return;
    if (!formData.startDate || !formData.startTime) return;
    if (!formData.endDate || !formData.endTime) return;

    const start_time = toApiDateTime(formData.startDate, formData.startTime);
    const end_time = toApiDateTime(formData.endDate, formData.endTime);
    if (!start_time || !end_time) return;

    const payload = {
      title,
      start_time,
      end_time,
      client: formData.client.trim(),
      notes: formData.notes.trim(),
      number: formData.number.trim(),
      location: formData.location.trim(),
      description: formData.description.trim(),
    };

    try {
      setCreatingBooking(true);

      let lastError: unknown = null;
      let res: AxiosResponse<unknown> | null = null;

      for (const endpoint of createBookingEndpoints) {
        try {
          res = await userapi.post(endpoint, payload);
          break;
        } catch (err: unknown) {
          lastError = err;
          if (axios.isAxiosError(err) && err.response && err.response.status === 401) throw err;
          if (axios.isAxiosError(err) && err.response && err.response.status !== 404) {
            // for 400/etc, don't keep trying wrong endpoints
            break;
          }
        }
      }

      if (!res) throw lastError ?? new Error("Failed to create booking");

      const created = normalizeBooking(res.data);
      if (created.startDate) setDate(parseISO(created.startDate));
      if (created.startDate) {
        const d = parseISO(created.startDate);
        if (!Number.isNaN(d.getTime())) setCalendarDate(new Date(d.getFullYear(), d.getMonth(), 1));
      }

      // Refresh the calendar/list from backend (preferred), and also optimistically append.
      setLocalAppointments((prev) => [created, ...prev]);
      void fetchMonthBookings(
        new Date(
          (created.startDate ? parseISO(created.startDate) : selectedDate).getFullYear(),
          (created.startDate ? parseISO(created.startDate) : selectedDate).getMonth(),
          1
        ),
        (created.startDate ? parseISO(created.startDate) : selectedDate).getDate()
      );

      setShowForm(false);
      setFormData((prev) => ({
        ...prev,
        title: "",
        startTime: "",
        endTime: "",
        client: "",
        number: "",
        notes: "",
        location: "",
        description: "",
      }));
    } catch (err: unknown) {
      setCreateBookingError(getErrorMessage(err, "Failed to create booking"));
    } finally {
      setCreatingBooking(false);
    }
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
              <Label className="text-gray-400 font-normal">Client</Label>
              <Input
                placeholder="Client email here"
                value={formData.client}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, client: e.target.value }))
                }
                className="bg-[#1C1C1E] border-gray-800 text-gray-200 h-12 md:h-14 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400 font-normal">Number</Label>
              <Input
                placeholder="Number here"
                value={formData.number}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, number: e.target.value }))
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

            <div className="space-y-2">
              <Label className="text-gray-400 font-normal">Notes</Label>
              <Textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                className="bg-[#1C1C1E] border-gray-800 text-gray-200 min-h-[120px] resize-none rounded-xl"
              />
            </div>

            {createBookingError ? (
              <p className="text-sm text-red-200">{createBookingError}</p>
            ) : null}

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                disabled={creatingBooking}
                className="w-full h-12 md:h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base md:text-lg"
              >
                {creatingBooking ? "Saving..." : "Save"}
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
                margin: 0 auto;
              }
              .agenda-rdp .rdp {
                width: 100%;
                margin: 0 auto;
              }
              .agenda-rdp .rdp-months {
                width: 100%;
              }
              .agenda-rdp .rdp-month {
                width: 100%;
                margin: 0 auto;
              }
              .agenda-rdp .rdp-weekdays {
                justify-content: space-between;
              }
              .agenda-rdp .rdp-weekday {
                text-align: center;
              }
              .agenda-rdp .rdp-weekday {
                color: rgba(156, 163, 175, 1);
                font-size: 0.95rem;
                font-weight: 500;
              }

              .agenda-rdp .rdp-week {
                justify-content: space-between;
              }

              .agenda-rdp .rdp-day {
                display: flex;
                justify-content: center;
              }

              /* Make day buttons look like the app circles */
              .agenda-rdp button[data-day] {
                width: 40px !important;
                height: 40px !important;
                border-radius: 9999px !important;
                margin: 0 auto;
                font-size: 1rem;
                font-weight: 500;
              }

              @media (min-width: 768px) {
                .agenda-rdp button[data-day] {
                  width: 56px !important;
                  height: 56px !important;
                  font-size: 1.25rem;
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

            <div className="flex justify-center">
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
                  if (d && dayScopedApi) {
                    void fetchMonthBookings(
                      new Date(d.getFullYear(), d.getMonth(), 1),
                      d.getDate()
                    );
                  }
                }}
                showOutsideDays
                components={{ DayButton: AgendaDayButton }}
                modifiers={{ hasAppointment: appointmentDates }}
                classNames={{
                  nav: "hidden",
                  month_caption: "hidden",
                  months: "w-full",
                  month: "w-full",
                  table: "w-full",
                }}
              />
            </div>

            {appointmentsError ? (
              <p className="text-sm text-red-400 mt-3">{appointmentsError}</p>
            ) : appointmentsLoading ? (
              <p className="text-sm text-gray-400 mt-3">Loading appointments...</p>
            ) : null}
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
            <div className="flex-1 flex items-center justify-between gap-4">
              <div>
                <div className="text-lg md:text-xl font-semibold">Google Calendar</div>
                {googleError ? (
                  <div className="mt-2 text-sm text-red-200">{googleError}</div>
                ) : null}
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={googleEnabled}
                disabled={googleConnecting}
                onClick={() => {
                  const next = !googleEnabled;
                  setGoogleEnabled(next);
                  if (next) void connectGoogleCalendar();
                }}
                className={
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors " +
                  (googleEnabled ? "bg-blue-600" : "bg-gray-700") +
                  (googleConnecting ? " opacity-60" : "")
                }
                aria-label="Google Calendar"
              >
                <span
                  className={
                    "inline-block h-5 w-5 transform rounded-full bg-white transition-transform " +
                    (googleEnabled ? "translate-x-6" : "translate-x-1")
                  }
                />
              </button>
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
                      {a.startDate && a.startTime
                        ? format(parseISO(`${a.startDate}T${a.startTime}:00`), "h:mm a")
                        : "—"}
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
                      {a.eventLink ? (
                        <a
                          href={a.eventLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-blue-500 text-base md:text-lg font-medium"
                        >
                          Open in Calendar
                          <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="mt-3 inline-flex items-center gap-2 text-blue-500 text-base md:text-lg font-medium"
                          disabled
                        >
                          Open in Calendar
                          <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      )}
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

