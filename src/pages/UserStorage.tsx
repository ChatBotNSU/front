import React, { useState, useEffect } from "react";
import { deleteChatbot, createChatbot } from "../utils/chatbotApi";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

interface Chatbot {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
}

const UserStorage: React.FC<{
    onSelectChatbot: (id: string) => void;
    onLogout: () => void;
}> = ({ onSelectChatbot, onLogout }) => {
    const user = useSelector((s: RootState) => s.auth.user);
    const token = useSelector((s: RootState) => s.auth.access_token);
    const [chatbots, setChatbots] = useState<Chatbot[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newBotName, setNewBotName] = useState("");

    const handleCreateChatbot = async () => {
        if (!newBotName.trim()) return;

        // If we have an auth token, create via API; otherwise create locally
        if (token) {
            setLoading(true);
            try {
                const payload = {
                    variables: [],
                    graph: { root: "", nodes: {}, edges: [] },
                    bot_name: newBotName,
                };
                const res = await createChatbot(payload, token);
                // normalize returned item similar to loadChatbots
                const b = res?.chatbot ?? res ?? {};
                const normalized: Chatbot = {
                    id: String(b.id ?? b._id ?? b.bot_id ?? ""),
                    name: b.bot_name ?? b.name ?? newBotName,
                    description: b.description ?? "",
                    createdAt:
                        b.created_at ??
                        b.createdAt ??
                        new Date().toISOString().split("T")[0],
                };
                setChatbots((cur) => [normalized, ...cur]);
                setNewBotName("");
                setShowCreateModal(false);
                // open editor for created bot
                onSelectChatbot(normalized.id);
            } catch (err: any) {
                alert(
                    "Ошибка при создании чатбота: " +
                        (err?.message ?? String(err))
                );
            } finally {
                setLoading(false);
            }
        } else {
            const newBot: Chatbot = {
                id: `bot-${Date.now()}`,
                name: newBotName,
                createdAt: new Date().toISOString().split("T")[0],
            };
            setChatbots((cur) => [newBot, ...cur]);
            setNewBotName("");
            setShowCreateModal(false);
        }
    };

    const handleDeleteChatbot = async (id: string) => {
        // if this is a local-only (not-yet-saved) bot id, just remove it locally
        if (id.startsWith("bot-")) {
            setChatbots((cur) => cur.filter((bot) => bot.id !== id));
            return;
        }

        if (!confirm("Вы уверены, что хотите удалить этот чатбот?")) return;
        if (!token) {
            alert("Missing auth token");
            return;
        }

        try {
            setLoading(true);
            await deleteChatbot(id, token);
            // remove from UI list
            setChatbots((cur) => cur.filter((bot) => bot.id !== id));
            alert("Чатбот удалён");
        } catch (err: any) {
            alert(
                "Ошибка при удалении чатбота: " + (err?.message ?? String(err))
            );
        } finally {
            setLoading(false);
        }
    };
    const loadChatbots = async () => {
        setLoading(true);
        setError(null);
        if (!token) {
            setError("Missing auth token");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch("/api/v1/chatbot/chatbots", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const json = await res.json();
            if (!res.ok) {
                throw new Error(
                    json?.detail || json?.message || "Failed to load chatbots"
                );
            }

            // Normalize to our Chatbot type
            const items: any[] = Array.isArray(json)
                ? json
                : json?.chatbots ?? json?.items ?? [];
            const normalized: Chatbot[] = items.map((b) => ({
                id: String(b.id ?? b._id ?? b.bot_id ?? ""),
                name: b.name ?? b.title ?? "Untitled",
                description: b.description ?? b.summary ?? "",
                createdAt:
                    b.created_at ??
                    b.createdAt ??
                    (new Date().toISOString().split("T")[0] as string),
            }));
            setChatbots(normalized);
        } catch (err: any) {
            setError(err?.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChatbots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <div
            style={{
                width: "100%",
                minHeight: "100vh",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "20px",
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "40px",
                    color: "white",
                }}
            >
                <div>
                    <h1 style={{ margin: "0 0 5px 0", fontSize: "32px" }}>
                        My Chatbots
                    </h1>
                    <p
                        style={{
                            margin: "0",
                            opacity: 0.9,
                            fontSize: "14px",
                        }}
                    >
                        {user?.email || "User"}
                    </p>
                </div>
                <button
                    onClick={onLogout}
                    style={{
                        padding: "10px 20px",
                        background: "rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.2)";
                    }}
                >
                    Logout
                </button>
            </div>

            <div style={{ marginBottom: "30px" }}>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        padding: "12px 24px",
                        background: "white",
                        border: "none",
                        color: "#667eea",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        transition: "transform 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    + Create New Chatbot
                </button>
            </div>

            {loading && (
                <div style={{ color: "white", marginBottom: 20 }}>
                    Loading chatbots...
                </div>
            )}

            {error && (
                <div style={{ color: "#ffdddd", marginBottom: 20 }}>
                    <div>Error: {error}</div>
                    <button
                        onClick={() => loadChatbots()}
                        style={{
                            marginTop: 8,
                            padding: "8px 12px",
                            background: "white",
                            color: "#667eea",
                            borderRadius: 6,
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "20px",
                    marginBottom: "40px",
                }}
            >
                {chatbots.map((bot) => (
                    <div
                        key={bot.id}
                        style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "20px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                            const element = e.currentTarget as HTMLDivElement;
                            element.style.transform = "translateY(-4px)";
                            element.style.boxShadow =
                                "0 12px 20px rgba(0, 0, 0, 0.15)";
                        }}
                        onMouseOut={(e) => {
                            const element = e.currentTarget as HTMLDivElement;
                            element.style.transform = "translateY(0)";
                            element.style.boxShadow =
                                "0 4px 6px rgba(0, 0, 0, 0.1)";
                        }}
                    >
                        <div
                            onClick={() => onSelectChatbot(bot.id)}
                            style={{ flex: 1 }}
                        >
                            <h3
                                style={{
                                    margin: "0 0 8px 0",
                                    color: "#333",
                                    fontSize: "18px",
                                }}
                            >
                                {bot.name}
                            </h3>
                            {bot.description && (
                                <p
                                    style={{
                                        margin: "0 0 12px 0",
                                        color: "#666",
                                        fontSize: "14px",
                                    }}
                                >
                                    {bot.description}
                                </p>
                            )}
                            <p
                                style={{
                                    margin: "0",
                                    color: "#999",
                                    fontSize: "12px",
                                }}
                            >
                                Created: {bot.createdAt}
                            </p>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: "8px",
                                marginTop: "16px",
                            }}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectChatbot(bot.id);
                                }}
                                style={{
                                    flex: 1,
                                    padding: "8px 12px",
                                    background: "#667eea",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    transition: "background 0.2s ease",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background =
                                        "#5568d3";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background =
                                        "#667eea";
                                }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChatbot(bot.id);
                                }}
                                style={{
                                    padding: "8px 12px",
                                    background: "#f5f5f5",
                                    color: "#666",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    transition: "background 0.2s ease",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background =
                                        "#ffebee";
                                    e.currentTarget.style.color = "#c62828";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background =
                                        "#f5f5f5";
                                    e.currentTarget.style.color = "#666";
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showCreateModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "30px",
                            width: "90%",
                            maxWidth: "400px",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2
                            style={{
                                margin: "0 0 20px 0",
                                color: "#333",
                                fontSize: "24px",
                            }}
                        >
                            Create New Chatbot
                        </h2>
                        <input
                            type="text"
                            placeholder="Chatbot name..."
                            value={newBotName}
                            onChange={(e) => setNewBotName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    handleCreateChatbot();
                                }
                            }}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                fontSize: "14px",
                                marginBottom: "20px",
                                boxSizing: "border-box",
                                fontFamily: "inherit",
                            }}
                            autoFocus
                        />
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                            }}
                        >
                            <button
                                onClick={() => setShowCreateModal(false)}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    background: "#f5f5f5",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#666",
                                    transition: "background 0.2s ease",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background =
                                        "#eeeeee";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background =
                                        "#f5f5f5";
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateChatbot}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    background: "#667eea",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    transition: "background 0.2s ease",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background =
                                        "#5568d3";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background =
                                        "#667eea";
                                }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserStorage;
