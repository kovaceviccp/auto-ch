"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { ChatMessage, ChatRoom } from "@/types";
import { Send, ArrowLeft, Car } from "lucide-react";
import Link from "next/link";
import { useT } from "@/lib/i18n";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8001";
const WS_BASE = API_BASE.replace("http://", "ws://").replace("https://", "wss://");

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const t = useT();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/login"); return; }

    // Load room info + messages
    api.get("/chat/rooms").then((r) => {
      const found = r.data.find((rm: ChatRoom) => rm.id === Number(roomId));
      setRoom(found ?? null);
    });
    api.get(`/chat/rooms/${roomId}/messages`).then((r) => setMessages(r.data));

    // Connect WebSocket
    const token = sessionStorage.getItem("access_token");
    if (!token) return;
    const ws = new WebSocket(`${WS_BASE}/chat/ws/${roomId}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data) as ChatMessage;
      setMessages((prev) => [...prev, msg]);
      // If the incoming message is from the other person, mark it read immediately
      if (msg.sender_id !== user?.id) {
        api.patch(`/chat/rooms/${roomId}/read`).catch(() => {});
      }
    };

    return () => ws.close();
  }, [roomId, user, authLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const content = input.trim();
    if (!content || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ content }));
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/chat" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{room?.other_user_name ?? "..."}</p>
          {room && (
            <Link href={`/listings/${room.listing_id}`} className="text-xs text-primary-600 hover:underline truncate block">
              {room.listing_title}
            </Link>
          )}
        </div>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${connected ? "bg-green-400" : "bg-gray-300"}`} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                isMe
                  ? "bg-primary-600 text-white rounded-br-sm"
                  : "bg-white border border-gray-100 text-gray-900 rounded-bl-sm shadow-sm"
              }`}>
                {!isMe && <p className="text-xs font-medium text-primary-600 mb-1">{msg.sender_name}</p>}
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 text-right ${isMe ? "text-primary-200" : "text-gray-400"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2 items-end">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t("chat_placeholder")}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-24"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || !connected}
          className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-40 transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
