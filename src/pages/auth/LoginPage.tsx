import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/api/client";
import { AuthCard, authInput } from "./AuthCard";

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (status === "authed") return <Navigate to="/flows" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/flows");
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? "Неверная почта или пароль" : "Ошибка входа");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Вход" footer={<>Нет аккаунта? <Link to="/register" className="text-accent hover:underline">Регистрация</Link></>}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className={authInput} type="email" placeholder="Почта" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        <input className={authInput} type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy || !email || !password}
          className="mt-1 rounded-md bg-accent py-2 text-sm font-medium text-white hover:bg-accent-soft disabled:opacity-50"
        >
          {busy ? "Вход…" : "Войти"}
        </button>
      </form>
    </AuthCard>
  );
}
