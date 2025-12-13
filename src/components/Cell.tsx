export default function Cell({
    index,
    hovered,
    setHovered,
}: {
    index: number;
    hovered: number | null;
    setHovered: (i: number | null) => void;
}) {
    return (
        <div
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            className={`w-8 h-8 border border-gray-700 transition-colors ${
                hovered === index ? "bg-sky-400" : "bg-gray-800"
            }`}
        />
    );
}
