import React from "react";

const ConfirmModal: React.FC<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDanger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({
    isOpen,
    title,
    message,
    confirmLabel = "Подтвердить",
    cancelLabel = "Отмена",
    isDanger = false,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                        {title}
                    </h2>
                    <p className="text-gray-300 mb-6">{message}</p>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded-full border border-gray-500 hover:bg-gray-700 text-white transition"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={
                                isDanger
                                    ? "px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition"
                                    : "px-4 py-2 rounded-full bg-sky-400 hover:bg-sky-300 text-gray-900 transition"
                            }
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
