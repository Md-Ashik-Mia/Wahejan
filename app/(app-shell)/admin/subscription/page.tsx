
"use client";

import { Check, Edit, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/http/client";

type SubscriptionPlan = {
  id: number;
  name: string;
  duration: string;
  price: string | number;
  msg_limit: number;
  user_limit: number;
  token_limit: number;
  custom: boolean;
};

type UserPlanRequest = {
  id: number;
  user: {
    id: number;
    name: string | null;
    role: string;
    email: string;
    company_name: string | null;
    is_active: boolean;
  };
  email: string;
  msg_limit: number;
  user_limit: number;
  token_limit: number;
};

type PlanDraft = {
  name: string;
  duration: string;
  price: string;
  msg_limit: string;
  user_limit: string;
  token_limit: string;
};

function getErrorDetail(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;
  const response = (error as Record<string, unknown>)?.response;
  if (!response || typeof response !== "object") return fallback;
  const data = (response as Record<string, unknown>)?.data;
  if (!data || typeof data !== "object") return fallback;
  const detail = (data as Record<string, unknown>)?.detail;
  return typeof detail === "string" && detail.trim().length > 0 ? detail : fallback;
}

async function requestWithCandidates<T>(
  fn: (endpoint: string) => Promise<T>,
  candidates: string[]
): Promise<T> {
  let lastError: unknown = null;
  for (const endpoint of candidates) {
    try {
      return await fn(endpoint);
    } catch (err: unknown) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("Request failed");
}

// Some environments set NEXT_PUBLIC_API_BASE_URL with trailing `/api`.
// In that case endpoints must NOT start with `/api`, otherwise we hit `/api/api/...`.
const ADMIN_ENDPOINTS = {
  plans: ["/admin/subscription-plan/", "/api/admin/subscription-plan/"],
  planById: (id: number) => [`/admin/subscription-plan/${id}/`, `/api/admin/subscription-plan/${id}/`],
  requests: ["/admin/user-plan-requests/", "/api/admin/user-plan-requests/"],
  approve: ["/admin/approve-user-plan/", "/api/admin/approve-user-plan/"],
  reject: ["/admin/reject-user-plan/", "/api/admin/reject-user-plan/"],
} as const;

function normalizePrice(value: string | number): number {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined).format(value);
}

function planToDraft(plan: SubscriptionPlan): PlanDraft {
  return {
    name: plan.name ?? "",
    duration: plan.duration ?? "",
    price: String(plan.price ?? ""),
    msg_limit: String(plan.msg_limit ?? ""),
    user_limit: String(plan.user_limit ?? ""),
    token_limit: String(plan.token_limit ?? ""),
  };
}

export default function SubscriptionPage() {
  const [view, setView] = useState<"plans" | "requests">("plans");

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [draft, setDraft] = useState<PlanDraft | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);

  const [requests, setRequests] = useState<UserPlanRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [requestActionId, setRequestActionId] = useState<number | null>(null);
  const [requestPrices, setRequestPrices] = useState<Record<number, string>>({});

  const fetchPlans = useCallback(async () => {
    try {
      setPlansError(null);
      setPlansLoading(true);
      const { data } = await requestWithCandidates(
        (endpoint) => adminApi.get<SubscriptionPlan[]>(endpoint),
        [...ADMIN_ENDPOINTS.plans]
      );
      setPlans(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        setPlansError(getErrorDetail(err, "Failed to load plans"));
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setRequestsError(null);
      setRequestsLoading(true);
      const { data } = await requestWithCandidates(
        (endpoint) => adminApi.get<UserPlanRequest[]>(endpoint),
        [...ADMIN_ENDPOINTS.requests]
      );
      setRequests(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        setRequestsError(getErrorDetail(err, "Failed to load requests"));
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const headerTitle = view === "plans" ? "Subscription Management" : "Subscription Requests";

  const openEdit = useCallback((plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setDraft(planToDraft(plan));
  }, []);

  const closeEdit = useCallback(() => {
    setEditingPlan(null);
    setDraft(null);
  }, []);

  const submitEdit = useCallback(async () => {
    if (!editingPlan || !draft) return;

    const payload = {
      name: draft.name.trim(),
      duration: draft.duration.trim(),
      price: draft.price.trim(),
      msg_limit: Number(draft.msg_limit),
      user_limit: Number(draft.user_limit),
      token_limit: Number(draft.token_limit),
    };

    if (!payload.name) return alert("Plan name is required");
    if (!payload.duration) return alert("Duration is required");
    if (!payload.price) return alert("Price is required");
    if (!Number.isFinite(payload.msg_limit)) return alert("Message limit must be a number");
    if (!Number.isFinite(payload.user_limit)) return alert("User limit must be a number");
    if (!Number.isFinite(payload.token_limit)) return alert("Token limit must be a number");

    try {
      setSavingPlan(true);
      await requestWithCandidates(
        (endpoint) => adminApi.patch(endpoint, payload),
        ADMIN_ENDPOINTS.planById(editingPlan.id)
      );
      closeEdit();
      await fetchPlans();
    } catch (err: unknown) {
      alert(getErrorDetail(err, "Failed to update plan"));
    } finally {
      setSavingPlan(false);
    }
  }, [closeEdit, draft, editingPlan, fetchPlans]);

  const approveRequest = useCallback(
    async (requestId: number, priceRaw: string) => {
      const price = Number.parseFloat(String(priceRaw).trim());
      if (!Number.isFinite(price)) {
        alert("Price is required to approve and must be a number");
        return;
      }

      try {
        setRequestActionId(requestId);
        await requestWithCandidates(
          (endpoint) =>
            adminApi.post(endpoint, {
              id: requestId,
              price,
            }),
          [...ADMIN_ENDPOINTS.approve]
        );
        await fetchRequests();
      } catch (err: unknown) {
        alert(getErrorDetail(err, "Failed to approve request"));
      } finally {
        setRequestActionId(null);
      }
    },
    [fetchRequests]
  );

  const plansContent = useMemo(() => {
    if (plansLoading) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading plans…
        </div>
      );
    }

    if (plansError) {
      return (
        <div className="text-sm text-destructive">
          {plansError}{" "}
          <button className="underline" onClick={fetchPlans}>
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => {
          const price = normalizePrice(plan.price);
          return (
            <div
              key={plan.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="space-y-2">
                <div className="text-lg font-semibold tracking-wide">
                  {String(plan.name ?? "").toUpperCase()}
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-5xl font-bold text-blue-500">
                    ${price.toFixed(2)}
                  </div>
                  <div className="pb-1 text-muted-foreground">/mo</div>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>{formatNumber(plan.msg_limit)} Messages</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>{formatNumber(plan.user_limit)} Users</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>{formatNumber(plan.token_limit)} Tokens</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Standard setup</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Duration: {plan.duration}</span>
                </div>
              </div>

              <Button
                onClick={() => openEdit(plan)}
                className="mt-6 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-500"
              >
                <Edit className="h-4 w-4" /> Edit Plan
              </Button>
            </div>
          );
        })}
      </div>
    );
  }, [fetchPlans, openEdit, plans, plansError, plansLoading]);

  const requestsContent = useMemo(() => {
    if (requestsLoading) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading requests…
        </div>
      );
    }

    if (requestsError) {
      return (
        <div className="text-sm text-destructive">
          {requestsError}{" "}
          <button className="underline" onClick={fetchRequests}>
            Retry
          </button>
        </div>
      );
    }

    if (requests.length === 0) {
      return <div className="text-sm text-muted-foreground">No requests.</div>;
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        {requests.map((req) => {
          const busy = requestActionId === req.id;
          const priceValue = requestPrices[req.id] ?? "";

          return (
            <div
              key={req.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="text-xl font-semibold">
                {req.user?.name ?? "(No name)"}
              </div>
              <div className="text-sm text-muted-foreground">{req.email}</div>
              {req.user?.company_name ? (
                <div className="mt-2 text-sm font-medium text-blue-500">
                  {req.user.company_name}
                </div>
              ) : null}

              <div className="mt-5 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs tracking-wide text-muted-foreground">MESSAGE LIMIT</div>
                  <div className="mt-1 text-lg font-semibold">{formatNumber(req.msg_limit)}</div>
                </div>
                <div>
                  <div className="text-xs tracking-wide text-muted-foreground">USER LIMIT</div>
                  <div className="mt-1 text-lg font-semibold">{formatNumber(req.user_limit)}</div>
                </div>
                <div>
                  <div className="text-xs tracking-wide text-muted-foreground">TOKEN LIMIT</div>
                  <div className="mt-1 text-lg font-semibold">{formatNumber(req.token_limit)}</div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="text-xs tracking-wide text-muted-foreground">PRICE</div>
                <Input
                  value={priceValue}
                  onChange={(e) =>
                    setRequestPrices((prev) => ({
                      ...prev,
                      [req.id]: e.target.value,
                    }))
                  }
                  placeholder="12345.23"
                  inputMode="decimal"
                />
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  disabled={busy}
                  onClick={() => approveRequest(req.id, priceValue)}
                  className="h-11 w-40 rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Approve
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [approveRequest, fetchRequests, requestActionId, requestPrices, requests, requestsError, requestsLoading]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between gap-4">
          <div className="text-2xl font-semibold tracking-tight">
            {headerTitle}
          </div>

          {view === "plans" ? (
            <Button
              onClick={async () => {
                setView("requests");
                await fetchRequests();
              }}
              className="rounded-full bg-blue-600 text-white hover:bg-blue-500"
            >
              Review Requests
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setView("plans")}
              className="rounded-full"
            >
              Back to Plans
            </Button>
          )}
        </div>

        <div className="mt-8">
          {view === "plans" ? plansContent : requestsContent}
        </div>
      </div>

      {editingPlan && draft ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeEdit}
            aria-hidden
          />
            <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl rounded-t-3xl border border-border bg-card p-6 shadow-lg text-foreground">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-semibold">Update Subscription Plan</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Edit plan details and save changes
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={closeEdit}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="essential"
                />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  placeholder="99.00"
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-2">
                <Label>Message Limit</Label>
                <Input
                  value={draft.msg_limit}
                  onChange={(e) => setDraft({ ...draft, msg_limit: e.target.value })}
                  placeholder="500"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <Label>User Limit</Label>
                <Input
                  value={draft.user_limit}
                  onChange={(e) => setDraft({ ...draft, user_limit: e.target.value })}
                  placeholder="3"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <Label>Token Limit</Label>
                <Input
                  value={draft.token_limit}
                  onChange={(e) => setDraft({ ...draft, token_limit: e.target.value })}
                  placeholder="25000000"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  value={draft.duration}
                  onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                  placeholder="months"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={closeEdit} disabled={savingPlan}>
                Cancel
              </Button>
              <Button
                onClick={submitEdit}
                disabled={savingPlan}
                className="bg-blue-600 text-white hover:bg-blue-500"
              >
                {savingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

