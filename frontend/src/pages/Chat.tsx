import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function Chat() {
const [messages, setMessages] = useState<Message[]>([{
  role: "assistant",
  content: "Welcome to Triffnix.AI! How can I help you with EVE Online today?",
  timestamp: new Date().toLocaleTimeString()
}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async () => {
  if (!input.trim()) return;

  const newMessage: Message = {
    role: "user",
    content: input,
    timestamp: new Date().toLocaleTimeString()
  };

  const recentMessages = [...messages, newMessage].slice(-4);
  setMessages([...messages, newMessage]);
  setInput("");
  setLoading(true);

  try {
    const res = await axios.post("/api/chat", { messages: recentMessages });
    console.log("API response:", res.data); // <-- add this!
    const replyContent =
      res.data.choices?.[0]?.message?.content ||
      res.data.choices?.[0]?.text ||
      res.data.content ||
      res.data.reply ||
      "(no reply)";
    const replyMessage: Message = {
      role: "assistant",
      content: replyContent,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages((prev) => [...prev, replyMessage]);
  } catch {
    setMessages((prev) => [...prev, {
      role: "assistant",
      content: "(error)",
      timestamp: new Date().toLocaleTimeString()
    }]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16192e] via-[#1a2139] to-[#171d31] flex flex-col items-center">
      <div className="absolute inset-0 z-0 pointer-events-none animate-starfield" />
      <div className="w-full max-w-4xl mx-auto px-4 pt-12 pb-16 relative z-10">
        <div className="mb-6 bg-gray-800 border border-accent/40 rounded-xl shadow-lg p-5 text-blue-100">
          <div className="font-semibold text-blue-100 mb-1">
            <span className="text-blue-100">Triffnix.AI</span> is your lightweight ChatGPT alternative.
          </div>
          <ul className="list-disc ml-6 text-sm mt-2 mb-0 text-blue-200">
            <li><b>General AI chat assistant</b> - with a basic working knowledge of EVE Online.</li>
            <li>
              <b>Context-aware</b> - Always remembers and references the last <span className="text-cyan-100 font-bold">4</span> messages in the chat.
            </li>
            <li>
              <b>No API or account access</b> - just advice. Please do not use this for fitting advice lol.
            </li>
          </ul>
        </div>

        <div className="bg-gray-900/80 border border-accent/20 rounded-xl shadow-lg flex flex-col h-[72vh] max-h-[700px] mb-8">
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-end gap-2 max-w-md">
                  {msg.role === "assistant" && (
                    <div className="text-sm">🧠</div>
                  )}
                  <div
                    className={`
                      px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap animate-fade-in shadow
                      ${msg.role === "user"
                        ? "bg-blue-700 text-white rounded-br-none"
                        : "bg-gray-800 text-white border border-accent/30 rounded-bl-none"}
                    `}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="text-sm">🙂</div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1 ml-2">
                  {msg.timestamp}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-sm text-gray-400 animate-pulse">Triffnix is thinking...</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-accent/20 bg-gray-900/90 flex gap-2">
            <input
              className="flex-1 rounded-lg px-4 py-2 bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Say something..."
              disabled={loading}
            />
            <button
              className="bg-accent hover:bg-cyan-700 text-white font-bold px-5 py-2 rounded-lg shadow transition disabled:opacity-60"
              onClick={send}
              disabled={loading}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
