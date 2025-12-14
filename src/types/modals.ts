export type AuthModalProps = {
    mode: "login" | "signup";
    onClose: () => void;
    onSuccess?: (payload?: { user?: { email?: string; username?: string }; access_token?: string; token_type?: string }) => void;
};