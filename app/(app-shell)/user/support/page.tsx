"use client";
import { userapi } from "@/lib/http/client";
import axios, { type AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    if (
      isRecord(data) &&
      typeof data.detail === "string" &&
      data.detail.trim()
    ) {
      return data.detail;
    }
    if (typeof error.message === "string" && error.message.trim())
      return error.message;
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
    time_since_created:
      typeof r.time_since_created === "string" ? r.time_since_created : "",
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
  const { data: session, status: sessionStatus } = useSession();
  const [issue, setIssue] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

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
    [],
  );

  const permission = session?.user?.permissions?.[0]?.toLowerCase();
  const blockedRoles = ["owner", "finance", "read_only", "analyst"];
  const isBlocked = Boolean(permission && blockedRoles.includes(permission));

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
          if (
            axios.isAxiosError(e) &&
            e.response &&
            e.response.status !== 404
          ) {
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
    if (sessionStatus === "loading" || isBlocked) return;
    void fetchTickets();
  }, [fetchTickets, isBlocked, sessionStatus]);

  if (sessionStatus === "loading") {
    return <p className="text-white">Loading...</p>;
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-6">
        <div className="max-w-md w-full bg-[#1f1f1f]/80 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-500/20">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 5.636L5.636 18.364M5.636 5.636l12.728 12.728"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-white mb-2">
            Access Restricted
          </h1>

          <p className="text-gray-400 mb-6">
            You don’t have permission to view this page. Please contact your
            administrator if you believe this is a mistake.
          </p>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 hover:bg-blue-700 transition px-5 py-3 rounded-lg font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!issue.trim()) {
      toast.error("Please describe your issue.");
      return;
    }

    try {
      setStatus("loading");

      // Try to create a ticket (endpoint differs depending on baseURL).
      let lastError: unknown = null;
      let created = false;

      for (const endpoint of ticketEndpoints) {
        try {
          await userapi.post(endpoint, {
            description: issue.trim(),
          });
          created = true;
          break;
        } catch (e: unknown) {
          lastError = e;
          if (
            axios.isAxiosError(e) &&
            e.response &&
            e.response.status === 401
          ) {
            throw e;
          }
        }
      }

      if (!created) throw lastError ?? new Error("Failed to create ticket");

      setStatus("success");
      toast.success("Support request sent to admin");
      setIssue("");
      void fetchTickets();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      toast.error("Failed to send support request");
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-black  text-white p-6">
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      {/* Page Title */}
      <h1 className="text-xl font-semibold mb-6">Support</h1>

      {/* Support Box (Top Middle Alignment) */}
      <div className="max-w-8xl mx-auto bg-[#272727]  p-6 rounded-xl shadow-lg space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Support</h2>
          <p className="text-gray-400 text-sm">
            Start a chat or create a ticket
          </p>
        </div>

        {/* Input and Button */}
        <div className="space-y-3">
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
              <div
                key={t.id || t.ticket_id}
                className="bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-300 font-medium truncate">
                      {t.ticket_id || "Support Ticket"}
                    </p>
                    {t.description ? (
                      <p className="text-white text-base font-medium mt-2 leading-relaxed">
                        {t.description}
                      </p>
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
