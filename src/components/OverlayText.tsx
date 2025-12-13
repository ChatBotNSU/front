export default function OverlayText({ text }: { text: string }) {
    return (
        <div className="text-white text-4xl text-center pointer-events-none">
            {text}
        </div>
    );
}
