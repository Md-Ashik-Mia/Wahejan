"use client";
import { userapi } from "@/lib/http/client";
import axios from "axios";
import { useSession } from "next-auth/react";
import React, {
    FormEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CompanyAndHoursSection from "./components/CompanyAndHoursSection";
import KnowledgeBaseSection from "./components/KnowledgeBaseSection";
import ServicesSection from "./components/ServicesSection";
import ToneTrainingSection from "./components/ToneTrainingSection";

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
      if (Array.isArray(firstValue) && typeof firstValue[0] === "string")
        return firstValue[0];

      try {
        const text = JSON.stringify(data);
        if (text && text !== "{}") return text;
      } catch {
        // ignore
      }
    }

    if (typeof error.message === "string" && error.message.trim())
      return error.message;
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
  endpoint: string,
): Promise<T> {
  try {
    return await fn(endpoint);
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      const alt = endpoint.endsWith("/")
        ? endpoint.slice(0, -1)
        : withTrailingSlash(endpoint);
      return await fn(alt);
    }
    throw e;
  }
}

function buildOpeningHourCreatePayload(form: {
  day: string;
  start: string;
  end: string;
}) {
  // Matches Postman CREATE: { days: ['fri'], start: '09:00', end: '18:00' }
  const dayCode = toDayCode(form.day);
  return {
    days: dayCode ? [dayCode] : [],
    start: normalizeTimeHHmm(form.start),
    end: normalizeTimeHHmm(form.end),
  };
}

