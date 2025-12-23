"use client";

import { userapi } from "@/lib/http/client";
import axios, { type AxiosResponse } from "axios";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

type ActivityLogItem = {
  id: number;
  activity_type: string;
  title: string;
  description: string;
  icon: string;
  timestamp: string;
  model_name: string;
};

function normalizeActivityLogItem(raw: unknown): ActivityLogItem {
  const r: UnknownRecord = isRecord(raw) ? raw : {};
  return {
    id: typeof r.id === "number" ? r.id : 0,
    activity_type: typeof r.activity_type === "string" ? r.activity_type : "",
    title: typeof r.title === "string" ? r.title : "",
    description: typeof r.description === "string" ? r.description : "",
    icon: typeof r.icon === "string" ? r.icon : "",
    timestamp: typeof r.timestamp === "string" ? r.timestamp : "",
    model_name: typeof r.model_name === "string" ? r.model_name : "",
  };
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

function formatActivityTimestamp(value: string): string {
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return value || "—";
  return new Date(t).toLocaleString();
}

function activityEmoji(icon: string, activityType: string): string {
  const v = `${icon} ${activityType}`.toLowerCase();
  if (v.includes("delete") || v.includes("remove")) return "🗑️";
  if (v.includes("create") || v.includes("add") || v.includes("new")) return "➕";
  if (v.includes("edit") || v.includes("update") || v.includes("change")) return "✏️";
  return "🔹";
}

const AIKnowledgeBase: React.FC = () => {
  // Fake Data
  const knowledgeHealth = 70;
  const missingTopics = ['Service Prices', 'Refund Policy', 'Delivery Times'];
  const categories = [
    { name: 'Company Info', items: 5, icon: '🏢' },
    { name: 'Services', items: 7, icon: '🛠️' },
    { name: 'Prices', items: 12, icon: '💲' },
    { name: 'Opening Hours', items: 3, icon: '🕒' },
    { name: 'Policies', items: 2, icon: '📜' },
    { name: 'FAQs', items: 14, icon: '❓' }
  ];

  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  const fetchActivityLogs = useCallback(async () => {
    setActivityLoading(true);
    setActivityError(null);

    const candidates = ["/api/log/", "/api/log", "/log/", "/log"]; // supports backend variations
    let lastError: unknown = null;

    try {
      let res: AxiosResponse<unknown> | null = null;

      for (const endpoint of candidates) {
        try {
          res = await userapi.get(endpoint);
          break;
        } catch (e: unknown) {
          lastError = e;
          // If it's not a 404, don't keep trying alternate paths.
          if (axios.isAxiosError(e) && e.response && e.response.status !== 404) {
            throw e;
          }
        }
      }

      if (!res) {
        throw lastError ?? new Error("Failed to load activity logs");
      }

      const payload = res.data;
      const list = extractList(payload);

      const normalized = list
        .map(normalizeActivityLogItem)
        .filter((l: ActivityLogItem) => Boolean(l.id) && (Boolean(l.title) || Boolean(l.description)))
        .sort((a: ActivityLogItem, b: ActivityLogItem) => {
          const at = a.timestamp ? Date.parse(a.timestamp) : 0;
          const bt = b.timestamp ? Date.parse(b.timestamp) : 0;
          return bt - at;
        });

      setActivityLogs(normalized);
    } catch (e: unknown) {
      setActivityError(getErrorMessage(e, "Failed to load activity logs"));
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchActivityLogs();
  }, [fetchActivityLogs]);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      {/* Header */}
      <h1 className="text-2xl font-bold">AI Knowledge Base</h1>

      {/* Knowledge Base Health */}
      <section className="bg-[#272727] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center shadow-lg">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
              <path
                className="text-gray-700"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500"
                strokeWidth="4"
                strokeDasharray={`${knowledgeHealth}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold">
              {knowledgeHealth}%
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Knowledge Base Health</h3>
            <p className="text-gray-400">Your AI knowledge is {knowledgeHealth}% complete. Add missing information to improve customer interactions.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {missingTopics.map((topic, idx) => (
                <span key={idx} className="bg-red-700 px-3 py-1 rounded-full text-sm">{topic}</span>
              ))}
            </div>
          </div>
        </div>
         <Link href="/user/ai-assistant#knowledge-base">
        <button className="bg-blue-600 px-4 py-2 rounded-lg mt-4 md:mt-0">+ Add Missing Info</button>
        </Link>
      </section>

      {/* Knowledge Categories */}
      <section>
        <h2 className="text-lg font-semibold bg-blue-600 px-4 py-2 rounded-t-lg">Knowledge Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-black p-4 rounded-b-lg">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-[#272727] rounded-xl p-6 flex flex-col items-center justify-center shadow-md hover:bg-gray-700 transition">
              <div className="text-4xl mb-2">{cat.icon}</div>
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="text-gray-400 text-sm">{cat.items} items</p>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Log */}
      <section>
        <h2 className="text-lg font-semibold bg-blue-600 px-4 py-2 rounded-t-lg">Activity Log</h2>
        <div className="bg-[#272727] p-6 rounded-b-lg space-y-4">
          {activityError ? (
            <p className="text-sm text-red-400">{activityError}</p>
          ) : activityLoading ? (
            <p className="text-sm text-gray-400">Loading activity...</p>
          ) : activityLogs.length === 0 ? (
            <p className="text-sm text-gray-400">No activity yet.</p>
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="border-b border-gray-700 pb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  {activityEmoji(log.icon, log.activity_type)} {log.title || log.model_name || "Activity"}
                </h4>
                {log.description ? (
                  <p className="text-gray-300 text-sm">{log.description}</p>
                ) : null}
                <p className="text-gray-500 text-xs">{formatActivityTimestamp(log.timestamp)}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Import/Export */}
      <section>
        <h2 className="text-lg font-semibold bg-blue-600 px-4 py-2 rounded-t-lg">Import/Export</h2>
        <div className="bg-[#272727] p-6 rounded-b-lg">
          <p className="text-gray-300 mb-3">Upload files to add information in bulk or export your AI knowledge for review.</p>
          <button className="bg-blue-600 px-4 py-2 rounded-lg">⬇️ Export</button>
        </div>
      </section>
    </div>
  );
};

export default AIKnowledgeBase;

