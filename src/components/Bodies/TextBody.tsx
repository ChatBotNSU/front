import BaseBody from "./BaseBody";

interface TextBodyProps {
    data: { text: string };
    onChange: (newData: { text: string }) => void;
}

const TextBody = ({ data, onChange }: TextBodyProps) => {
    return (
        <BaseBody title="Текст" editable>
            <textarea
                value={data.text ?? ""}
                onChange={(e) => onChange({ ...data, text: e.target.value })}
                placeholder="Введите текст..."
                style={{
                    width: "100%",
                    minHeight: 60,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    padding: 6,
                }}
            />
        </BaseBody>
    );
};

export default TextBody;
