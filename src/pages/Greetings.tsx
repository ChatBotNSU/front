import { useState } from "react";
import Grid from "../components/Grid";
import OverlayText from "../components/OverlayText";
import OverlayButton from "../components/OverlayButton";

export default function Greetings({
    onOpenAuth,
}: {
    onOpenAuth?: (mode: "login" | "signup") => void;
}) {
    const rows = 10;
    const cols = 16;
    const [hovered, setHovered] = useState<number | null>(null);

    // top menu removed

    return (
        <>
            {/* Navbar removed - clean welcome screen */}
            <div className="relative w-full h-screen overflow-hidden bg-gray-900">
                <Grid
                    rows={rows}
                    cols={cols}
                    hovered={hovered}
                    setHovered={setHovered}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-9 pointer-events-none">
                    <OverlayText text="ChatBotEditor" />
                    <OverlayButton
                        label="Войти"
                        onClick={() => onOpenAuth?.("login")}
                    />
                </div>
            </div>
        </>
    );
}
