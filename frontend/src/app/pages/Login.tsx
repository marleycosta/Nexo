import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button, Card, Input, PasswordInput, useToast } from "@/design-system";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../services/api";

export function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!username.trim()) nextErrors.username = "Informe o usuário";
    if (!password) nextErrors.password = "Informe a senha";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.push("Login realizado com sucesso", "success");
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Não foi possível entrar";
      toast.push(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md animate-fade-up">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-primary"
        >
          <ArrowLeft size={16} />
          Voltar para a home
        </Link>
        <Link to="/" className="mt-4 block font-display text-3xl font-bold text-primary hover:opacity-90">
          Nexo
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-neutral-800">Entrar na sua conta</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Acompanhe receitas, despesas e saldo em um só lugar.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input
            label="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            autoComplete="username"
          />
          <PasswordInput
            label="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-neutral-600">
          Ainda não tem conta?{" "}
          <Link className="font-semibold text-primary hover:underline" to="/register">
            Criar conta
          </Link>
        </p>
      </Card>
    </div>
  );
}
