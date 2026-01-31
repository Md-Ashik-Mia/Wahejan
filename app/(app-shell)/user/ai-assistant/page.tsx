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

import { userapi } from "@/lib/http/client";
import axios from "axios";
import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type OpeningSlot = {
  id: string | number;
  day: string;
  start: string;
  end: string;
};

const OPENING_HOURS_ENDPOINT = "/opening-hours/";
const COMPANY_ENDPOINT = "/auth/company/";
const SERVICE_ENDPOINT = "/auth/company/service/";
const AI_TRAINING_FILES_ENDPOINT = "/ai-training-files/";
const KNOWLEDGE_BASE_ENDPOINT = "/knowledge-base/";

type TrainingFile = {
  id: number;
  file: string;
  uploaded_at: string | null;
  company: number | null;
};

function normalizeTrainingFile(raw: unknown): TrainingFile {
  const r: UnknownRecord = isRecord(raw) ? raw : {};
  return {
    id: typeof r.id === "number" ? r.id : 0,
    file: typeof r.file === "string" ? r.file : "",
    uploaded_at: typeof r.uploaded_at === "string" ? r.uploaded_at : null,
    company: typeof r.company === "number" ? r.company : null,
  };
}

function filenameFromPath(path: string): string {
  const clean = path.trim();
  if (!clean) return "";
  const parts = clean.split("/");
  return parts[parts.length - 1] ?? clean;
}

const DAY_OPTIONS = [
  { code: "mon", label: "Monday" },
  { code: "tue", label: "Tuesday" },
  { code: "wed", label: "Wednesday" },
  { code: "thu", label: "Thursday" },
  { code: "fri", label: "Friday" },
  { code: "sat", label: "Saturday" },
  { code: "sun", label: "Sunday" },
] as const;

type DayCode = (typeof DAY_OPTIONS)[number]["code"];

const DAY_LABEL: Record<DayCode, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function normalizeTimeHHmm(value: unknown): string {
  if (typeof value !== "string") return "";
  // Accept "09:00" or "09:00:00"; trim to HH:mm
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) return trimmed.slice(0, 5);
  return trimmed;
}

