import type { MenuItem } from "../types/menu";

export default function Navbar({
    leftItems,
    rightItems,
}: {
    leftItems: MenuItem[];
    rightItems: MenuItem[];
}) {
    return (
        <nav className="w-full bg-black text-white flex items-center justify-between px-6 py-3 z-10 flex-shrink-0">
            <div className="flex items-center gap-2">
                <img src="#" alt="chatbot-logo" className="h-8" />
                <span className="font-bold">ChatBot Editor</span>
            </div>

            <ul className="flex items-center gap-6">
                {leftItems.map((item, index) => (
                    <li
                        key={index}
                        className="hover:text-gray-300 cursor-pointer"
                    >
                        {item.label}
                    </li>
                ))}
            </ul>

            <ul className="flex items-center gap-3">
                {rightItems.map((item, index) => (
                    <li
                        key={index}
                        className="hover:text-gray-300 cursor-pointer"
                    >
                        {item.type === "button" ? (
                            <button
                                onClick={item.onClick}
                                className={
                                    item.variant === "primary"
                                        ? "px-4 py-1 rounded-full bg-blue-500 hover:bg-blue-600 text-black"
                                        : "px-4 py-1 rounded-full border border-gray-500 hover:bg-gray-800"
                                }
                            >
                                {item.label}
                            </button>
                        ) : (
                            <a
                                href={item.href}
                                onClick={item.onClick ? (e) => { e.preventDefault(); item.onClick?.(); } : undefined}
                                className="hover:text-gray-300 cursor-pointer"
                            >
                                {item.label}
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
