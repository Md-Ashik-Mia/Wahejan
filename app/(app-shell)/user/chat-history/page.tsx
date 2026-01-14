"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { FaFacebookF, FaInstagram, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { MdSms } from "react-icons/md";

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
  historyFetched?: boolean;
}

function PlatformIcon({ platform }: { platform: string }) {
  const p = (platform || "").toLowerCase();

  if (p === "facebook") return <FaFacebookF aria-label="Facebook" />;
  if (p === "whatsapp") return <FaWhatsapp aria-label="WhatsApp" />;
  if (p === "instagram") return <FaInstagram aria-label="Instagram" />;
  if (p === "telegram") return <FaTelegramPlane aria-label="Telegram" />;
  if (p === "sms") return <MdSms aria-label="SMS" />;

  const fallback = (platform || "?").trim().charAt(0).toUpperCase() || "?";
  return <span aria-label={platform || "Unknown"}>{fallback}</span>;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;

  const wsRef = useRef<WebSocket | null>(null);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const selectedConversation = selectedConversationId
    ? conversations[selectedConversationId] ?? null
    : null;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [_, forceUpdate] = useState(0);

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
            const profs: Profile[] = [];
            const newConversations: Record<string, Conversation> = {};

            data.profiles.forEach((p: any) => {
              // Add profile
              profs.push({
                platform: p.platform,
                profile_id: String(p.profile_id),
              });

              // Process rooms for this profile
              if (Array.isArray(p.room)) {
                p.room.forEach((r: any) => {
                  const platform = p.platform;
                  const clientId = String(r.client_id).trim();
                  const roomId = r.room_id;
                  const convId = `${platform}:${clientId}`;

                  newConversations[convId] = {
                    id: convId,
                    platform,
                    clientId,
                    roomId,
                    messages: [],
                    historyFetched: false,
                  };
                });
              }
            });

            setProfiles(profs);

            // Safe merge: only add if not exists
            setConversations((prev) => {
              const next = { ...prev };
              Object.values(newConversations).forEach((nc) => {
                if (!next[nc.id]) {
                  next[nc.id] = nc;
                }
              });
              return next;
            });

            // Default selected platform
            if (!selectedPlatform && profs.length > 0) {
              setSelectedPlatform(profs[0].platform);
            }
          }
          return;
        }

        // 2) New message – update conversation state
        if (data.type?.trim() === "new_message") {
          const platform: Platform = data.platform;
          const clientId: string = String(data.client_id).trim();
          const roomId: number | string = data.room_id ?? "unknown";
          const rawText: string = data.message;
          const direction: "incoming" | "outgoing" =
            data.message_type === "outgoing" ? "outgoing" : "incoming";

          const timestamp = data.timestamp ?? new Date().toISOString();

          const convId = `${platform}:${clientId}`;
          console.log("[WS DEBUG] Processing 'new_message'", {
            receivedType: data.type,
            convId,
            platform,
            clientId,
            timestamp,
            direction
          });

          setConversations((prev) => {
            const existing = prev[convId];

            if (!existing) {
              console.warn("[WS DEBUG] Conversation NOT found, creating new one:", convId);
              const newMsg: ChatMessage = {
                id: `${timestamp}-${direction}-${Math.random()}`,
                platform,
                clientId,
                roomId,
                text: rawText,
                direction,
                timestamp,
              };

              return {
                ...prev,
                [convId]: {
                  id: convId,
                  platform,
                  clientId,
                  roomId,
                  messages: [newMsg],
                  historyFetched: false
                }
              };
            }

            console.log("[WS DEBUG] Conversation FOUND. Appending message.");
            const msg: ChatMessage = {
              id: `${timestamp}-${direction}-${Math.random()}`,
              platform,
              clientId,
              roomId,
              text: rawText,
              direction,
              timestamp,
            };

            return {
              ...prev,
              [convId]: {
                ...existing,
                messages: [...existing.messages, msg],
              },
            };
          });

          // Hack: Force UI re-render
          forceUpdate((n) => n + 1);

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
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
      }
      wsRef.current = null;
    };
  }, [accessToken, selectedPlatform]);

  /* ─────────────────────────────
     1.5) Fetch History
  ───────────────────────────── */
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedConversation || selectedConversation.historyFetched || !accessToken) return;

      try {
        // Mark as fetched immediately to prevent duplicate calls
        setConversations((prev) => {
          const conv = prev[selectedConversation.id];
          if (!conv) return prev;
          return {
            ...prev,
            [selectedConversation.id]: {
              ...conv,
              historyFetched: true,
            },
          };
        });

        const res = await fetch(
          `https://ape-in-eft.ngrok-free.app/api/chat/old-message/${selectedConversation.platform}/${selectedConversation.roomId}/`,
          {
             headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        if (!res.ok) throw new Error("Failed to fetch history");

        const data = await res.json();

        if (Array.isArray(data)) {
          const historyMessages: ChatMessage[] = data.map((msg: any) => ({
            id: String(msg.id),
            platform: selectedConversation.platform,
            clientId: selectedConversation.clientId,
            roomId: msg.room,
            text: msg.text,
            direction: msg.type === "outgoing" ? "outgoing" : "incoming",
            timestamp: msg.timestamp,
          }));

          setConversations((prev) => {
             const conv = prev[selectedConversation.id];
             if (!conv) return prev;
             const combined = [...historyMessages, ...conv.messages];
             return {
               ...prev,
               [selectedConversation.id]: {
                 ...conv,
                 messages: combined,
               },
             };
          });
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };

    fetchHistory();
  }, [selectedConversationId, accessToken, selectedConversation?.historyFetched]);

  /* ─────────────────────────────
     3) Derived data for UI
  ───────────────────────────── */
  const conversationList = Object.values(conversations).sort((a, b) => {
    const lastA = a.messages[a.messages.length - 1];
    const lastB = b.messages[b.messages.length - 1];

    const tA = lastA ? new Date(lastA.timestamp).getTime() : 0;
    const tB = lastB ? new Date(lastB.timestamp).getTime() : 0;

    return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
  });

  const filteredConversations = selectedPlatform
    ? conversationList.filter((c) => c.platform === selectedPlatform)
    : conversationList;

  // Re-sort messages for the selected conversation (history + live)
  const displayMessages = selectedConversation
    ? [...selectedConversation.messages].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();

        const valA = isNaN(timeA) ? 0 : timeA;
        const valB = isNaN(timeB) ? 0 : timeB;

        return valA - valB;
      })
    : [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

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
                <span className="text-lg leading-none">
                  <PlatformIcon platform={p.platform} />
                </span>
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
            const sorted = [...c.messages].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            const lastMsg = sorted[sorted.length - 1];

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
                      <span className="inline-flex items-center gap-1">
                        <span className="text-[12px] leading-none">
                          <PlatformIcon platform={c.platform} />
                        </span>
                        <span>{c.platform}</span>
                      </span>
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
                <span className="inline-flex items-center gap-2">
                  <span className="text-base leading-none">
                    <PlatformIcon platform={selectedConversation.platform} />
                  </span>
                  <span className="uppercase">{selectedConversation.platform}</span>
                </span>
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
            <>
              {displayMessages.map((m) => {
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
              })}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              No conversation selected.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
