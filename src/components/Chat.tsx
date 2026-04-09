import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Bot, User, ChevronRight, Zap, Terminal } from "lucide-react";
import { getAIResponse } from "../services/aiService";
import { supabase } from "../lib/supabase";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hệ thống DevMentor AI đã sẵn sàng.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !user) return;

    const userPrompt = input.trim();
    const startTime = performance.now();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userPrompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      await supabase
        .from("chat_messages")
        .insert([{ user_id: user.id, role: "user", content: userPrompt }]);

      const chatHistory = messages
        .slice(1)
        .map((m) => ({ role: m.role, content: m.content }));

      const aiReply = await getAIResponse(userPrompt, chatHistory);
      const responseTime = parseFloat(
        ((performance.now() - startTime) / 1000).toFixed(2),
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiReply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      await supabase.from("chat_messages").insert([
        {
          user_id: user.id,
          role: "assistant",
          content: aiReply,
          ai_model: "gpt-3.5-turbo",
          response_time: responseTime,
        },
      ]);
      await supabase
        .from("users")
        .update({ xp: (user.xp || 0) + 2 })
        .eq("id", user.id);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err",
          role: "assistant",
          content: `❌ Lỗi: ${error.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const colors = {
    bg: "#020617",
    card: "#0f172a",
    primary: "#22d3ee", 
    secondary: "#a855f7", 
    text: "#d1d5db",
    border: "rgba(168, 85, 247, 0.3)",
  };

  return (
    <div
      style={{
        height: "calc(100vh - 20px)", // Trừ margin để không bị tràn
        backgroundColor: colors.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: "monospace",
        color: colors.text,
        borderRadius: "24px",
        overflow: "hidden", // KHÓA CUỘN TOÀN CỤC
        border: "1px solid rgba(255, 255, 255, 0.1)",
        margin: "10px",
        position: "relative",
      }}
    >
      {/* HEADER HUD - CỐ ĐỊNH PHÍA TRÊN */}
      <div
        style={{
          borderRadius: "12px",
          borderBottom: `1px solid ${colors.border}`,
          padding: "16px 32px",
          backgroundColor: "rgba(2, 6, 23, 0.95)",
          backdropFilter: "blur(12px)",
          margin: "10px 20px 0 20px",
          zIndex: 100,
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
          flexShrink: 0, 
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: colors.card, border: `1px solid ${colors.primary}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 15px rgba(34, 211, 238, 0.3)` }}>
              <Bot size={28} color={colors.primary} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#fff", letterSpacing: "0.05em" }}>
                <span style={{ color: colors.primary }}>DEVMENTOR AI</span>
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "9px", color: colors.primary, fontWeight: "bold", marginTop: "4px" }}>
                <div style={{ width: "6px", height: "6px", backgroundColor: colors.primary, borderRadius: "50%", boxShadow: `0 0 8px ${colors.primary}` }} />
                <span>SYSTEM_READY</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "10px", fontWeight: "bold", color: "#64748b", letterSpacing: "0.1em" }}>
            SUBJECT: <span style={{ color: colors.primary }}>{user?.name?.toUpperCase() || "QUỲNH"}</span>
          </div>
        </div>
      </div>

      {/* MESSAGES AREA - KHU VỰC CUỘN DUY NHẤT */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: "auto", 
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
          scrollbarWidth: "thin",
          scrollbarColor: `${colors.primary} transparent`
        }}
      >
        <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", gap: "20px", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${msg.role === "user" ? colors.primary : colors.secondary}`, backgroundColor: "rgba(15, 23, 42, 0.5)" }}>
                {msg.role === "user" ? <User size={20} color={colors.primary} /> : <Terminal size={20} color={colors.secondary} />}
              </div>
              <div style={{ maxWidth: "80%", textAlign: msg.role === "user" ? "right" : "left" }}>
                <div style={{ padding: "16px 24px", borderRadius: "16px", fontSize: "14px", lineHeight: "1.6", border: `1px solid ${msg.role === "user" ? "rgba(34, 211, 238, 0.3)" : "rgba(168, 85, 247, 0.2)"}`, background: msg.role === "user" ? "linear-gradient(to bottom right, rgba(34, 211, 238, 0.1), rgba(168, 85, 247, 0.1))" : colors.card, color: "#fff" }}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <div style={{ marginTop: "8px", fontSize: "9px", fontWeight: "bold", color: "#475569", letterSpacing: "0.1em" }}>
                  {msg.timestamp.toLocaleTimeString("vi-VN")} // {msg.role === "user" ? "USER_AUTH" : "AI_RESPONSE"}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ color: colors.secondary, fontSize: "12px", fontStyle: "italic", fontFamily: "monospace" }}>
              {`> AI_IS_THINKING...`}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT AREA - CỐ ĐỊNH Ở ĐÁY */}
      <div style={{ padding: "20px 32px 32px 32px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0, backgroundColor: colors.bg }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Nhập lệnh truy vấn..."
            style={{ width: "100%", backgroundColor: colors.card, color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px 140px 20px 24px", outline: "none", resize: "none", minHeight: "70px", fontFamily: "monospace" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            style={{ position: "absolute", right: "12px", bottom: "12px", padding: "10px 24px", background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`, border: "none", borderRadius: "12px", color: "#020617", fontWeight: 900, fontSize: "11px", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", opacity: input.trim() ? 1 : 0.5 }}
          >
            Execute <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}