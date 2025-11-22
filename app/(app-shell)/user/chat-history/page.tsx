"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, FormEvent } from "react";

type Platform = "facebook" | "whatsapp" | "instagram" | "telegram" | "sms" | string;

interface Profile {
  platform: Platform;
  profile_id: string;
}

interface ChatMessage {
  id: string;
  platform: Platform;
  clientId: string;
  roomId: number | string;
  text: string;
  direction: "incoming" | "outgoing";
  timestamp: string;
}

interface Conversation {
  id: string; // `${platform}:${clientId}`
  platform: Platform;
  clientId: string;
  roomId: number | string;
  messages: ChatMessage[];
}

export default function ChatPage() {
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;

  const wsRef = useRef<WebSocket | null>(null);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState("");

  const selectedConversation = selectedConversationId
    ? conversations[selectedConversationId] ?? null
    : null;

  /* ─────────────────────────────
     1) WebSocket connection
  ───────────────────────────── */
  useEffect(() => {
    if (!accessToken) return;

    const ws = new WebSocket(
      `wss://ape-in-eft.ngrok-free.app/ws/chat/?token=${accessToken}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Message:", data);

        // 1) Connection established – grab profiles / initial room
        if (data.type === "connection_established") {
          if (Array.isArray(data.profiles)) {
            const profs: Profile[] = data.profiles.map((p: any) => ({
              platform: p.platform,
              profile_id: String(p.profile_id),
            }));
            setProfiles(profs);

            // Default selected platform
            if (!selectedPlatform && profs.length > 0) {
              setSelectedPlatform(profs[0].platform);
            }
          }

          // If your backend sends initial rooms/messages, you can parse them here too
          return;
        }

        // 2) New message – update conversation state
        if (data.type === "new_message") {
          const platform: Platform = data.platform;
          const clientId: string = String(data.client_id);
          const roomId: number | string = data.room_id ?? "unknown";
          const text: string = data.message;
          const direction: "incoming" | "outgoing" =
            data.message_type === "outgoing" ? "outgoing" : "incoming";
          const timestamp: string = data.timestamp ?? new Date().toISOString();

          const convId = `${platform}:${clientId}`;

          setConversations((prev) => {
            const existing = prev[convId];

            const msg: ChatMessage = {
              id: `${timestamp}-${direction}`,
              platform,
              clientId,
              roomId,
              text,
              direction,
              timestamp,
            };

            const updated: Conversation = existing
              ? {
                  ...existing,
                  messages: [...existing.messages, msg],
                }
              : {
                  id: convId,
                  platform,
                  clientId,
                  roomId,
                  messages: [msg],
                };

            return {
              ...prev,
              [convId]: updated,
            };
          });

          // If nothing selected yet, auto-select this conversation & platform
          setSelectedPlatform((prevPlat) => prevPlat ?? platform);
          setSelectedConversationId((prevId) => prevId ?? convId);
        }
      } catch (err) {
        console.error("WS parse error:", err, event.data);
      }
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [accessToken, selectedPlatform]);

  /* ─────────────────────────────
     2) Sending a message
     (you might need to adapt the payload
      to match your backend spec)
  ───────────────────────────── */
  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!pendingMessage.trim() || !selectedConversation || !wsRef.current) return;

    const payload = {
      type: "send_message",
      room_id: selectedConversation.roomId,
      platform: selectedConversation.platform,
      client_id: selectedConversation.clientId,
      message: pendingMessage.trim(),
    };

    wsRef.current.send(JSON.stringify(payload));

    // Optimistic UI update (outgoing)
    const now = new Date().toISOString();
    const msg: ChatMessage = {
      id: `${now}-outgoing`,
      platform: selectedConversation.platform,
      clientId: selectedConversation.clientId,
      roomId: selectedConversation.roomId,
      text: pendingMessage.trim(),
      direction: "outgoing",
      timestamp: now,
    };

    setConversations((prev) => ({
      ...prev,
      [selectedConversation.id]: {
        ...selectedConversation,
        messages: [...selectedConversation.messages, msg],
      },
    }));

    setPendingMessage("");
  };

  /* ─────────────────────────────
     3) Derived data for UI
  ───────────────────────────── */
  const conversationList = Object.values(conversations).sort((a, b) => {
    const lastA = a.messages[a.messages.length - 1];
    const lastB = b.messages[b.messages.length - 1];
    return (
      new Date(lastB?.timestamp ?? 0).getTime() -
      new Date(lastA?.timestamp ?? 0).getTime()
    );
  });

  const filteredConversations = selectedPlatform
    ? conversationList.filter((c) => c.platform === selectedPlatform)
    : conversationList;

  /* ─────────────────────────────
     4) Rendering
  ───────────────────────────── */
  return (
    <div className="h-[calc(100vh-var(--header-h))] flex bg-[#05070b] text-white">
      {/* LEFT COLUMN – platforms */}
      <aside className="w-16 flex flex-col items-center py-4 bg-[#0b0e11] border-r border-white/5">
        <div className="mb-6 text-xs font-semibold text-gray-400">Channels</div>
        <div className="flex flex-col gap-4">
          {profiles.map((p) => {
            const isActive = p.platform === selectedPlatform;
            const label =
              p.platform === "facebook"
                ? "F"
                : p.platform === "whatsapp"
                ? "W"
                : p.platform === "instagram"
                ? "I"
                : p.platform.charAt(0).toUpperCase();
            return (
              <button
                key={`${p.platform}-${p.profile_id}`}
                onClick={() => setSelectedPlatform(p.platform)}
                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold
                  ${
                    isActive
                      ? "bg-[#0b57d0] text-white"
                      : "bg-[#1b1f2b] text-gray-300 hover:bg-[#24293a]"
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* MIDDLE COLUMN – conversations list */}
      <section className="w-80 flex flex-col bg-[#080b12] border-r border-white/5">
        <div className="px-4 py-3 border-b border-white/5">
          <h2 className="text-lg font-semibold">Messages History</h2>
          <div className="mt-3">
            <input
              className="w-full bg-[#111521] rounded-md px-3 py-2 text-sm outline-none"
              placeholder="Search"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 && (
            <div className="p-4 text-sm text-gray-500">
              No conversations yet. Send or receive a message to start.
            </div>
          )}

          {filteredConversations.map((c) => {
            const isActive = c.id === selectedConversationId;
            const lastMsg = c.messages[c.messages.length - 1];

            return (
              <button
                key={c.id}
                onClick={() => setSelectedConversationId(c.id)}
                className={`w-full flex flex-col items-start px-4 py-3 text-left text-sm border-b border-white/5
                  ${
                    isActive
                      ? "bg-[#182132]"
                      : "hover:bg-[#111521]"
                  }`}
              >
                <div className="flex w-full justify-between">
                  <span className="font-semibold">
                    {c.clientId || "Unknown"}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {lastMsg
                      ? new Date(lastMsg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
                <div className="mt-1 w-full flex justify-between gap-2">
                  <span className="text-xs text-gray-400 truncate max-w-[190px]">
                    {lastMsg ? lastMsg.text : "No messages yet"}
                  </span>
                  {c.platform && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 uppercase text-gray-400">
                      {c.platform}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* RIGHT COLUMN – active chat */}
      <main className="flex-1 flex flex-col bg-[#05070b]">
        {/* Chat header */}
        <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between">
          {selectedConversation ? (
            <>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#1b1f2b] flex items-center justify-center text-sm font-semibold">
                  {selectedConversation.clientId.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">
                    {selectedConversation.clientId}
                  </div>
                  <div className="text-xs text-green-400">Online</div>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {selectedConversation.platform.toUpperCase()}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-400">
              Select a conversation to start chatting
            </div>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {selectedConversation ? (
            selectedConversation.messages.map((m) => {
              const isOutgoing = m.direction === "outgoing";
              return (
                <div
                  key={m.id}
                  className={`flex w-full ${
                    isOutgoing ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap
                    ${
                      isOutgoing
                        ? "bg-[#0b57d0] text-white rounded-br-none"
                        : "bg-[#111521] text-gray-100 rounded-bl-none"
                    }`}
                  >
                    {m.text}
                    <div className="mt-1 text-[10px] text-gray-300 text-right">
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              No conversation selected.
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={handleSend}
          className="h-16 border-t border-white/5 px-6 flex items-center gap-3"
        >
          <input
            type="text"
            className="flex-1 bg-[#111521] rounded-full px-4 py-2 text-sm outline-none"
            placeholder={
              selectedConversation
                ? "Type a message…"
                : "Select a conversation to start chatting…"
            }
            value={pendingMessage}
            onChange={(e) => setPendingMessage(e.target.value)}
            disabled={!selectedConversation}
          />
          <button
            type="submit"
            disabled={!selectedConversation || !pendingMessage.trim()}
            className="px-4 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0843a8] text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
