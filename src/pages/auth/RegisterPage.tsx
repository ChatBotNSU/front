import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/api/client";
import { AuthCard, authInput } from "./AuthCard";

export function RegisterPage() {
  const { status, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (status === "authed") return <Navigate to="/flows" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Пароль минимум 6 символов");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register(email, password, name);
      navigate("/flows");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? "Почта уже зарегистрирована"
          : "Ошибка регистрации",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Регистрация" footer={<>Уже есть аккаунт? <Link to="/login" className="text-accent hover:underline">Войти</Link></>}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className={authInput} placeholder="Имя (необязательно)" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={authInput} type="email" placeholder="Почта" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={authInput} type="password" placeholder="Пароль (минимум 6)" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy || !email || !password}
          className="mt-1 rounded-md bg-accent py-2 text-sm font-medium text-white hover:bg-accent-soft disabled:opacity-50"
        >
          {busy ? "Создаём…" : "Создать аккаунт"}
        </button>
      </form>
    </AuthCard>
  );
}
