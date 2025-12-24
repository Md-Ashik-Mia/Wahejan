"use client";
import { userapi } from "@/lib/http/client";
import axios, { type AxiosResponse } from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];

  const candidates = [payload.results, payload.data, payload.list];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
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

type SupportTicket = {
  id: number;
  user: string;
  ticket_id: string;
  time_since_created: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function normalizeTicket(raw: unknown): SupportTicket {
  const r: UnknownRecord = isRecord(raw) ? raw : {};
  return {
    id: typeof r.id === "number" ? r.id : 0,
    user: typeof r.user === "string" ? r.user : "",
    ticket_id: typeof r.ticket_id === "string" ? r.ticket_id : "",
    time_since_created: typeof r.time_since_created === "string" ? r.time_since_created : "",
    subject: typeof r.subject === "string" ? r.subject : "",
    description: typeof r.description === "string" ? r.description : "",
    status: typeof r.status === "string" ? r.status : "",
    created_at: typeof r.created_at === "string" ? r.created_at : "",
    updated_at: typeof r.updated_at === "string" ? r.updated_at : "",
  };
}

function formatWhen(value: string, fallback = "—"): string {
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return value || fallback;
  return new Date(t).toLocaleString();
}

const SupportPage: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [issue, setIssue] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  const ticketEndpoints = useMemo(
    () => [
      // baseURL ends with `/api`
      "/tickets/",
      "/tickets",
      // baseURL does NOT end with `/api`
      "/api/tickets/",
      "/api/tickets",
    ],
    []
  );

  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    setTicketsError(null);

    let lastError: unknown = null;

    try {
      let res: AxiosResponse<unknown> | null = null;
      for (const endpoint of ticketEndpoints) {
        try {
          res = await userapi.get(endpoint);
          break;
        } catch (e: unknown) {
          lastError = e;
          if (axios.isAxiosError(e) && e.response && e.response.status !== 404) {
            if (e.response.status === 401) throw e;
          }
        }
      }

      if (!res) throw lastError ?? new Error("Failed to load tickets");

      const list = extractList(res.data)
        .map(normalizeTicket)
        .filter((t) => Boolean(t.id) || Boolean(t.ticket_id));

      list.sort((a, b) => {
        const at = a.created_at ? Date.parse(a.created_at) : 0;
        const bt = b.created_at ? Date.parse(b.created_at) : 0;
        return bt - at;
      });

      setTickets(list);
    } catch (e: unknown) {
      setTicketsError(getErrorMessage(e, "Failed to load tickets"));
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  }, [ticketEndpoints]);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  const handleSubmit = async () => {
    if (!subject.trim()) return alert("Please enter a subject.");
    if (!issue.trim()) return alert("Please describe your issue.");

    try {
      setStatus("loading");

      // Try to create a ticket (endpoint differs depending on baseURL).
      let lastError: unknown = null;
      let created = false;

      for (const endpoint of ticketEndpoints) {
        try {
          await userapi.post(endpoint, {
            subject: subject.trim(),
            description: issue.trim(),
          });
          created = true;
          break;
        } catch (e: unknown) {
          lastError = e;
          if (axios.isAxiosError(e) && e.response && e.response.status === 401) {
            throw e;
          }
        }
      }

      if (!created) throw lastError ?? new Error("Failed to create ticket");

      setStatus("success");
      setSubject("");
      setIssue("");
      void fetchTickets();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-black  text-white p-6">
      {/* Page Title */}
      <h1 className="text-xl font-semibold mb-6">Support</h1>

      {/* Support Box (Top Middle Alignment) */}
      <div className="max-w-8xl mx-auto bg-[#272727]  p-6 rounded-xl shadow-lg space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Support</h2>
          <p className="text-gray-400 text-sm">Start a chat or create a ticket</p>
        </div>

        {/* Input and Button */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Describe the issue"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="flex-1 bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                status === "loading"
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {status === "loading" ? "Sending..." : "Send"}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {status === "success" && (
          <p className="text-green-400 text-sm mt-1">
            Ticket sent successfully! Our support team will reach out soon.
          </p>
        )}
        {status === "error" && (
          <p className="text-red-400 text-sm mt-1">
            Something went wrong. Please try again.
          </p>
        )}
      </div>

      {/* Tickets List */}
      <div className="max-w-8xl mx-auto mt-6 bg-[#272727] p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Tickets</h2>
          <button
            type="button"
            onClick={() => void fetchTickets()}
            className="bg-blue-600 px-4 py-2 rounded-lg disabled:opacity-60"
            disabled={ticketsLoading}
          >
            {ticketsLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {ticketsError ? (
          <p className="text-sm text-red-400">{ticketsError}</p>
        ) : ticketsLoading ? (
          <p className="text-sm text-gray-400">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-gray-400">No tickets found.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id || t.ticket_id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{t.ticket_id || "Support Ticket"}</p>
                    <p className="text-gray-300 text-sm mt-1 truncate">
                      Subject: {t.subject || "—"}
                    </p>
                    {t.description ? (
                      <p className="text-gray-200 text-sm mt-1">{t.description}</p>
                    ) : null}
                    <p className="text-gray-400 text-xs mt-2">
                      {t.time_since_created ? `${t.time_since_created} • ` : ""}
                      Created: {formatWhen(t.created_at)}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <span className="text-xs px-3 py-1 rounded-full bg-[#272727] text-gray-200">
                      {t.status || "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;

