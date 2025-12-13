import Cell from "./Cell";

export default function Grid({
    rows,
    cols,
    hovered,
    setHovered,
}: {
    rows: number;
    cols: number;
    hovered: number | null;
    setHovered: (i: number | null) => void;
}) {
    return (
        <div
            className="grid absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 gap-[2px] z-10"
            style={{
                gridTemplateRows: `repeat(${rows}, 32px)`,
                gridTemplateColumns: `repeat(${cols}, 32px)`,
            }}
        >
            {Array.from({ length: rows * cols }).map((_, i) => (
                <Cell
                    key={i}
                    index={i}
                    hovered={hovered}
                    setHovered={setHovered}
                />
            ))}
        </div>
    );
}
