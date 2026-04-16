import BaseBody from "./BaseBody";

interface TextBodyProps {
    data: { text: string };
    onChange: (newData: { text: string }) => void;
    onDelete?: () => void;
}

const TextBody = ({ data, onChange, onDelete }: TextBodyProps) => {
    return (
        <BaseBody title="Текст" onDelete={onDelete}>
            <textarea
                value={data.text ?? ""}
                onChange={(e) => onChange({ ...data, text: e.target.value })}
                placeholder="Введите текст..."
                style={{
                    width: "100%",
                    minHeight: 60,
                    borderRadius: 4,
                    border: "none",
                    padding: 6,
                    resize: "none",
                    background: "#E9EDF0",
                }}
            />
        </BaseBody>
    );
};

export default TextBody;
