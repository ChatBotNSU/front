import React, { useEffect, useRef, useState } from "react";
import { getPreviewExecutionId, processPreview } from "../../utils/chatbotApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

type Message = { id: string; sender: "user" | "bot"; text: string };

const PreviewModal: React.FC<{
    chatbotId: string;
    onClose: () => void;
}> = ({ chatbotId, onClose }) => {
    const token = useSelector((s: RootState) => s.auth.access_token);
    const [executionId, setExecutionId] = useState<string | number | null>(
        null
    );
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const listRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await getPreviewExecutionId(token);
                if (!mounted) return;
                // Accept property name variants
                const id =
                    res?.execution_id ?? res?.executionId ?? res?.id ?? res;
                setExecutionId(id ?? null);
            } catch (err: any) {
                alert(
                    "Не удалось получить execution id: " +
                        (err?.message ?? String(err))
                );
                onClose();
            }
        })();
        return () => {
            mounted = false;
        };
    }, [token, onClose]);

    useEffect(() => {
        listRef.current?.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    const pushBotMessage = (t: string) => {
        setMessages((cur) => [
            ...cur,
            { id: `${Date.now()}-${Math.random()}`, sender: "bot", text: t },
        ]);
    };

    const handleSend = async () => {
        if (!text.trim() || !executionId) return;
        const userMsg = text.trim();
        setMessages((cur) => [
            ...cur,
            { id: `u-${Date.now()}`, sender: "user", text: userMsg },
        ]);
        setText("");
        setLoading(true);
        try {
            // include restart_command = true by default
            const body = {
                text: userMsg,
                images: [],
                audios: [],
                files: [],
                restart_command: true,
            };
            const res = await processPreview(
                chatbotId,
                executionId,
                body,
                token
            );
            if (Array.isArray(res?.messages)) {
                res.messages.forEach((m: any) =>
                    pushBotMessage(m.text ?? String(m))
                );
            } else if (Array.isArray(res)) {
                res.forEach((m: any) => pushBotMessage(m.text ?? String(m)));
            } else if (res?.text) {
                pushBotMessage(String(res.text));
            } else if (res?.reply) {
                pushBotMessage(String(res.reply));
            } else if (typeof res === "string") {
                pushBotMessage(res);
            } else {
                pushBotMessage(JSON.stringify(res));
            }
        } catch (err: any) {
            alert(
                "Ошибка во время предпросмотра: " +
                    (err?.message ?? String(err))
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.4)",
                zIndex: 2000,
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 520,
                    maxWidth: "calc(100% - 24px)",
                    background: "white",
                    borderRadius: 8,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        padding: 12,
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div style={{ fontWeight: 600 }}>
                        Preview — Chat with bot
                    </div>
                    <div>
                        <button
                            onClick={onClose}
                            style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div
                    ref={listRef}
                    style={{
                        padding: 12,
                        height: 360,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                    }}
                >
                    {messages.length === 0 && (
                        <div style={{ color: "#666", fontSize: 13 }}>
                            Send a message to start the preview...
                        </div>
                    )}
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            style={{
                                alignSelf:
                                    m.sender === "user"
                                        ? "flex-end"
                                        : "flex-start",
                                maxWidth: "85%",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "#888",
                                    marginBottom: 4,
                                }}
                            >
                                {m.sender === "user" ? "You" : "Bot"}
                            </div>
                            <div
                                style={{
                                    background:
                                        m.sender === "user"
                                            ? "#eef2ff"
                                            : "#f1f5f9",
                                    padding: 10,
                                    borderRadius: 8,
                                }}
                            >
                                {m.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div
                    style={{
                        padding: 12,
                        borderTop: "1px solid #eee",
                        display: "flex",
                        gap: 8,
                    }}
                >
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSend();
                        }}
                        placeholder={
                            executionId
                                ? "Type a message..."
                                : "Waiting for execution id..."
                        }
                        style={{
                            flex: 1,
                            padding: 8,
                            borderRadius: 6,
                            border: "1px solid #e5e7eb",
                        }}
                    />
                    <button
                        disabled={!text.trim() || loading || !executionId}
                        onClick={handleSend}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 6,
                            background: "#667eea",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        {loading ? "..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;
