export const formatSeconds = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return [h, m, s]
        .map((v) => String(v).padStart(2, "0"))
        .join(":");
};

export const parseTime = (value: string) => {
    const parts = value.split(":").map(Number);

    if (parts.length !== 3 || parts.some(isNaN)) return null;

    const [h, m, s] = parts;

    if (m > 59 || s > 59 || h < 0 || m < 0 || s < 0) return null;

    return h * 3600 + m * 60 + s;
};