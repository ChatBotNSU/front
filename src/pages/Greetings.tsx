import { useState } from "react";
import Navbar from "../components/Navbar";
import Grid from "../components/Grid";
import OverlayText from "../components/OverlayText";
import OverlayButton from "../components/OverlayButton";
import type { MenuItem } from "../types/menu";

export default function Greetings({
    onOpenAuth,
}: {
    onOpenAuth?: (mode: "login" | "signup") => void;
}) {
    const rows = 10;
    const cols = 16;
    const [hovered, setHovered] = useState<number | null>(null);

    const leftMenu: MenuItem[] = [
        { label: "Docs", href: "#", type: "link" },
        { label: "Examples", href: "#", type: "link" },
    ];

    const rightMenu: MenuItem[] = [
        { label: "Contact", href: "#", type: "link" },
        {
            label: "Log in",
            type: "button",
            variant: "secondary",
            onClick: () => onOpenAuth?.("login"),
        },
        {
            label: "Sign up",
            type: "button",
            variant: "primary",
            onClick: () => onOpenAuth?.("signup"),
        },
    ];

    return (
        <>
            <Navbar leftItems={leftMenu} rightItems={rightMenu} />
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
                        label="Начнём!"
                        onClick={() => onOpenAuth?.("login")}
                    />
                </div>
            </div>
        </>
    );
}
