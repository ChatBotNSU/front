import React, { useState, useEffect } from "react";
import NodeModal from "./NodeModal";

const AddNodeButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPosition, setModalPosition] = useState({
        x: 20,
        y: window.innerHeight - 450,
    });

    useEffect(() => {
        const updatePosition = () => {
            setModalPosition({
                x: 20,
                y: window.innerHeight - 450,
            });
        };

        window.addEventListener("resize", updatePosition);
        return () => window.removeEventListener("resize", updatePosition);
    }, []);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(!isModalOpen)}
                style={{
                    position: "fixed",
                    bottom: 20,
                    left: 20,
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#10b981",
                    border: "none",
                    color: "white",
                    fontSize: 24,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    zIndex: 100,
                }}
                onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background =
                        "#059669";
                    (e.target as HTMLButtonElement).style.boxShadow =
                        "0 6px 16px rgba(16, 185, 129, 0.4)";
                }}
                onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background =
                        "#10b981";
                    (e.target as HTMLButtonElement).style.boxShadow =
                        "0 4px 12px rgba(16, 185, 129, 0.3)";
                }}
            >
                +
            </button>
            <NodeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                position={modalPosition}
            />
        </>
    );
};

export default AddNodeButton;
