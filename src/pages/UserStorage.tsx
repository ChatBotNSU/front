import React, { useState } from "react";
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
    const [chatbots, setChatbots] = useState<Chatbot[]>([
        {
            id: "bot-1",
            name: "Support Bot",
            description: "Customer support chatbot",
            createdAt: "2024-12-10",
        },
        {
            id: "bot-2",
            name: "FAQ Assistant",
            description: "Frequently asked questions bot",
            createdAt: "2024-12-11",
        },
        {
            id: "bot-3",
            name: "Sales Bot",
            description: "Sales and lead generation bot",
            createdAt: "2024-12-12",
        },
    ]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newBotName, setNewBotName] = useState("");

    const handleCreateChatbot = () => {
        if (newBotName.trim()) {
            const newBot: Chatbot = {
                id: `bot-${Date.now()}`,
                name: newBotName,
                createdAt: new Date().toISOString().split("T")[0],
            };
            setChatbots([newBot, ...chatbots]);
            setNewBotName("");
            setShowCreateModal(false);
        }
    };

    const handleDeleteChatbot = (id: string) => {
        setChatbots(chatbots.filter((bot) => bot.id !== id));
    };

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
