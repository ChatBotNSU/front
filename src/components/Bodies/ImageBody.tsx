import React from "react";
import BaseBody from "./BaseBody";
import ImageEditor from "../ImageEditor/ImageEditor";
import type { ImageItem } from "../../types/image";
interface ImageBodyProps {
    data: ImageItem[];
    onChange: (newData: ImageItem[]) => void;
    onDelete?: () => void;
}

const ImageBody: React.FC<ImageBodyProps> = ({ data, onChange, onDelete }) => {
    return (
        <BaseBody title="Изображения" onDelete={onDelete}>
            <ImageEditor images={data} onChange={onChange} />
        </BaseBody>
    );
};

export default ImageBody;
