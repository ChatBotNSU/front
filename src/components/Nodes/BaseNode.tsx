import { Handle, Position as RFPosition } from "@xyflow/react";

interface HandleConfig {
    count: number;
    position: RFPosition;
}

interface BaseNodeData {
    label?: string;
}

interface BaseNodeProps<T extends BaseNodeData> {
    data: T;
    styleOverrides?: React.CSSProperties;
    children?: React.ReactNode;
    handlesConfig?: HandleConfig[];
    handleLabels?: Partial<Record<RFPosition, string[]>>;
    showBottomIndices?: boolean;
    hideDefaultLabel?: boolean;
}

const ArrowDown = () => (
    <div
        style={{
            width: 16,
            height: 16,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            border: "2px solid #2563eb",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}
    >
        <svg width="20" height="20" viewBox="0 0 24 24">
            <path
                d="M12 6v12M12 18l-6-6M12 18l6-6"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    </div>
);

const BaseNode = <T extends BaseNodeData>({
    data,
    styleOverrides,
    children,
    handlesConfig = [
        { count: 1, position: RFPosition.Top },
        { count: 1, position: RFPosition.Bottom },
    ],
    showBottomIndices = false,
    hideDefaultLabel = false,
}: BaseNodeProps<T>) => {
    const baseStyle: React.CSSProperties = {
        padding: 12,
        borderRadius: 24,
        border: "2px dashed #3B82F6",
        background: "#f9f9f9",
        position: "relative",
        minWidth: 180,
        boxShadow: "2px 2px 6px rgba(0,0,0,0.1)",
        fontFamily: "sans-serif",
        ...styleOverrides,
    };

    const createHandles = (count: number, position: RFPosition) => {
        const handles: React.ReactNode[] = [];

        for (let i = 0; i < count; i++) {
            const percent = ((i + 1) / (count + 1)) * 100;
            let style: React.CSSProperties = {};

            switch (position) {
                case RFPosition.Top:
                    style = {
                        top: 0,
                        left: `${percent}%`,
                        transform: "translateX(-50%)",
                    };
                    break;
                case RFPosition.Bottom:
                    style = {
                        bottom: 0,
                        left: `${percent}%`,
                        transform: "translateX(-50%)",
                    };
                    break;
                case RFPosition.Left:
                    style = {
                        left: 0,
                        top: `${percent}%`,
                        transform: "translateY(-50%)",
                    };
                    break;
                case RFPosition.Right:
                    style = {
                        right: 0,
                        top: `${percent}%`,
                        transform: "translateY(-50%)",
                    };
                    break;
            }

            // Расширяем кликабельную область хэндлов и совмещаем центр с видимым кружком
            if (position === RFPosition.Bottom) {
                style = {
                    ...style,
                    bottom: -8,
                    width: 16,
                    height: 16,
                    opacity: 0, // кликаем по кружку, центр совпадает
                } as React.CSSProperties;
            }
            if (position === RFPosition.Top) {
                style = {
                    ...style,
                    top: -8,
                    width: 16,
                    height: 16,
                    opacity: 0,
                } as React.CSSProperties;
            }

            handles.push(
                <Handle
                    key={`${position}-${i}`}
                    type={
                        position === RFPosition.Top ||
                        position === RFPosition.Left
                            ? "target"
                            : "source"
                    }
                    position={position}
                    style={style}
                    id={`${position}-${i}`}
                />,
            );

            // Отрисовать стрелки и индексы для входа/выхода
            if (position === RFPosition.Bottom) {
                const containerStyle: React.CSSProperties = {
                    position: "absolute",
                    left: `${percent}%`,
                    transform: "translateX(-50%)",
                    bottom: -8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    pointerEvents: "none",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#3b82f6",
                };
                if (showBottomIndices) {
                    handles.push(
                        <div
                            key={`${position}-label-${i}`}
                            style={containerStyle}
                        >
                            <ArrowDown />
                            <div>{i + 1}</div>
                        </div>,
                    );
                } else {
                    handles.push(
                        <div
                            key={`${position}-label-${i}`}
                            style={containerStyle}
                        >
                            <ArrowDown />
                        </div>,
                    );
                }
            }
            if (position === RFPosition.Top) {
                const containerStyle: React.CSSProperties = {
                    position: "absolute",
                    left: `${percent}%`,
                    transform: "translateX(-50%)",
                    top: -8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    pointerEvents: "none",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#10b981",
                };
                handles.push(
                    <div key={`${position}-label-${i}`} style={containerStyle}>
                        <ArrowDown />
                    </div>,
                );
            }
        }

        return handles;
    };

    return (
        <div style={baseStyle}>
            {!hideDefaultLabel && data.label && (
                <div
                    style={{
                        marginBottom: 8,
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        textAlign: "center",
                    }}
                >
                    {data.label}
                </div>
            )}
            {children}
            {handlesConfig.flatMap((h) => createHandles(h.count, h.position))}
        </div>
    );
};

export default BaseNode;
