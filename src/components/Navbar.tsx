import type { MenuItem } from "../types/menu";

export default function Navbar({
    returnItem,
    leftItems,
    centerItems,
    rightItems,
}: {
    returnItem?: MenuItem | null; // back to dashboard
    leftItems?: MenuItem[]; // export, import
    centerItems?: MenuItem[]; // main actions
    rightItems?: MenuItem[]; // publish, preview
}) {
    const Icon = ({ name }: { name?: string }) => {
        if (!name) return null;
        switch (name) {
            case "export":
                return (
                    <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 3v12"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M8 7l4-4 4 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M21 21H3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                );
            case "import":
                return (
                    <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 21V9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M8 17l4 4 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M21 3H3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                );
            case "save":
                return (
                    <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M5 20h14"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M5 4h14v12H5z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M9 4v4h6V4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                );
            case "preview":
                return (
                    <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                );
            case "publish":
                return (
                    <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M22 2L11 13"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M22 2l-7 20 1-7 7-13z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                );
            case "delete":
                return (
                    <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M3 6h18"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M10 11v6M14 11v6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                );
            default:
                return null;
        }
    };

    const renderButton = (item: MenuItem) => (
        <div className="inline-block rounded-[20px] border-4 border-black bg-white p-2">
            <button
                onClick={item.onClick}
                className="px-6 py-2 rounded-[10px] bg-gray-300 hover:bg-gray-400 text-black flex items-center gap-2"
            >
                <Icon name={item.icon} />
                <span>{item.label}</span>
            </button>
        </div>
    );

    return (
        <nav
            style={{ background: "#E2E8F0" }}
            className="w-full  text-white flex items-center justify-between px-6 py-3 z-10 flex-shrink-0"
        >
            <div className="flex items-center gap-2">
                {returnItem && renderButton(returnItem)}
            </div>
            <div className="flex items-center gap-2">
                {leftItems?.map((item, idx) => (
                    <div key={idx} className="ml-4">
                        {item.type === "button" ? (
                            renderButton(item)
                        ) : (
                            <a href={item.href} onClick={item.onClick}>
                                {item.label}
                            </a>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3">
                {centerItems?.map((item, idx) => (
                    <div key={idx}>
                        {item.type === "button" ? (
                            renderButton(item)
                        ) : (
                            <a href={item.href}>{item.label}</a>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3">
                {rightItems?.map((item, idx) => (
                    <div key={idx}>
                        {item.type === "button" ? (
                            renderButton(item)
                        ) : (
                            <a href={item.href}>{item.label}</a>
                        )}
                    </div>
                ))}
            </div>
        </nav>
    );
}
