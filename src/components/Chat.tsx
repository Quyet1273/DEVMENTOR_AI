import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // <-- 1. IMPORT THEME
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
  
  // 2. GỌI BỘ MÀU TỪ HỆ THỐNG
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const history = data.map((msg) => ({
            id: msg.id.toString(),
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }));
          
          setMessages(history);

          const lastMsg = data[data.length - 1];
          if (lastMsg.conversation_id) {
            setConversationId(lastMsg.conversation_id);
          }
        } else {
          setMessages([
            {
              id: "welcome-msg",
              role: "assistant",
              content: `Hệ thống DevMentor AI đã sẵn sàng.`,
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử chat:", error);
      }
    };

    fetchChatHistory();
  }, [user]);

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
      const currentConvId = conversationId || crypto.randomUUID();
      if (!conversationId) setConversationId(currentConvId);

      await supabase
        .from("chat_messages")
        .insert([{ 
          user_id: user.id, 
          conversation_id: currentConvId, 
          role: "user", 
          content: userPrompt 
        }]);

      const chatHistory = messages
        .filter(m => m.id !== "welcome-msg")
        .map((m) => ({ role: m.role, content: m.content }));

      const aiReply = await getAIResponse(userPrompt, chatHistory);
      const responseTime = parseFloat(((performance.now() - startTime) / 1000).toFixed(2));

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiReply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      await supabase.from("chat_messages").insert([{
          user_id: user.id,
          conversation_id: currentConvId,
          role: "assistant",
          content: aiReply,
          ai_model: "llama-3.3-70b-versatile",
          response_time: responseTime,
      }]);

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

  // ĐÃ XÓA CỤC const colors = {...} Ở ĐÂY ĐỂ DÙNG GLOBAL THEME

  return (
    <div
      style={{
        height: "calc(100vh - 20px)",
        backgroundColor: colors.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: "monospace",
        color: colors.text,
        borderRadius: "24px",
        overflow: "hidden", 
        border: `1px solid ${colors.border}`,
        margin: "10px",
        position: "relative",
        transition: "all 0.3s ease"
      }}
    >
      {/* HEADER HUD - CỐ ĐỊNH PHÍA TRÊN */}
      <div
        style={{
          borderRadius: "12px",
          borderBottom: `1px solid ${colors.border}`,
          padding: "16px 32px",
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.85)", // Nền kính mờ đổi theo theme
          backdropFilter: "blur(12px)",
          margin: "10px 20px 0 20px",
          zIndex: 100,
          boxShadow: isDark ? "0 4px 30px rgba(0, 0, 0, 0.5)" : "0 4px 30px rgba(0, 0, 0, 0.05)",
          flexShrink: 0, 
          transition: "all 0.3s ease"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: colors.card, border: `1px solid ${colors.primary}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 15px ${colors.primary}44` }}>
              <Bot size={28} color={colors.primary} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: colors.text, letterSpacing: "0.05em" }}>
                <span style={{ color: colors.primary }}>DEVMENTOR AI</span>
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "9px", color: colors.primary, fontWeight: "bold", marginTop: "4px" }}>
                <div style={{ width: "6px", height: "6px", backgroundColor: colors.primary, borderRadius: "50%", boxShadow: `0 0 8px ${colors.primary}` }} />
                <span>SYSTEM_READY</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "10px", fontWeight: "bold", color: colors.muted, letterSpacing: "0.1em" }}>
            SUBJECT: <span style={{ color: colors.primary }}>{user?.name?.toUpperCase() || "QUỲNH"}</span>
          </div>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div 
        className="devmentor-scrollbar"
        style={{ 
          flex: 1, 
          overflowY: "auto", 
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
          
          <style>{`
            .markdown-body pre { background-color: ${colors.inputBg} !important; border: 1px solid ${colors.border} !important; }
            .markdown-body code { color: ${colors.secondary}; }
            .markdown-body p, .markdown-body h1, .markdown-body h2, .markdown-body h3 { color: ${colors.text}; }
          `}</style>

          {messages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", gap: "20px", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${msg.role === "user" ? colors.primary : colors.secondary}`, backgroundColor: colors.inputBg }}>
                {msg.role === "user" ? <User size={20} color={colors.primary} /> : <Terminal size={20} color={colors.secondary} />}
              </div>
              <div style={{ maxWidth: "80%", textAlign: msg.role === "user" ? "right" : "left" }}>
                <div style={{ 
                    padding: "16px 24px", 
                    borderRadius: "16px", 
                    fontSize: "14px", 
                    lineHeight: "1.6", 
                    border: `1px solid ${msg.role === "user" ? `${colors.primary}44` : `${colors.secondary}44`}`, 
                    background: msg.role === "user" 
                      ? `linear-gradient(to bottom right, ${colors.primary}15, ${colors.secondary}15)` 
                      : colors.card, 
                    color: colors.text 
                  }}>
                  <div className="markdown-body custom-prose" style={{ textAlign: "left" }}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                <div style={{ marginTop: "8px", fontSize: "9px", fontWeight: "bold", color: colors.muted, letterSpacing: "0.1em" }}>
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
      <div style={{ padding: "20px 32px 32px 32px", borderTop: `1px solid ${colors.border}`, flexShrink: 0, backgroundColor: colors.bg, transition: "all 0.3s ease" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Nhập lệnh truy vấn..."
            style={{ 
              width: "100%", 
              backgroundColor: colors.inputBg, 
              color: colors.text, 
              border: `1px solid ${colors.inputBorder}`, 
              borderRadius: "16px", 
              padding: "20px 140px 20px 24px", 
              outline: "none", 
              resize: "none", 
              minHeight: "70px", 
              fontFamily: "monospace",
              transition: "all 0.3s ease"
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            style={{ 
              position: "absolute", 
              right: "12px", 
              bottom: "12px", 
              padding: "10px 24px", 
              background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`, 
              border: "none", 
              borderRadius: "12px", 
              color: "#fff", 
              fontWeight: 900, 
              fontSize: "11px", 
              textTransform: "uppercase", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              opacity: input.trim() ? 1 : 0.5,
              transition: "all 0.3s ease"
            }}
          >
            Execute <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}