function buildOpeningHourUpdatePayload(form: {
  day: string;
  start: string;
  end: string;
}) {
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
  const price =
    typeof r.price === "string"
      ? r.price
      : r.price != null
        ? String(r.price)
        : "";
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
  const { data: session } = useSession();
  const permission = session?.user?.permissions?.[0]?.toLowerCase();
  const blockedRoles = ["support", "analyst", "read_only"];
  const isBlocked = Boolean(permission && blockedRoles.includes(permission));

  const managementBlockedRoles = ["finance", "analyst", "read_only"];
  const isManagementBlocked = Boolean(
    permission && managementBlockedRoles.includes(permission),
  );

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
      const res = await requestWithSlashFallback(
        (ep) => userapi.get(ep),
        COMPANY_ENDPOINT,
      );
      const normalized = normalizeCompany(res?.data);
      setCompany(normalized);

      if (!toneInitializedRef.current) {
        setToneInput(normalized.tone ?? "standard");
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
        concurrent_booking_limit:
          Number(companyForm.concurrent_booking_limit) || 1,
      };

      const res = await requestWithSlashFallback(
        (ep) => userapi.patch(ep, payload),
        COMPANY_ENDPOINT,
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
      toast.success("Company details updated");
    } catch (e: unknown) {
      const message = getApiErrorMessage(e, "Failed to update company details");
      setCompanyError(message);
      toast.error(message);
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
        OPENING_HOURS_ENDPOINT,
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
      const isUpdate = openingForm.id !== null;
      if (openingForm.id === null) {
        // create
        await requestWithSlashFallback(
          (ep) => userapi.post(ep, buildOpeningHourCreatePayload(openingForm)),
          OPENING_HOURS_ENDPOINT,
        );
      } else {
        // update: backend uses detail route `/opening-hours/{id}/`
        const detail = openingHourDetailEndpoint(openingForm.id);
        await requestWithSlashFallback(
          (ep) => patchOrPut(ep, buildOpeningHourUpdatePayload(openingForm)),
          detail,
        );
      }

      setOpeningForm({
        id: null,
        day: "mon",
        start: "09:00",
        end: "17:00",
      });
      await fetchOpeningHours();
      toast.success(isUpdate ? "Opening hour updated" : "Opening hour added");
    } catch (e: unknown) {
      const message = getApiErrorMessage(e, "Failed to save opening hour");
      setOpeningError(message);
      toast.error(message);
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
      toast.success("Opening hour deleted");
    } catch (e: unknown) {
      const message = getApiErrorMessage(e, "Failed to delete opening hour");
      setOpeningError(message);
      toast.error(message);
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
      const res = await requestWithSlashFallback(
        (ep) => userapi.get(ep),
        SERVICE_ENDPOINT,
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
      setServices(
        list.map(normalizeService).filter((s: Service) => s.id && s.name),
      );
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
      const message = "Price must be a valid number";
      setServicesError(message);
      toast.error(message);
      return;
    }

    setServicesLoading(true);
    setServicesError(null);

    try {
      const isUpdate = serviceForm.id !== null;
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
          SERVICE_ENDPOINT,
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
              ...(serviceForm.start_time
                ? { start_time: normalizeTimeHHmmss(serviceForm.start_time) }
                : {}),
              ...(serviceForm.end_time
                ? { end_time: normalizeTimeHHmmss(serviceForm.end_time) }
                : {}),
            }),
          detail,
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
      toast.success(isUpdate ? "Service updated" : "Service added");
    } catch (e: unknown) {
      const message = getApiErrorMessage(e, "Failed to save service");
      setServicesError(message);
      toast.error(message);
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
      duration:
        typeof service.duration === "number" ? String(service.duration) : "",
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
      toast.success("Service deleted");
    } catch (e: unknown) {
      const message = getApiErrorMessage(e, "Failed to delete service");
      setServicesError(message);
      toast.error(message);
    } finally {
      setServicesLoading(false);
    }
  };

  /* ─────────────────────────────────────
     Tone & personality
  ───────────────────────────────────── */
  const [toneInput, setToneInput] = useState<string>("standard");
  const [toneSaving, setToneSaving] = useState(false);

  const handleToneSave = async () => {
    const nextTone = toneInput.trim();
    if (!nextTone) {
      setCompanyError("Tone cannot be empty");
      toast.error("Tone cannot be empty");
      return;
    }
    setToneSaving(true);
    setCompanyError(null);

    try {
      const res = await requestWithSlashFallback(
        (ep) => userapi.patch(ep, { tone: nextTone }),
        COMPANY_ENDPOINT,
      );
      const normalized = normalizeCompany(res?.data);
      setCompany(normalized);
      setToneInput(normalized.tone ?? nextTone);
      toast.success("Tone updated");
    } catch (e: unknown) {
      setCompanyError(getApiErrorMessage(e, "Failed to update tone"));
      toast.error(getApiErrorMessage(e, "Failed to update tone"));
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
  const [trainingFilesError, setTrainingFilesError] = useState<string | null>(
    null,
  );
  const [trainingFileDeletingId, setTrainingFileDeletingId] = useState<
    number | null
  >(null);

  const fetchTrainingFiles = useCallback(async () => {
    setTrainingFilesLoading(true);
    setTrainingFilesError(null);
    try {
      const res = await requestWithSlashFallback(
        (ep) => userapi.get(ep),
        AI_TRAINING_FILES_ENDPOINT,
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
      setTrainingFilesError(
        getApiErrorMessage(e, "Failed to load training files"),
      );
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
        AI_TRAINING_FILES_ENDPOINT,
      );

      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchTrainingFiles();
      toast.success("Files uploaded successfully");
    } catch (e: unknown) {
      const message = getApiErrorMessage(e, "Failed to upload training files");
      setTrainingError(message);
      toast.error(message);
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
        AI_TRAINING_FILES_ENDPOINT,
      );
      await fetchTrainingFiles();
      toast.success("File deleted");
    } catch (e: unknown) {
      const message = getApiErrorMessage(e, "Failed to delete training file");
      setTrainingFilesError(message);
      toast.error(message);
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
    const list = Array.from(e.dataTransfer.files ?? []).filter(
      (f) => f.size > 0,
    );
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
        KNOWLEDGE_BASE_ENDPOINT,
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
      const isUpdate = kbForm.id !== null;
      if (kbForm.id === null) {
        await requestWithSlashFallback(
          (ep) =>
            userapi.post(ep, {
              name: kbForm.title,
              details: kbForm.description,
            }),
          KNOWLEDGE_BASE_ENDPOINT,
        );
      } else {
        const detail = knowledgeBaseDetailEndpoint(kbForm.id);
        await requestWithSlashFallback(
          (ep) =>
            userapi.patch(ep, {
              name: kbForm.title,
              details: kbForm.description,
            }),
          detail,
        );
      }

      setIsKbModalOpen(false);
      setKbForm({ id: null, title: "", description: "" });
      await fetchTopics();
      toast.success(isUpdate ? "Topic updated" : "Topic added");
    } catch (e: unknown) {
      const message = getApiErrorMessage(e, "Failed to save topic");
      setTopicsError(message);
      toast.error(message);
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
      toast.success("Topic deleted");
    } catch (e: unknown) {
      const message = getApiErrorMessage(e, "Failed to delete topic");
      setTopicsError(message);
      toast.error(message);
    } finally {
      setTopicDeletingId(null);
    }
  };

  /* ───────────────────────────────────── */

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />

      <CompanyAndHoursSection
        isBlocked={isBlocked}
        companyForm={companyForm}
        setCompanyForm={setCompanyForm}
        companyError={companyError}
        companyLoading={companyLoading}
        handleCompanyUpdate={handleCompanyUpdate}
        openingSlots={openingSlots}
        openingLoading={openingLoading}
        openingError={openingError}
        openingForm={openingForm}
        setOpeningForm={setOpeningForm}
        handleOpeningSubmit={handleOpeningSubmit}
        handleOpeningEdit={handleOpeningEdit}
        handleOpeningDelete={handleOpeningDelete}
        dayOptions={DAY_OPTIONS}
        dayLabel={DAY_LABEL as Record<string, string>}
      />

      <ServicesSection
        isBlocked={isBlocked}
        servicesError={servicesError}
        servicesLoading={servicesLoading}
        services={services}
        serviceForm={serviceForm}
        setServiceForm={setServiceForm}
        handleServiceSubmit={handleServiceSubmit}
        handleServiceEdit={handleServiceEdit}
        handleServiceDelete={handleServiceDelete}
      />

      <ToneTrainingSection
        isManagementBlocked={isManagementBlocked}
        toneInput={toneInput}
        setToneInput={setToneInput}
        toneSaving={toneSaving}
        companyLoading={companyLoading}
        handleToneSave={handleToneSave}
        handleFileClick={handleFileClick}
        handleDragOverFiles={handleDragOverFiles}
        handleDropFiles={handleDropFiles}
        trainingUploading={trainingUploading}
        trainingError={trainingError}
        fileInputRef={fileInputRef}
        handleFilesSelected={handleFilesSelected}
        trainingFiles={trainingFiles}
        trainingFilesLoading={trainingFilesLoading}
        trainingFilesError={trainingFilesError}
        trainingFileDeletingId={trainingFileDeletingId}
        handleDeleteTrainingFile={handleDeleteTrainingFile}
        filenameFromPath={filenameFromPath}
      />

      <KnowledgeBaseSection
        isManagementBlocked={isManagementBlocked}
        topicsLoading={topicsLoading}
        topicsError={topicsError}
        topics={topics}
        topicSaving={topicSaving}
        topicDeletingId={topicDeletingId}
        openNewTopicModal={openNewTopicModal}
        openEditTopicModal={openEditTopicModal}
        handleTopicDelete={handleTopicDelete}
        isKbModalOpen={isKbModalOpen}
        setIsKbModalOpen={setIsKbModalOpen}
        kbForm={kbForm}
        setKbForm={setKbForm}
        handleKbSubmit={handleKbSubmit}
      />
    </div>
  );
};

export default AIAssistantDashboard;
