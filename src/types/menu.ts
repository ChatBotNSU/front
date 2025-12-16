export type MenuItem = {
    label: string;
    href?: string;
    type?: "link" | "button";
    variant?: "primary" | "secondary" | "danger";
    onClick?: () => void;
    icon?: string;
};
