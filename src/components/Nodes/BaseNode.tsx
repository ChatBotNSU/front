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
                    bottom: -6,
                    width: 12,
                    height: 12,
                    opacity: 0, // кликаем по кружку, центр совпадает
                } as React.CSSProperties;
            }
            if (position === RFPosition.Top) {
                style = {
                    ...style,
                    top: -6,
                    width: 12,
                    height: 12,
                    opacity: 0,
                } as React.CSSProperties;
            }

            handles.push(
                <Handle
                    key={`${position}-${i}`}
                    type={
                        position === RFPosition.Top || position === RFPosition.Left
                            ? "target"
                            : "source"
                    }
                    position={position}
                    style={style}
                    id={`${position}-${i}`}
                />
            );

            // Отрисовать видимый индикатор выхода/входа рядом с точкой соединения
            if (position === RFPosition.Bottom) {
                const dotStyle: React.CSSProperties = {
                    position: "absolute",
                    left: `${percent}%`,
                    transform: "translateX(-50%)",
                    bottom: -6,
                    width: 12,
                    height: 12,
                    borderRadius: 9999,
                    background: "#111827",
                    border: "2px solid #111827",
                    pointerEvents: "none",
                };
                handles.push(
                    <div key={`${position}-dot-${i}`} style={dotStyle} />
                );
            }
            if (position === RFPosition.Top) {
                const dotStyle: React.CSSProperties = {
                    position: "absolute",
                    left: `${percent}%`,
                    transform: "translateX(-50%)",
                    top: -6,
                    width: 12,
                    height: 12,
                    borderRadius: 9999,
                    background: "#111827",
                    border: "2px solid #111827",
                    pointerEvents: "none",
                };
                handles.push(
                    <div key={`${position}-dot-${i}`} style={dotStyle} />
                );
            }

            const labelsForPosition = handleLabels?.[position];
            const label = labelsForPosition && labelsForPosition[i];
            if (label && position === RFPosition.Bottom) {
                const labelStyle: any = {
                    position: "absolute",
                    left: `${percent}%`,
                    transform: "translateX(-50%)",
                    bottom: -11, // вынести за пределы ноды вниз
                    background: "#e5e7eb",
                    color: "#111827",
                    borderRadius: 9,
                    height: 18,
                    minWidth: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "0 5px",
                    pointerEvents: "none",
                };
                handles.push(
                    <div key={`${position}-label-${i}`} style={labelStyle}>
                        {label}
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
