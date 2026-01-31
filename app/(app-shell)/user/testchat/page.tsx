"use client";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Local inline Send SVG component
 */
const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

        if (typeof data.status === "string" && data.status.toLowerCase() === "typing") {
          setIsBotTyping(true);
          return;
        }

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
            text: content!,
            timestamp: formatTime(),
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

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
      timestamp: formatTime(),
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
              ? "Connecting to AI…"
              : "Connection unavailable.",
          timestamp: formatTime(),
        },
      ]);
    }

    setInput("");
  };

  const handleReset = () => {
    setMessages([]);
    setIsBotTyping(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-h))] bg-[#0f1218]">
      {/* Dynamic Header Info */}
      <div className="px-6 py-4 bg-[#1a1f26]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                AI
             </div>
             <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1a1f26] ${
               connectionStatus === 'connected' ? 'bg-green-500' :
               connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
             }`} />
          </div>
          <div>
             <h1 className="text-base font-semibold text-white leading-tight">AI Assistant Test Chat</h1>
             <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
               {connectionStatus === 'connected' ? 'Experimental Active' : connectionStatus}
             </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="text-xs px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/5 transition-all active:scale-95"
        >
          Reset Session
        </button>
      </div>

      {/* Messages Area - FULL WIDTH */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
               <SendIcon className="w-8 h-8 text-white/50" />
            </div>
            <div>
              <p className="text-lg font-medium">Your AI Playground</p>
              <p className="text-sm">Start a conversation to test settings in real-time</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`px-4 py-3 rounded-2xl max-w-[85%] md:max-w-[60%] shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-[#1a1f26] text-gray-100 border border-white/5 rounded-tl-none"
              }`}
            >
              <p className="text-[15px] leading-relaxed select-text">{msg.text}</p>
            </div>
            <span className="text-[10px] text-gray-500 mt-1.5 px-1 font-medium">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isBotTyping && (
          <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="px-4 py-3 rounded-2xl bg-[#1a1f26] border border-white/5 rounded-tl-none flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={scrollEndRef} className="h-4" />
      </div>

      {/* Input Area - FULL WIDTH with centering max-width for focus */}
      <div className="p-6 bg-gradient-to-t from-[#0f1218] via-[#0f1218] to-transparent">
        <div className="flex items-center gap-3 bg-[#1a1f26] border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-blue-500/50 transition-all">
          <input
            type="text"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent text-white px-4 py-2.5 focus:outline-none text-[15px]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:grayscale text-white p-2.5 rounded-xl transition-all active:scale-90 shadow-lg shadow-blue-500/20"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-3 font-medium uppercase tracking-widest">
           Experimental Interface • Powered by Verse AI
        </p>
      </div>
    </div>
  );
};

export default TestChatPage;
