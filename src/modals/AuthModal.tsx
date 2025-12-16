import React, { useState } from "react";
import type { AuthModalProps } from "../types/modals";

export default function AuthModal({
    mode,
    onClose,
    onSuccess,
}: AuthModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = form.elements.namedItem("email") as HTMLInputElement;
        const password = form.elements.namedItem(
            "password"
        ) as HTMLInputElement;

        if (!email.value || !password.value) {
            alert("Please fill in all fields.");
            return;
        }

        if (mode === "signup") {
            const username = form.elements.namedItem(
                "username"
            ) as HTMLInputElement;
            const repeatPassword = form.elements.namedItem(
                "repeatPassword"
            ) as HTMLInputElement;

            if (!username.value || !repeatPassword.value) {
                alert("Please fill in all fields.");
                return;
            }

            if (password.value !== repeatPassword.value) {
                alert("Passwords do not match.");
                return;
            }

            console.log("Sign Up submitted", {
                email: email.value,
                username: username.value,
                password: password.value,
            });
            alert("Sign up is not implemented yet.");
        } else {
            setLoading(true);
            setError(null);
            const fd = new FormData();
            fd.append("username", email.value);
            fd.append("password", password.value);

            fetch("/api/v1/auth/token", {
                method: "POST",
                body: fd,
            })
                .then(async (res) => {
                    const json = await res.json();
                    if (!res.ok) {
                        throw new Error(
                            json?.detail || json?.message || "Login failed"
                        );
                    }
                    return json;
                })
                .then((data) => {
                    onSuccess?.({
                        user: { email: email.value },
                        access_token: data.access_token,
                        token_type: data.token_type,
                    });
                    onClose();
                })
                .catch((err: any) => {
                    setError(err?.message || String(err));
                })
                .finally(() => setLoading(false));
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            onClick={() => onClose?.()}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-fadeIn relative"
            >
                <button
                    onClick={() => onClose?.()}
                    className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 text-2xl w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full shadow-sm hover:bg-gray-200"
                    aria-label="Close"
                    title="Закрыть"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {mode === "signup" ? "Create Account" : "Log In"}
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="email" className="font-medium mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="example@gmail.com"
                            required
                            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {mode === "signup" && (
                        <div className="flex flex-col">
                            <label
                                htmlFor="username"
                                className="font-medium mb-1"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Username"
                                required
                                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    )}

                    <div className="flex flex-col">
                        <label htmlFor="password" className="font-medium mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="*******"
                            required
                            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {mode === "signup" && (
                        <div className="flex flex-col">
                            <label
                                htmlFor="repeatPassword"
                                className="font-medium mb-1"
                            >
                                Repeat Password
                            </label>
                            <input
                                id="repeatPassword"
                                name="repeatPassword"
                                type="password"
                                placeholder="*******"
                                required
                                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-sky-400 text-gray-900 font-bold text-lg rounded-lg shadow-md cursor-pointer transition-colors hover:bg-sky-300 disabled:opacity-50"
                    >
                        {loading
                            ? "Please wait..."
                            : mode === "signup"
                            ? "Sign Up"
                            : "Log In"}
                    </button>
                </form>

                {error && (
                    <div className="text-red-500 mt-3 text-sm">{error}</div>
                )}
            </div>
        </div>
    );
}
