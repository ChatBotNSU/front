import type { AuthModalProps } from "../types/modals";

export default function AuthModal({ mode, onClose }: AuthModalProps) {
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
        } else {
            console.log("Login submitted", {
                email: email.value,
                password: password.value,
            });
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
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
                        className="bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                        {mode === "signup" ? "Sign Up" : "Log In"}
                    </button>
                </form>

                <div className="flex items-center my-4">
                    <hr className="flex-1 border-gray-300" />
                    <span className="mx-3 text-gray-400">or</span>
                    <hr className="flex-1 border-gray-300" />
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => (window.location.href = "#")}
                        className="flex items-center justify-center gap-2 border border-gray-300 p-3 rounded-lg hover:bg-gray-100 transition"
                    >
                        <img src="#" alt="Google" className="w-5 h-5" />{" "}
                        Continue with Google
                    </button>
                    <button
                        type="button"
                        onClick={() => (window.location.href = "#")}
                        className="flex items-center justify-center gap-2 border border-gray-300 p-3 rounded-lg hover:bg-gray-100 transition"
                    >
                        <img src="#" alt="GitHub" className="w-5 h-5" />{" "}
                        Continue with GitHub
                    </button>
                </div>
            </div>
        </div>
    );
}
