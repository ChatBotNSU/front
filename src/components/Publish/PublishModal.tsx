import React, { useState } from "react";
import { assignTelegram } from "../../utils/chatbotApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const PublishModal: React.FC<{ chatbotId: string; onClose: () => void }> = ({ chatbotId, onClose }) => {
  const token = useSelector((s: RootState) => s.auth.access_token);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!value.trim()) return alert("Введите токен");
    setLoading(true);
    try {
      await assignTelegram(value.trim(), chatbotId, token);
      alert("Успешно опубликовано в Telegram");
      onClose();
    } catch (err: any) {
      alert("Ошибка публикации: " + (err?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", zIndex: 2200 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 8, width: 420, padding: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Опубликовать в Telegram</h3>
        <div style={{ marginBottom: 8, fontSize: 13, color: "#555" }}>Введите токен бота (Bot Token)</div>
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="123456:ABC-DEF..." style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e5e7eb", marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 12px", borderRadius: 6, background: "#f3f4f6", border: "none" }}>Отмена</button>
          <button disabled={loading} onClick={handlePublish} style={{ padding: "8px 12px", borderRadius: 6, background: "#10b981", color: "white", border: "none" }}>{loading ? "..." : "Опубликовать"}</button>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
