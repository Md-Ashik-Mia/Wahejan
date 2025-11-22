
"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function ChatPage() {
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (!accessToken) return;

    const ws = new WebSocket(
      `wss://your-ws-server.example.com/ws?token=${accessToken}`
    );

    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => console.log("Message:", event.data);
    ws.onerror = (err) => console.error("WS error", err);

    return () => ws.close();
  }, [accessToken]);

  return <div className="p-6 text-white">Chat here…</div>;
}
