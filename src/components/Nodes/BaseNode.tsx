import { Handle, Position as RFPosition } from "react-flow-renderer";

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
}

const BaseNode = <T extends BaseNodeData>({
    data,
    styleOverrides,
    children,
    handlesConfig = [
        { count: 1, position: RFPosition.Top },
        { count: 1, position: RFPosition.Bottom },
    ],
    handleLabels,
    showBottomIndices = false,
}: BaseNodeProps<T>) => {
    const baseStyle = {
        padding: 12,
        borderRadius: 8,
        border: "2px solid #333",
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
                    bottom: -20,
                    width: 40,
                    height: 40,
                    opacity: 0, // кликаем по кружку, центр совпадает
                } as React.CSSProperties;
            }
            if (position === RFPosition.Top) {
                style = {
                    ...style,
                    top: -20,
                    width: 40,
                    height: 40,
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
                />
            );

            // Отрисовать стрелки и индексы для входа/выхода
            if (position === RFPosition.Bottom) {
                const containerStyle: React.CSSProperties = {
                    position: "absolute",
                    left: `${percent}%`,
                    transform: "translateX(-50%)",
                    bottom: -24,
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
                            <div>▼</div>
                            <div>{i + 1}</div>
                        </div>
                    );
                } else {
                    handles.push(
                        <div
                            key={`${position}-label-${i}`}
                            style={containerStyle}
                        >
                            <div>▼</div>
                        </div>
                    );
                }
            }
            if (position === RFPosition.Top) {
                const containerStyle: React.CSSProperties = {
                    position: "absolute",
                    left: `${percent}%`,
                    transform: "translateX(-50%)",
                    top: -18,
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
                        ▲
                    </div>
                );
            }
        }

        return handles;
    };

    return (
        <div style={baseStyle as any}>
            {data.label && <div style={{ marginBottom: 8 }}>{data.label}</div>}
            {children}
            {handlesConfig.flatMap((h) => createHandles(h.count, h.position))}
        </div>
    );
};

export default BaseNode;
