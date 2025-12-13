import BaseBody from "./BaseBody";
import { useState, useRef } from "react";

interface ImageBodyProps {
    data: { src: string };
    onChange: (newData: { src: string }) => void;
}

const ImageBody = ({ data, onChange }: ImageBodyProps) => {
    const [preview, setPreview] = useState(data.src || "");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            onChange({ src: url });
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPreview(e.target.value);
        onChange({ src: e.target.value });
    };
    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <BaseBody title="Картинка" editable>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                    type="text"
                    value={preview}
                    placeholder="Ссылка на картинку"
                    onChange={handleUrlChange}
                    style={{
                        width: "100%",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        padding: 6,
                    }}
                />
                {/* Скрытый input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />

                {/* Кастомная кнопка */}
                <button
                    onClick={handleButtonClick}
                    style={{
                        padding: "8px 12px",
                        borderRadius: 4,
                        border: "1px solid #333",
                        background: "#eee",
                        cursor: "pointer",
                        fontWeight: 500,
                    }}
                >
                    {preview ? "Выбрать другой файл" : "Выберите файл"}
                </button>

                {/* Превью картинки */}
                {preview && (
                    <img
                        src={preview}
                        alt="preview"
                        style={{
                            maxWidth: "100%",
                            maxHeight: 200,
                            borderRadius: 4,
                            marginTop: 8,
                        }}
                    />
                )}
            </div>
        </BaseBody>
    );
};

export default ImageBody;
