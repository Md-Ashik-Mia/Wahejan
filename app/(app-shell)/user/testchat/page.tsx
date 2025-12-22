"use client";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Local inline Send SVG component to avoid dependency on 'lucide-react'.
 * Uses currentColor so it follows surrounding text color and accepts className.
 */
const Send: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const TESTCHAT_WS_BASE = "wss://ape-in-eft.ngrok-free.app/ws/testchat/";

function formatTodayLabel(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function safeJsonParse(value: unknown): unknown {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

const TestChatPage: React.FC = () => {
  const { data: session } = useSession();
  const sessionAccessToken = useMemo(() => {
    if (!session) return undefined;
    const maybe = (session as unknown as { accessToken?: unknown }).accessToken;
    return typeof maybe === "string" ? maybe : undefined;
  }, [session]);
  const accessToken = useMemo(() => {
    if (sessionAccessToken) return sessionAccessToken;
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem("access_token") ?? undefined;
  }, [sessionAccessToken]);

  // =============================
  // 🔹 State
  // =============================
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >(accessToken ? "connecting" : "disconnected");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef(0);

  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  // =============================
  // 🔹 WebSocket connection
  // =============================
  useEffect(() => {
    let stopped = false;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current != null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const closeSocket = () => {
      const ws = wsRef.current;
      wsRef.current = null;
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
    };

    const connect = () => {
      clearReconnectTimer();
      closeSocket();

      if (!accessToken) {
        setConnectionStatus("disconnected");
        return;
      }

      setConnectionStatus("connecting");
      const wsUrl = `${TESTCHAT_WS_BASE}?token=${encodeURIComponent(accessToken)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (stopped) return;
        reconnectAttemptRef.current = 0;
        setConnectionStatus("connected");
      };

      ws.onmessage = (ev) => {
        if (stopped) return;
        const parsed = safeJsonParse(String(ev.data));
        if (!parsed || typeof parsed !== "object") return;

        const data = parsed as Record<string, unknown>;

        // Backend can emit typing signals
        if (typeof data.status === "string" && data.status.toLowerCase() === "typing") {
          setIsBotTyping(true);
          return;
        }

        // Expected: { sender: "ai", message: { content: "..." } }
        let content: string | null = null;
        const message = data.message;
        if (typeof message === "string") {
          content = message;
        } else if (message && typeof message === "object") {
          const maybeContent = (message as Record<string, unknown>).content;
          if (typeof maybeContent === "string") content = maybeContent;
        } else if (typeof data.content === "string") {
          content = data.content;
        }

        if (!content) return;

        setIsBotTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.floor(Math.random() * 1000),
            sender: "bot",
            text: content,
            timestamp: formatTodayLabel(),
          },
        ]);
      };

      ws.onerror = () => {
        if (stopped) return;
        setConnectionStatus("error");
      };

      ws.onclose = () => {
        if (stopped) return;
        setConnectionStatus("disconnected");
        setIsBotTyping(false);
        const attempt = reconnectAttemptRef.current;
        const delay = Math.min(1000 * Math.pow(2, attempt), 15000);
        reconnectAttemptRef.current = attempt + 1;
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      stopped = true;
      clearReconnectTimer();
      closeSocket();
    };
  }, [accessToken]);

  // =============================
  // 🔹 Send message handler
  // =============================
  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
      timestamp: formatTodayLabel(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsBotTyping(true);

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ message: input }));
    } else {
      setIsBotTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text:
            connectionStatus === "connecting"
              ? "Connecting to AI… please try again in a moment."
              : "AI connection is not available right now. Please refresh or check your login/token.",
          timestamp: formatTodayLabel(),
        },
      ]);
    }

    setInput("");
  };

  const handleReset = () => {
    setMessages([]);
    setIsBotTyping(false);
  };

  // =============================
  // 🔹 Chat Layout
  // =============================
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold">Test your AI chatbot</h1>
          <p className="text-gray-400 text-sm">
            Use this window to see how your AI responds to messages.
            Anything tested here uses the same tone, knowledge, and settings.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Status: {connectionStatus}
            {!accessToken ? " (no token found)" : ""}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="text-sm px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 active:scale-95 transition"
        >
          Reset test chat
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ================= CHAT AREA ================= */}
        <div className="flex-1 bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col justify-between">
          <div className="overflow-y-auto space-y-4 mb-4 h-[70vh] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {messages.map((msg, index) => (
              <div key={msg.id} className="flex flex-col items-center">
                {(index === 0 || messages[index - 1].timestamp !== msg.timestamp) && (
                  <p className="text-xs text-gray-500 mb-2">{msg.timestamp}</p>
                )}
                <div
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  } w-full`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[70%] whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white self-end"
                        : "bg-black text-gray-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {isBotTyping && (
              <div className="flex justify-start w-full">
                <div className="px-4 py-2 rounded-2xl bg-black text-gray-300 text-sm">
                  Typing…
                </div>
              </div>
            )}

            <div ref={scrollEndRef} />
          </div>

          {/* Input area */}
          <div className="flex items-center gap-3 border-t border-gray-700 pt-3">
            <input
              type="text"
              placeholder="Type your test message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= SIDE PANEL ================= */}
        <div className="w-full lg:w-80 bg-gray-800 rounded-2xl p-6 shadow-lg h-fit">
          <h2 className="text-lg font-semibold mb-4">AI settings in use</h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-400">• Tone of voice</p>
              <p className="text-white font-medium">Professional & friendly</p>
            </div>

            <div>
              <p className="text-gray-400">• Active knowledge sources</p>
              <p className="text-white font-medium">
                Website, product database, FAQ
              </p>
            </div>

            <div>
              <p className="text-gray-400">• Channel settings</p>
              <p className="text-white font-medium">WhatsApp (simulation)</p>
            </div>

            <div>
              <p className="text-gray-400">• Language</p>
              <p className="text-white font-medium">Dutch</p>
            </div>
          </div>

          <button className="w-full mt-6 bg-gray-700 text-sm py-2 rounded-lg hover:bg-gray-600 transition">
            Edit settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestChatPage;

