// TODO: какого хера тут размывается при увеличении масштаба? надо разобраться с transform: translateZ(0) и will-change: transform, должно помочь, но не помогает
import React from "react";
import { BODY_ITEMS, type BodyType } from "../NodeBar/NodeBar";

import {
    useFloating,
    offset,
    flip,
    shift,
    autoUpdate,
} from "@floating-ui/react";

interface BodyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectBody: (bodyType: BodyType) => void;
    referenceEl: HTMLElement | null;
}

const BodyModal: React.FC<BodyModalProps> = ({
    isOpen,
    onClose,
    onSelectBody,
    referenceEl,
}) => {
    const { refs, floatingStyles } = useFloating({
        elements: {
            reference: referenceEl,
        },
        placement: "bottom-start",

        middleware: [
            offset({ mainAxis: 8, crossAxis: -14 }),

            flip(),

            shift({ padding: 8 }),
        ],

        whileElementsMounted: autoUpdate,
    });

    if (!isOpen) return null;

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 999,
                }}
            />

            <div
                ref={refs.setFloating}
                style={{
                    ...floatingStyles,
                    zIndex: 1000,
                    transform: `${floatingStyles.transform} translateZ(0)`,
                    willChange: "transform",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: -6,
                        left: 20,
                        width: 12,
                        height: 12,
                        background: "#FFB947",
                        transform: "rotate(45deg)",
                        borderRadius: 2,
                    }}
                />

                <div
                    style={{
                        background: "#FFB947",
                        borderRadius: 12,
                        boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                        minWidth: 220,
                        padding: 12,
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 8,
                        }}
                    >
                        Добавить в в сообщение:
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                        }}
                    >
                        {BODY_ITEMS.map((b) => (
                            <button
                                key={b.key}
                                onClick={() => {
                                    onSelectBody(b.key as BodyType);
                                    onClose();
                                }}
                                style={{
                                    padding: "10px 12px",
                                    borderRadius: 8,
                                    border: "1px solid rgba(0,0,0,0.1)",
                                    background: "rgba(255,255,255,0.7)",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    fontSize: 13,
                                }}
                            >
                                {b.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default BodyModal;
