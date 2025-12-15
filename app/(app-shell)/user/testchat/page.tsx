"use client";
import React, { useState } from "react";

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

const TestChatPage: React.FC = () => {
  // =============================
  // 🔹 Fake Data / State
  // =============================
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "user",
      text: "Hi, I’d like to know what your delivery is.",
      timestamp: "October 27, 2025",
    },
    {
      id: 2,
      sender: "bot",
      text: "Our average delivery time is 2–3 business days.\nWould you like me to check for your specific region?",
      timestamp: "October 27, 2025",
    },
    {
      id: 3,
      sender: "user",
      text: "Yes, please!",
      timestamp: "October 27, 2025",
    },
    {
      id: 4,
      sender: "bot",
      text: "Great! Can you provide your postal code?",
      timestamp: "October 27, 2025",
    },
  ]);

  const [input, setInput] = useState("");

  // =============================
  // 🔹 Send message handler
  // =============================
  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulated bot reply (replace with API call)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "This is a test AI reply — your backend integration will respond here.",
          timestamp: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        },
      ]);
    }, 1000);
  };

  const handleReset = () => {
    setMessages([]);
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

