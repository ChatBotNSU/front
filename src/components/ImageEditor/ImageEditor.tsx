// TODO: добавить url в настройках ноды уже только
// TODO: реальный редактор добавить

import React, { useRef, useCallback } from "react";
import { IconTrash, IconRefresh, IconPlus } from "@tabler/icons-react";
import type { ImageItem } from "../../types/image";

interface ImageEditorProps {
    images: ImageItem[];
    onChange: (images: ImageItem[]) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ images, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const replaceIndexRef = useRef<number | null>(null);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            const imageFiles = files.filter((f) => f.type.startsWith("image/"));

            if (imageFiles.length > 0) {
                const newImages = imageFiles.map((file) => ({
                    url: URL.createObjectURL(file),
                }));

                onChange([...images, ...newImages]);
            }

            if (fileInputRef.current) fileInputRef.current.value = "";
        },
        [images, onChange],
    );

    const handleReplace = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || replaceIndexRef.current === null) return;

            const newImages = [...images];
            newImages[replaceIndexRef.current] = {
                url: URL.createObjectURL(file),
            };

            onChange(newImages);
            replaceIndexRef.current = null;

            if (replaceInputRef.current) replaceInputRef.current.value = "";
        },
        [images, onChange],
    );

    const removeImage = useCallback(
        (index: number) => {
            onChange(images.filter((_, i) => i !== index));
        },
        [images, onChange],
    );

    const triggerReplace = (index: number) => {
        replaceIndexRef.current = index;
        replaceInputRef.current?.click();
    };

    return (
        <div style={{ padding: 16, width: 320 }}>
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 12,
                    justifyContent: "center",
                    border: "2px solid #E9EDF0",
                    padding: 10,
                    borderRadius: 12,
                }}
            >
                {images.map((img, index) => (
                    <div
                        key={index}
                        style={{
                            position: "relative",
                            width: 80,
                            height: 80,
                            borderRadius: 12,
                            overflow: "hidden",
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        <img
                            src={img.url}
                            alt="preview"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />

                        <div
                            style={{
                                position: "absolute",
                                top: 4,
                                left: 4,
                                right: 4,
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <button
                                onClick={() => triggerReplace(index)}
                                style={iconBtn}
                            >
                                <IconRefresh size={14} />
                            </button>

                            <button
                                onClick={() => removeImage(index)}
                                style={iconBtn}
                            >
                                <IconTrash size={14} />
                            </button>
                        </div>

                        <div
                            style={{
                                position: "absolute",
                                bottom: 4,
                                right: 4,
                                background: "rgba(255,255,255,0.9)",
                                borderRadius: 6,
                                padding: "2px 6px",
                                fontSize: 12,
                                fontWeight: 600,
                            }}
                        >
                            {index + 1}
                        </div>
                    </div>
                ))}
            </div>

            <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: "2px solid #E9EDF0",
                    borderRadius: 12,
                    height: 70,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#9ca3af",
                    fontSize: 14,
                    gap: 4,
                }}
            >
                <span>Добавить изображение</span>
                <IconPlus size={20} />
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleFileSelect}
            />

            <input
                ref={replaceInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleReplace}
            />
        </div>
    );
};

const iconBtn: React.CSSProperties = {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
};

export default ImageEditor;