function parseFlexibleTimeToHHmm(value: string): string {
  const v = value.trim().toLowerCase();
  if (!v) return "";

  // HH:mm (or H:mm) or HH.mm (or H.mm) with optional am/pm
  const withMinutes = v.match(/^(\d{1,2})\s*[:.](\d{2})\s*(am|pm)?$/);
  if (withMinutes) {
    const hour = Number(withMinutes[1]);
    const minute = Number(withMinutes[2]);
    const suffix = withMinutes[3] as "am" | "pm" | undefined;

    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return "";
    if (minute < 0 || minute > 59) return "";

    let h = hour;
    if (suffix) {
      if (h < 1 || h > 12) return "";
      if (suffix === "am") h = h === 12 ? 0 : h;
      if (suffix === "pm") h = h === 12 ? 12 : h + 12;
    } else {
      if (h < 0 || h > 23) return "";
    }

    return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  // H am/pm (no minutes)
  const hoursOnly = v.match(/^(\d{1,2})\s*(am|pm)$/);
  if (hoursOnly) {
    let h = Number(hoursOnly[1]);
    const suffix = hoursOnly[2] as "am" | "pm";
    if (!Number.isFinite(h) || h < 1 || h > 12) return "";
    if (suffix === "am") h = h === 12 ? 0 : h;
    if (suffix === "pm") h = h === 12 ? 12 : h + 12;
    return `${String(h).padStart(2, "0")}:00`;
  }

  // Fallback: try to normalize strict HH:mm / HH:mm:ss strings
  const strict = normalizeTimeHHmm(v);
  if (/^\d{2}:\d{2}$/.test(strict)) return strict;
  return "";
}

function normalizeTimeHHmmss(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const hhmm = parseFlexibleTimeToHHmm(value);
  if (!hhmm) return null;
  // backend examples use HH:mm:ss
  return `${hhmm}:00`;
}

function toDayCode(value: unknown): DayCode | "" {
  if (typeof value !== "string") return "";
  const v = value.trim().toLowerCase();
  if ((DAY_LABEL as Record<string, string>)[v]) return v as DayCode;
  // Handle full names like "Monday" or abbreviations like "Mon"
  const map: Record<string, DayCode> = {
    monday: "mon",
    mon: "mon",
    tuesday: "tue",
    tue: "tue",
    wednesday: "wed",
    wed: "wed",
    thursday: "thu",
    thu: "thu",
    friday: "fri",
    fri: "fri",
    saturday: "sat",
    sat: "sat",
    sunday: "sun",
    sun: "sun",
  };
  return map[v] ?? "";
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function normalizeOpeningSlot(raw: unknown): OpeningSlot {
  const r: UnknownRecord = isRecord(raw) ? raw : {};
  const idRaw = r.id ?? r._id ?? r.uuid ?? r.pk;

  const daysRaw = r.days;
  const dayFromDays = Array.isArray(daysRaw) ? daysRaw[0] : undefined;
  const dayRaw = dayFromDays ?? r.day ?? r.weekday ?? r.day_name;

  const startRaw = r.start ?? r.start_time ?? r.from ?? r.open;
  const endRaw = r.end ?? r.end_time ?? r.to ?? r.close;

  const dayCode = toDayCode(dayRaw);

  return {
    id: typeof idRaw === "string" || typeof idRaw === "number" ? idRaw : "",
    day: dayCode,
    start: normalizeTimeHHmm(startRaw),
    end: normalizeTimeHHmm(endRaw),
  };
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (!data) return error.message || fallback;

    if (Array.isArray(data)) {
      return data.join(" ") || fallback;
    }

    if (isRecord(data)) {
      if (typeof data.detail === "string" && data.detail.trim()) {
        return data.detail;
      }
      if (Array.isArray(data.detail)) {
        return data.detail.join(" ");
      }
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }

      // Handle simple key-value errors or validation errors
      const firstValue = Object.values(data)[0];
      if (typeof firstValue === "string") return firstValue;
      if (Array.isArray(firstValue) && typeof firstValue[0] === "string") return firstValue[0];

      try {
        const text = JSON.stringify(data);
        if (text && text !== "{}") return text;
      } catch {
        // ignore
      }
    }

    if (typeof error.message === "string" && error.message.trim()) return error.message;
    return fallback;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

type CompanyData = {
  id: number | null;
  name: string | null;
  industry: string | null;
  description: string | null;
  open: string | null;
  close: string | null;
  is_24_hours_open: boolean | null;
  address: string | null;
  city: string | null;
  country: string | null;
  system_language: string | null;
  tone: string | null;
  training_files: unknown;
  website: string | null;
  summary: string | null;
  user: number | null;
  greeting: string | null;
  concurrent_booking_limit: number | null;
};

function normalizeCompany(raw: unknown): CompanyData {
  const r: UnknownRecord = isRecord(raw) ? raw : {};
  const toNullableString = (v: unknown) => (typeof v === "string" ? v : null);
  const toNullableNumber = (v: unknown) => (typeof v === "number" ? v : null);
  const toNullableBool = (v: unknown) => (typeof v === "boolean" ? v : null);

  return {
    id: toNullableNumber(r.id),
    name: toNullableString(r.name),
    industry: toNullableString(r.industry),
    description: toNullableString(r.description),
    open: toNullableString(r.open),
    close: toNullableString(r.close),
    is_24_hours_open: toNullableBool(r.is_24_hours_open),
    address: toNullableString(r.address),
    city: toNullableString(r.city),
    country: toNullableString(r.country),
    system_language: toNullableString(r.system_language),
    tone: toNullableString(r.tone),
    training_files: r.training_files,
    website: toNullableString(r.website),
    summary: toNullableString(r.summary),
    user: toNullableNumber(r.user),
    greeting: toNullableString(r.greeting),
    concurrent_booking_limit: toNullableNumber(r.concurrent_booking_limit),
  };
}

function parsePriceToNumber(value: string): number | null {
  const cleaned = value.replace(/[^0-9.]/g, "").trim();
  if (!cleaned) return null;
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function emptyToNull(value: string): string | null {
  const v = value.trim();
  return v ? v : null;
}

function withTrailingSlash(path: string) {
  return path.endsWith("/") ? path : `${path}/`;
}

async function requestWithSlashFallback<T>(
  fn: (endpoint: string) => Promise<T>,
  endpoint: string
): Promise<T> {
  try {
    return await fn(endpoint);
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      const alt = endpoint.endsWith("/") ? endpoint.slice(0, -1) : withTrailingSlash(endpoint);
      return await fn(alt);
    }
    throw e;
  }
}

function buildOpeningHourCreatePayload(form: { day: string; start: string; end: string }) {
  // Matches Postman CREATE: { days: ['fri'], start: '09:00', end: '18:00' }
  const dayCode = toDayCode(form.day);
  return {
    days: dayCode ? [dayCode] : [],
    start: normalizeTimeHHmm(form.start),
    end: normalizeTimeHHmm(form.end),
  };
}

function buildOpeningHourUpdatePayload(form: { day: string; start: string; end: string }) {
  // Matches Postman UPDATE: { day: 'fri', start: '10:00', end: '18:00' }
  const dayCode = toDayCode(form.day);
  return {
    day: dayCode || form.day,
    start: normalizeTimeHHmm(form.start),
    end: normalizeTimeHHmm(form.end),
  };
}

function openingHourDetailEndpoint(id: string | number) {
  return `${withTrailingSlash(OPENING_HOURS_ENDPOINT)}${id}/`;
}

async function patchOrPut(endpoint: string, body: unknown) {
  try {
    return await userapi.patch(endpoint, body);
  } catch (e: unknown) {
    // Some backends don't allow PATCH but allow PUT
    if (axios.isAxiosError(e) && e.response?.status === 405) {
      return await userapi.put(endpoint, body);
    }
    throw e;
  }
}

type Service = {
  id: number;
  name: string;
  description: string;
  price: string;
  start_time: string;
  end_time: string;
  duration?: number | null;
};

function normalizeService(raw: unknown): Service {
  const r: UnknownRecord = isRecord(raw) ? raw : {};
  const id = typeof r.id === "number" ? r.id : 0;
  const name = typeof r.name === "string" ? r.name : "";
  const description = typeof r.description === "string" ? r.description : "";
  const price = typeof r.price === "string" ? r.price : r.price != null ? String(r.price) : "";
  const start_time = normalizeTimeHHmm(r.start_time);
  const end_time = normalizeTimeHHmm(r.end_time);
  const duration =
    typeof r.duration === "number"
      ? r.duration
      : typeof r.duration_minutes === "number"
      ? r.duration_minutes
      : null;
  return {
    id,
    name,
    description,
    price,
    start_time,
    end_time,
    duration,
  };
}

type KnowledgeTopic = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
};

function normalizeKnowledgeTopic(raw: unknown): KnowledgeTopic {
  const r: UnknownRecord = isRecord(raw) ? raw : {};
  const id = typeof r.id === "number" ? r.id : 0;
  const title = typeof r.name === "string" ? r.name : "";
  const description = typeof r.details === "string" ? r.details : "";
  const createdAt = typeof r.created_at === "string" ? r.created_at : "";
  return { id, title, description, createdAt };
}

function knowledgeBaseDetailEndpoint(id: number) {
  return `${withTrailingSlash(KNOWLEDGE_BASE_ENDPOINT)}${id}/`;
}

const AIAssistantDashboard: React.FC = () => {
  /* ─────────────────────────────────────
     Company state
  ───────────────────────────────────── */
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    industry: "",
    description: "",
    address: "",
    city: "",
    country: "",
    website: "",
    greeting: "",
    concurrent_booking_limit: 1,
  });

  const toneInitializedRef = useRef(false);

  const fetchCompany = useCallback(async () => {
    setCompanyLoading(true);
    setCompanyError(null);
    try {
      const res = await requestWithSlashFallback((ep) => userapi.get(ep), COMPANY_ENDPOINT);
      const normalized = normalizeCompany(res?.data);
      setCompany(normalized);

      if (!toneInitializedRef.current) {
        setTonePreset(normalized.tone ?? "standard");
        toneInitializedRef.current = true;
      }

      setCompanyForm({
        name: normalized.name ?? "",
        industry: normalized.industry ?? "",
        description: normalized.description ?? "",
        address: normalized.address ?? "",
        city: normalized.city ?? "",
        country: normalized.country ?? "",
        website: normalized.website ?? "",
        greeting: normalized.greeting ?? "",
        concurrent_booking_limit: normalized.concurrent_booking_limit ?? 1,
      });
    } catch (e: unknown) {
      setCompanyError(getApiErrorMessage(e, "Failed to load company details"));
    } finally {
      setCompanyLoading(false);
    }
  }, []);

  const handleCompanyUpdate = async () => {
    setCompanyLoading(true);
    setCompanyError(null);
    try {
      const current = company;
      // Preserve non-UI fields from backend so we don't accidentally null them out.
      const payload = {
        name: emptyToNull(companyForm.name),
        industry: emptyToNull(companyForm.industry),
        description: emptyToNull(companyForm.description),
        open: current?.open ?? null,
        close: current?.close ?? null,
        is_24_hours_open: current?.is_24_hours_open ?? false,
        address: emptyToNull(companyForm.address),
        city: emptyToNull(companyForm.city),
        country: emptyToNull(companyForm.country),
        system_language: current?.system_language ?? "English",
        tone: current?.tone ?? null,
        training_files: current?.training_files ?? null,
        website: emptyToNull(companyForm.website),
        summary: current?.summary ?? null,
        greeting: emptyToNull(companyForm.greeting),
        concurrent_booking_limit: Number(companyForm.concurrent_booking_limit) || 1,
      };

      const res = await requestWithSlashFallback(
        (ep) => userapi.patch(ep, payload),
        COMPANY_ENDPOINT
      );

      const normalized = normalizeCompany(res?.data);
      setCompany(normalized);
      setCompanyForm({
        name: normalized.name ?? "",
        industry: normalized.industry ?? "",
        description: normalized.description ?? "",
        address: normalized.address ?? "",
        city: normalized.city ?? "",
        country: normalized.country ?? "",
        website: normalized.website ?? "",
        greeting: normalized.greeting ?? "",
        concurrent_booking_limit: normalized.concurrent_booking_limit ?? 1,
      });
    } catch (e: unknown) {
      setCompanyError(getApiErrorMessage(e, "Failed to update company details"));
    } finally {
      setCompanyLoading(false);
    }
  };

  /* ─────────────────────────────────────
     Opening hours state
  ───────────────────────────────────── */
  const [openingSlots, setOpeningSlots] = useState<OpeningSlot[]>([]);
  const [openingLoading, setOpeningLoading] = useState(false);
  const [openingError, setOpeningError] = useState<string | null>(null);
  const [openingForm, setOpeningForm] = useState<{
    id: string | number | null;
    day: string;
    start: string;
    end: string;
  }>({
    id: null,
    day: "mon",
    start: "09:00",
    end: "17:00",
  });

  const fetchOpeningHours = useCallback(async () => {
    setOpeningLoading(true);
    setOpeningError(null);
    try {
      const res = await requestWithSlashFallback(
        (ep) => userapi.get(ep),
        OPENING_HOURS_ENDPOINT
      );
      const payload = res?.data;

      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.list)
        ? payload.list
        : [];

      const normalized = list
        .map(normalizeOpeningSlot)
        .filter((s: OpeningSlot) => s.id !== "" && Boolean(s.day));

      setOpeningSlots(normalized);
    } catch (e: unknown) {
      setOpeningError(getApiErrorMessage(e, "Failed to load opening hours"));
    } finally {
      setOpeningLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();
    fetchOpeningHours();
  }, [fetchCompany, fetchOpeningHours]);

  const handleOpeningSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!openingForm.day || !openingForm.start || !openingForm.end) return;

    setOpeningLoading(true);
    setOpeningError(null);
    try {
      if (openingForm.id === null) {
        // create
        await requestWithSlashFallback(
          (ep) => userapi.post(ep, buildOpeningHourCreatePayload(openingForm)),
          OPENING_HOURS_ENDPOINT
        );
      } else {
        // update: backend uses detail route `/opening-hours/{id}/`
        const detail = openingHourDetailEndpoint(openingForm.id);
        await requestWithSlashFallback(
          (ep) => patchOrPut(ep, buildOpeningHourUpdatePayload(openingForm)),
          detail
        );
      }

      setOpeningForm({
        id: null,
        day: "mon",
        start: "09:00",
        end: "17:00",
      });
      await fetchOpeningHours();
    } catch (e: unknown) {
      setOpeningError(getApiErrorMessage(e, "Failed to save opening hour"));
    } finally {
      setOpeningLoading(false);
    }
  };

  const handleOpeningEdit = (slot: OpeningSlot) => {
    setOpeningForm({
      id: slot.id,
      day: slot.day,
      start: slot.start,
      end: slot.end,
    });
  };

  const handleOpeningDelete = async (id: string | number) => {
    setOpeningLoading(true);
    setOpeningError(null);
    try {
      // delete: backend uses detail route `/opening-hours/{id}/`
      const detail = openingHourDetailEndpoint(id);
      await requestWithSlashFallback((ep) => userapi.delete(ep), detail);

      if (openingForm.id === id) {
        setOpeningForm({
          id: null,
          day: "mon",
          start: "09:00",
          end: "17:00",
        });
      }
      await fetchOpeningHours();
    } catch (e: unknown) {
      setOpeningError(getApiErrorMessage(e, "Failed to delete opening hour"));
    } finally {
      setOpeningLoading(false);
    }
  };

  /* ─────────────────────────────────────
     Services state
  ───────────────────────────────────── */
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [serviceForm, setServiceForm] = useState<{
    id: number | null;
    name: string;
    description: string;
    price: string;
    start_time: string;
    end_time: string;
    duration: string;
  }>({
    id: null,
    name: "",
    description: "",
    price: "",
    start_time: "",
    end_time: "",
    duration: "",
  });

  const fetchServices = useCallback(async () => {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const res = await requestWithSlashFallback((ep) => userapi.get(ep), SERVICE_ENDPOINT);
      const payload = res?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.list)
        ? payload.list
        : [];
      setServices(list.map(normalizeService).filter((s: Service) => s.id && s.name));
    } catch (e: unknown) {
      setServicesError(getApiErrorMessage(e, "Failed to load services"));
    } finally {
      setServicesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleServiceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.price) return;

    const parsedPrice = parsePriceToNumber(serviceForm.price);
    if (parsedPrice === null) {
      setServicesError("Price must be a valid number");
      return;
    }

    setServicesLoading(true);
    setServicesError(null);

    try {
      if (serviceForm.id === null) {
        // create
        const duration = serviceForm.duration.trim();
        await requestWithSlashFallback(
          (ep) =>
            userapi.post(ep, {
              name: serviceForm.name,
              description: serviceForm.description,
              price: parsedPrice,
              ...(duration ? { duration: Number(duration) } : {}),
              start_time: normalizeTimeHHmmss(serviceForm.start_time),
              end_time: normalizeTimeHHmmss(serviceForm.end_time),
            }),
          SERVICE_ENDPOINT
        );
      } else {
        // update: PATCH /auth/company/service/{id}/
        const detail = `${withTrailingSlash(SERVICE_ENDPOINT)}${serviceForm.id}/`;
        const duration = serviceForm.duration.trim();
        await requestWithSlashFallback(
          (ep) =>
            userapi.patch(ep, {
              name: serviceForm.name,
              description: serviceForm.description,
              price: parsedPrice,
              ...(duration ? { duration: Number(duration) } : {}),
              ...(serviceForm.start_time ? { start_time: normalizeTimeHHmmss(serviceForm.start_time) } : {}),
              ...(serviceForm.end_time ? { end_time: normalizeTimeHHmmss(serviceForm.end_time) } : {}),
            }),
          detail
        );
      }

      setServiceForm({
        id: null,
        name: "",
        description: "",
        price: "",
        start_time: "",
        end_time: "",
        duration: "",
      });

      await fetchServices();
    } catch (e: unknown) {
      setServicesError(getApiErrorMessage(e, "Failed to save service"));
    } finally {
      setServicesLoading(false);
    }
  };

  const handleServiceEdit = (service: Service) => {
    setServiceForm({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      start_time: service.start_time,
      end_time: service.end_time,
      duration: typeof service.duration === "number" ? String(service.duration) : "",
    });
  };

  const handleServiceDelete = async (id: number) => {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const detail = `${withTrailingSlash(SERVICE_ENDPOINT)}${id}/`;
      await requestWithSlashFallback((ep) => userapi.delete(ep), detail);

      if (serviceForm.id === id) {
        setServiceForm({
          id: null,
          name: "",
          description: "",
          price: "",
          start_time: "",
          end_time: "",
          duration: "",
        });
      }

      await fetchServices();
    } catch (e: unknown) {
      setServicesError(getApiErrorMessage(e, "Failed to delete service"));
    } finally {
      setServicesLoading(false);
    }
  };

  /* ─────────────────────────────────────
     Tone & personality
  ───────────────────────────────────── */
  const [tonePreset, setTonePreset] = useState<string>("standard");
  const [toneSaving, setToneSaving] = useState(false);

  const handleTonePresetChange = async (nextTone: string) => {
    const prev = tonePreset;
    setTonePreset(nextTone);
    setToneSaving(true);
    setCompanyError(null);

    try {
      const res = await requestWithSlashFallback(
        (ep) => userapi.patch(ep, { tone: nextTone }),
        COMPANY_ENDPOINT
      );
      const normalized = normalizeCompany(res?.data);
      setCompany(normalized);
    } catch (e: unknown) {
      setTonePreset(prev);
      setCompanyError(getApiErrorMessage(e, "Failed to update tone"));
    } finally {
      setToneSaving(false);
    }
  };

  /* ─────────────────────────────────────
     Train AI – file upload
  ───────────────────────────────────── */
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [trainingUploading, setTrainingUploading] = useState(false);
  const [trainingError, setTrainingError] = useState<string | null>(null);

  const [trainingFiles, setTrainingFiles] = useState<TrainingFile[]>([]);
  const [trainingFilesLoading, setTrainingFilesLoading] = useState(false);
  const [trainingFilesError, setTrainingFilesError] = useState<string | null>(null);
  const [trainingFileDeletingId, setTrainingFileDeletingId] = useState<number | null>(null);

  const fetchTrainingFiles = useCallback(async () => {
    setTrainingFilesLoading(true);
    setTrainingFilesError(null);
    try {
      const res = await requestWithSlashFallback(
        (ep) => userapi.get(ep),
        AI_TRAINING_FILES_ENDPOINT
      );
      const payload = res?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.list)
        ? payload.list
        : [];

      const normalized = list
        .map(normalizeTrainingFile)
        .filter((f: TrainingFile) => Boolean(f.id) && Boolean(f.file))
        .sort((a: TrainingFile, b: TrainingFile) => {
          const at = a.uploaded_at ? Date.parse(a.uploaded_at) : 0;
          const bt = b.uploaded_at ? Date.parse(b.uploaded_at) : 0;
          return bt - at;
        });

      setTrainingFiles(normalized);
    } catch (e: unknown) {
      setTrainingFilesError(getApiErrorMessage(e, "Failed to load training files"));
    } finally {
      setTrainingFilesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainingFiles();
  }, [fetchTrainingFiles]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const uploadTrainingFiles = async (files: File[]) => {
    if (!files.length) return;

    setTrainingUploading(true);
    setTrainingError(null);
    try {
      const form = new FormData();
      for (const file of files) {
        form.append("files", file);
      }

      await requestWithSlashFallback(
        (ep) =>
          userapi.post(ep, form, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }),
        AI_TRAINING_FILES_ENDPOINT
      );

      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchTrainingFiles();
    } catch (e: unknown) {
      setTrainingError(getApiErrorMessage(e, "Failed to upload training files"));
    } finally {
      setTrainingUploading(false);
    }
  };

  const handleDeleteTrainingFile = async (id: number) => {
    setTrainingFileDeletingId(id);
    setTrainingFilesError(null);
    try {
      // Backend expects DELETE /ai-training-files/ with JSON: { file_id: <id> }
      await requestWithSlashFallback(
        (ep) => userapi.delete(ep, { data: { file_id: id } }),
        AI_TRAINING_FILES_ENDPOINT
      );
      await fetchTrainingFiles();
    } catch (e: unknown) {
      setTrainingFilesError(getApiErrorMessage(e, "Failed to delete training file"));
    } finally {
      setTrainingFileDeletingId(null);
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const list = Array.from(files);
    void uploadTrainingFiles(list);
  };

  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files ?? []).filter((f) => f.size > 0);
    if (!list.length) return;
    void uploadTrainingFiles(list);
  };

  const handleDragOverFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  /* ─────────────────────────────────────
     Knowledge base (topics + modal)
  ───────────────────────────────────── */
  const [topics, setTopics] = useState<KnowledgeTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [topicSaving, setTopicSaving] = useState(false);
  const [topicDeletingId, setTopicDeletingId] = useState<number | null>(null);

  const fetchTopics = useCallback(async () => {
    setTopicsLoading(true);
    setTopicsError(null);
    try {
      const res = await requestWithSlashFallback(
        (ep) => userapi.get(ep),
        KNOWLEDGE_BASE_ENDPOINT
      );
      const payload = res?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.list)
        ? payload.list
        : [];

      const normalized = list
        .map(normalizeKnowledgeTopic)
        .filter((t: KnowledgeTopic) => Boolean(t.id) && Boolean(t.title))
        .sort((a: KnowledgeTopic, b: KnowledgeTopic) => {
          const at = a.createdAt ? Date.parse(a.createdAt) : 0;
          const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
          return bt - at;
        });

      setTopics(normalized);
    } catch (e: unknown) {
      setTopicsError(getApiErrorMessage(e, "Failed to load topics"));
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

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

  const handleKbSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!kbForm.title || !kbForm.description) return;

    setTopicSaving(true);
    setTopicsError(null);
    try {
      if (kbForm.id === null) {
        await requestWithSlashFallback(
          (ep) => userapi.post(ep, { name: kbForm.title, details: kbForm.description }),
          KNOWLEDGE_BASE_ENDPOINT
        );
      } else {
        const detail = knowledgeBaseDetailEndpoint(kbForm.id);
        await requestWithSlashFallback(
          (ep) => userapi.patch(ep, { name: kbForm.title, details: kbForm.description }),
          detail
        );
      }

      setIsKbModalOpen(false);
      setKbForm({ id: null, title: "", description: "" });
      await fetchTopics();
    } catch (e: unknown) {
      setTopicsError(getApiErrorMessage(e, "Failed to save topic"));
    } finally {
      setTopicSaving(false);
    }
  };

  const handleTopicDelete = async (id: number) => {
    setTopicDeletingId(id);
    setTopicsError(null);
    try {
      const detail = knowledgeBaseDetailEndpoint(id);
      await requestWithSlashFallback((ep) => userapi.delete(ep), detail);
      if (kbForm.id === id) {
        setKbForm({ id: null, title: "", description: "" });
      }
      await fetchTopics();
    } catch (e: unknown) {
      setTopicsError(getApiErrorMessage(e, "Failed to delete topic"));
    } finally {
      setTopicDeletingId(null);
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
            value={companyForm.name}
            onChange={(e) => setCompanyForm((f) => ({ ...f, name: e.target.value }))}
          />
          <select
            className="bg-gray-900 p-3 rounded-lg"
            value={companyForm.industry || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setCompanyForm((f) => ({ ...f, industry: e.target.value }))
            }
          >
            {/* Ensure current value shows even if not in the list */}
            {companyForm.industry && !["Technology", "Education", "Health"].includes(companyForm.industry) && (
              <option value={companyForm.industry}>{companyForm.industry}</option>
            )}
            <option>Technology</option>
            <option>Education</option>
            <option>Health</option>
          </select>
          <textarea
            className="col-span-1 md:col-span-2 bg-gray-900 p-3 rounded-lg"
            placeholder="What does your company do?"
            value={companyForm.description}
            onChange={(e) => setCompanyForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300 ml-1">AI Greeting</label>
            <input
              className="bg-gray-900 p-3 rounded-lg"
              placeholder="e.g. Assalamu Alaikum"
              value={companyForm.greeting}
              onChange={(e) => setCompanyForm((f) => ({ ...f, greeting: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300 ml-1">Concurrent Booking Limit</label>
            <input
              type="number"
              min={1}
              className="bg-gray-900 p-3 rounded-lg"
              placeholder="1"
              value={companyForm.concurrent_booking_limit}
              onChange={(e) => setCompanyForm((f) => ({ ...f, concurrent_booking_limit: Number(e.target.value) }))}
            />
          </div>
        </div>



        {/* Location */}
        <div>
          <h3 className="font-semibold mb-2">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="bg-gray-900 p-3 rounded-lg"
              placeholder="Address"
              value={companyForm.address}
              onChange={(e) => setCompanyForm((f) => ({ ...f, address: e.target.value }))}
            />
            <input
              className="bg-gray-900 p-3 rounded-lg"
              placeholder="City"
              value={companyForm.city}
              onChange={(e) => setCompanyForm((f) => ({ ...f, city: e.target.value }))}
            />
            <input
              className="bg-gray-900 p-3 rounded-lg"
              placeholder="Country"
              value={companyForm.country}
              onChange={(e) => setCompanyForm((f) => ({ ...f, country: e.target.value }))}
            />
          </div>

          {/* Website under location (as requested) */}
          <div className="mt-3">
            <h4 className="font-semibold mb-1 text-sm">Website URL</h4>
            <input
              className="bg-gray-900 p-3 rounded-lg w-full"
              placeholder="https://your-company.com"
              value={companyForm.website}
              onChange={(e) => setCompanyForm((f) => ({ ...f, website: e.target.value }))}
            />
          </div>
        </div>

        {companyError && <div className="text-sm text-red-400">{companyError}</div>}

        <button
          type="button"
          onClick={handleCompanyUpdate}
          disabled={companyLoading}
          className="mt-2 bg-blue-600 px-6 py-2 rounded-lg disabled:opacity-60"
        >
          {companyLoading ? "Updating..." : "Update"}
        </button>

          {/* Opening Hours list */}
        <div>
          <h3 className="font-semibold mb-2">Opening Hours</h3>

            {openingError && (
              <div className="mb-3 text-sm text-red-400">{openingError}</div>
            )}

          <div className="flex flex-wrap gap-3 mb-4">
            {openingSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-gray-900 px-4 py-3 rounded-xl flex items-center gap-3"
              >
                <div>
                  <div className="font-semibold">
                    {DAY_LABEL[slot.day as DayCode] ?? slot.day}
                  </div>
                  <div className="text-sm text-gray-300">
                    {slot.start} – {slot.end}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => handleOpeningEdit(slot)}
                      disabled={openingLoading}
                    className="text-xs bg-blue-600 px-3 py-1 rounded-lg"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpeningDelete(slot.id)}
                      disabled={openingLoading}
                    className="text-xs bg-red-600 px-3 py-1 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

              {!openingLoading && openingSlots.length === 0 && (
              <p className="text-sm text-gray-400">
                No opening hours added yet.
              </p>
            )}

              {openingLoading && (
                <p className="text-sm text-gray-400">Loading...</p>
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
              {DAY_OPTIONS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.label}
                </option>
              ))}
            </select>
            <input
              type="time"
              className="bg-gray-900 p-2 rounded-lg w-36"
              value={openingForm.start}
              onChange={(e) =>
                setOpeningForm((f) => ({ ...f, start: e.target.value }))
              }
              placeholder="Start"
            />
            <span>to</span>
            <input
              type="time"
              className="bg-gray-900 p-2 rounded-lg w-36"
              value={openingForm.end}
              onChange={(e) =>
                setOpeningForm((f) => ({ ...f, end: e.target.value }))
              }
              placeholder="End"
            />
            <button
              type="submit"
              disabled={openingLoading}
              className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              {openingLoading
                ? "Saving..."
                : openingForm.id === null
                ? "Add Slot"
                : "Save Changes"}
            </button>
          </form>
        </div>
      </section>

      {/* Prices & Services */}
      <section className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold">Prices & Services (Optional)</h2>

        {servicesError ? (
          <p className="text-sm text-red-400">{servicesError}</p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-900">
                <th className="py-2">Service Name</th>
                <th className="py-2">Description</th>
                <th className="py-2">Price</th>
                <th className="py-2">Start Time</th>
                <th className="py-2">End Time</th>
                <th className="py-2">Duration (min)</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {servicesLoading && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 text-center text-gray-400 text-sm"
                  >
                    Loading services...
                  </td>
                </tr>
              )}

              {services.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-gray-900 text-sm"
                >
                  <td className="py-2">{service.name}</td>
                  <td className="py-2">{service.description || "—"}</td>
                  <td className="py-2">${service.price}</td>
                  <td className="py-2">{service.start_time}</td>
                  <td className="py-2">{service.end_time}</td>
                  <td className="py-2">
                    {typeof service.duration === "number" ? service.duration : "—"}
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleServiceEdit(service)}
                        disabled={servicesLoading}
                        className="text-xs bg-blue-600 px-3 py-1 rounded-lg"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => handleServiceDelete(service.id)}
                        disabled={servicesLoading}
                        className="text-xs bg-red-600 px-3 py-1 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!servicesLoading && services.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
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
          className="grid grid-cols-1 md:grid-cols-7 gap-3 pt-3"
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
            placeholder="Description"
            value={serviceForm.description}
            onChange={(e) =>
              setServiceForm((f) => ({ ...f, description: e.target.value }))
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
            placeholder="Start Time (e.g., 11:00 am)"
            value={serviceForm.start_time}
            onChange={(e) =>
              setServiceForm((f) => ({ ...f, start_time: e.target.value }))
            }
          />
          <input
            className="bg-gray-900 p-2 rounded-lg"
            placeholder="End Time (e.g., 6:00 pm)"
            value={serviceForm.end_time}
            onChange={(e) =>
              setServiceForm((f) => ({ ...f, end_time: e.target.value }))
            }
          />
          <input
            type="number"
            min={0}
            className="bg-gray-900 p-2 rounded-lg"
            placeholder="Duration (min)"
            value={serviceForm.duration}
            onChange={(e) =>
              setServiceForm((f) => ({
                ...f,
                duration: e.target.value,
              }))
            }
          />
          <button
            type="submit"
            disabled={servicesLoading}
            className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            {servicesLoading
              ? "Saving..."
              : serviceForm.id === null
              ? "+ Add"
              : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Tone & Training */}
      <section className="bg-[#272727] rounded-2xl p-6 shadow-lg grid md:grid-cols-2 gap-6">
        {/* Tone */}
        <div>
          <h3 className="font-semibold mb-2">Tone & Personality</h3>
          <p className="text-sm text-gray-300">
            Choose how the AI speaks for your brand.
          </p>
          <select
            className="bg-gray-900 p-3 rounded-lg w-full mt-3"
            value={tonePreset}
            onChange={(e) => handleTonePresetChange(e.target.value)}
            disabled={toneSaving || companyLoading}
          >


            {/* '',
  '',
  '',
  '',
  '', */}
            <option value="Formal">Formal</option>
            <option value="standard">Standard</option>
            <option value="friendly">Friendly</option>
            <option value="polite">Polite</option>
            <option value="Humorous">Humorous</option>
          </select>
        </div>

        {/* Train AI */}
        <div>
          <h3 className="font-semibold mb-2">Train AI</h3>
          <p className="text-sm text-gray-300">
            Upload files to train your assistant.
          </p>

          <div
            onClick={handleFileClick}
            onDragOver={handleDragOverFiles}
            onDrop={handleDropFiles}
            className="mt-3 border-2 border-dashed border-gray-900 rounded-xl p-6 cursor-pointer hover:bg-gray-900/40"
          >
            <div className="text-center">
              <p className="font-medium">Drag files here, or click to browse</p>
              <p className="text-gray-400 text-sm mt-2">
                Supports PDF, DOCX, CSV (max 10MB each)
              </p>
              {trainingUploading && (
                <p className="text-gray-400 text-sm mt-2">Uploading...</p>
              )}
              {trainingError && (
                <p className="text-red-400 text-sm mt-2">{trainingError}</p>
              )}
            </div>
          </div>

          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFilesSelected}
            accept=".pdf,.doc,.docx,.csv"
            className="hidden"
          />

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-200">Uploaded files</p>
              <p className="text-xs text-gray-400">{trainingFiles.length}</p>
            </div>

            {trainingFilesError && (
              <p className="text-sm text-red-400 mt-2">{trainingFilesError}</p>
            )}

            <div className="mt-3 rounded-xl bg-gray-900">
              {trainingFilesLoading ? (
                <p className="text-sm text-gray-400 p-4">Loading...</p>
              ) : trainingFiles.length === 0 ? (
                <p className="text-sm text-gray-400 p-4">No files uploaded yet.</p>
              ) : (
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-gray-900">
                      <tr className="text-gray-400 border-b border-gray-800">
                        <th className="py-2 px-3">File</th>
                        <th className="py-2 px-3 whitespace-nowrap">Uploaded</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainingFiles.map((tf) => (
                        <tr key={tf.id} className="border-b border-gray-800">
                          <td className="py-2 px-3">
                            <p className="text-gray-200 truncate" title={tf.file}>
                              {filenameFromPath(tf.file)}
                            </p>
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-gray-400">
                            {tf.uploaded_at
                              ? new Date(tf.uploaded_at).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                disabled={trainingFileDeletingId === tf.id}
                                onClick={() => handleDeleteTrainingFile(tf.id)}
                                className="text-xs bg-red-600 px-3 py-1 rounded-lg"
                              >
                                {trainingFileDeletingId === tf.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge Base */}
      <section id="knowledge-base" className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold mb-2">AI Assistant Knowledge Base</h3>
          <button
            className="bg-blue-600 px-4 py-2 rounded-lg"
            onClick={openNewTopicModal}
            disabled={topicsLoading}
          >
            + Add New Topic
          </button>
        </div>

        {topicsError && (
          <p className="text-sm text-red-400">{topicsError}</p>
        )}

        <div className="space-y-3">
          {topicsLoading ? (
            <p className="text-sm text-gray-400">Loading topics...</p>
          ) : (
            topics.map((topic) => (
              <div
                key={topic.id}
                className="bg-gray-900 p-4 rounded-xl flex justify-between items-start gap-4"
              >
                <div>
                  <h4 className="font-semibold">{topic.title}</h4>
                  <p className="text-gray-400 text-sm mt-1">{topic.description}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Added:{" "}
                    {topic.createdAt
                      ? new Date(topic.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    className="bg-blue-500 px-3 py-1 rounded-lg text-xs disabled:opacity-60"
                    onClick={() => openEditTopicModal(topic)}
                    disabled={topicSaving || topicDeletingId === topic.id}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="bg-red-600 px-3 py-1 rounded-lg text-xs disabled:opacity-60"
                    onClick={() => handleTopicDelete(topic.id)}
                    disabled={topicDeletingId === topic.id}
                  >
                    {topicDeletingId === topic.id ? "Deleting..." : "🗑️ Delete"}
                  </button>
                </div>
              </div>
            ))
          )}

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
                  disabled={topicSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-semibold"
                  disabled={topicSaving}
                >
                  {topicSaving
                    ? "Saving..."
                    : kbForm.id === null
                    ? "Add Topic"
                    : "Save Changes"}
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
