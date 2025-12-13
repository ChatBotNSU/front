export default function OverlayButton({
    label,
    onClick,
    pointEvent = "auto",
}: {
    label: string;
    onClick: () => void;
    pointEvent?: React.CSSProperties["pointerEvents"];
}) {
    return (
        <button
            className="px-8 py-3 bg-sky-400 text-gray-900 font-bold text-lg rounded-lg shadow-md cursor-pointer transition-colors hover:bg-sky-300"
            style={{ pointerEvents: pointEvent }}
            onClick={onClick}
        >
            {label}
        </button>
    );
}
