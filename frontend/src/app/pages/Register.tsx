import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button, Card, Input, PasswordInput, useToast } from "@/design-system";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../services/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const { register, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedEmailConfirm = emailConfirm.trim().toLowerCase();

    if (!username.trim()) nextErrors.username = "Informe o usuário";
    if (!normalizedEmail) nextErrors.email = "Informe o e-mail";
    else if (!EMAIL_RE.test(normalizedEmail)) nextErrors.email = "E-mail inválido";
    if (!normalizedEmailConfirm) nextErrors.emailConfirm = "Confirme o e-mail";
    else if (normalizedEmail !== normalizedEmailConfirm) {
      nextErrors.emailConfirm = "Os e-mails não coincidem";
    }
    if (password.length < 6) nextErrors.password = "Mínimo de 6 caracteres";
    if (!passwordConfirm) nextErrors.passwordConfirm = "Confirme a senha";
    else if (password !== passwordConfirm) {
      nextErrors.passwordConfirm = "As senhas não coincidem";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await register(username.trim(), normalizedEmail, password);
      await login(username.trim(), password);
      toast.push("Conta criada com sucesso", "success");
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Não foi possível registrar";
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
        <h1 className="mt-2 text-lg font-semibold text-neutral-800">Criar conta</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Comece a organizar sua vida financeira em minutos.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input
            label="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            autoComplete="username"
          />
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Confirmar e-mail"
            type="email"
            value={emailConfirm}
            onChange={(e) => setEmailConfirm(e.target.value)}
            error={errors.emailConfirm}
            autoComplete="email"
          />
          <PasswordInput
            label="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            helperText="Use ao menos 6 caracteres"
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirmar senha"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            error={errors.passwordConfirm}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Registrar"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-neutral-600">
          Já tem conta?{" "}
          <Link className="font-semibold text-primary hover:underline" to="/login">
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  );
}
