import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  Modal,
  PasswordInput,
  useToast,
} from "@/design-system";
import { useAuth } from "../hooks/useAuth";
import { ApiError, setTokens } from "../services/api";
import {
  changePassword,
  deleteAccount,
  getMe,
  updateProfile,
} from "../services/auth";
import type { User } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfilePage() {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    getMe()
      .then((data) => {
        if (!active) return;
        setUser(data);
        setUsername(data.username);
        setEmail(data.email);
        setEmailConfirm(data.email);
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Falha ao carregar perfil";
        toast.push(message, "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [toast]);

  async function onSaveProfile(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const nextUsername = username.trim();
    const nextEmail = email.trim().toLowerCase();
    const nextEmailConfirm = emailConfirm.trim().toLowerCase();

    if (!nextUsername) nextErrors.username = "Informe o usuário";
    if (!nextEmail) nextErrors.email = "Informe o e-mail";
    else if (!EMAIL_RE.test(nextEmail)) nextErrors.email = "E-mail inválido";
    if (!nextEmailConfirm) nextErrors.emailConfirm = "Confirme o e-mail";
    else if (nextEmail !== nextEmailConfirm) {
      nextErrors.emailConfirm = "Os e-mails não coincidem";
    }

    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSavingProfile(true);
    try {
      const updated = await updateProfile({
        username: nextUsername,
        email: nextEmail,
      });
      setUser(updated);
      setUsername(updated.username);
      setEmail(updated.email);
      setEmailConfirm(updated.email);
      toast.push("Dados atualizados", "success");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Não foi possível salvar";
      toast.push(message, "error");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onChangePassword(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!currentPassword) nextErrors.currentPassword = "Informe a senha atual";
    if (newPassword.length < 6) nextErrors.newPassword = "Mínimo de 6 caracteres";
    if (!newPasswordConfirm) nextErrors.newPasswordConfirm = "Confirme a nova senha";
    else if (newPassword !== newPasswordConfirm) {
      nextErrors.newPasswordConfirm = "As senhas não coincidem";
    }

    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSavingPassword(true);
    try {
      const result = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      setTokens(result.access, result.refresh);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setPasswordErrors({});
      toast.push("Senha atualizada", "success");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Não foi possível alterar a senha";
      toast.push(message, "error");
    } finally {
      setSavingPassword(false);
    }
  }

  async function confirmDeleteAccount() {
    if (!deletePassword.trim()) {
      setDeleteError("Informe a senha para confirmar");
      return;
    }
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      logout();
      toast.push("Conta excluída com sucesso", "success");
      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Não foi possível excluir a conta";
      toast.push(message, "error");
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
      setDeletePassword("");
    }
  }

  return (
    <div className="page-shell space-y-6">
      <header>
        <h1 className="section-title">Perfil</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Atualize seus dados de acesso e a senha da conta.
        </p>
      </header>

      <Card className="mx-auto max-w-lg animate-fade-up">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          Dados da conta
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Altere o nome de usuário e o e-mail.
        </p>

        <form className="mt-5 space-y-4" onSubmit={onSaveProfile}>
          <Input
            label="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={profileErrors.username}
            disabled={loading}
            autoComplete="username"
          />
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={profileErrors.email}
            disabled={loading}
            autoComplete="email"
          />
          <Input
            label="Confirmar e-mail"
            type="email"
            value={emailConfirm}
            onChange={(e) => setEmailConfirm(e.target.value)}
            error={profileErrors.emailConfirm}
            disabled={loading}
            autoComplete="email"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || savingProfile}>
              {savingProfile ? "Salvando..." : "Salvar dados"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mx-auto max-w-lg animate-fade-up">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          Trocar senha
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Informe a senha atual e escolha uma nova.
        </p>

        <form className="mt-5 space-y-4" onSubmit={onChangePassword}>
          <PasswordInput
            label="Senha atual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={passwordErrors.currentPassword}
            autoComplete="current-password"
          />
          <PasswordInput
            label="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={passwordErrors.newPassword}
            helperText="Use ao menos 6 caracteres"
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirmar nova senha"
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            error={passwordErrors.newPasswordConfirm}
            autoComplete="new-password"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? "Atualizando..." : "Atualizar senha"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mx-auto max-w-lg animate-fade-up border-danger/20">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          Excluir conta
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Essa ação apaga permanentemente a conta e todos os dados vinculados.
        </p>
        {user ? (
          <p className="mt-3 text-sm text-neutral-600">
            Conta atual:{" "}
            <span className="font-semibold text-neutral-800">{user.username}</span>
          </p>
        ) : null}
        <div className="mt-4">
          <Button
            variant="danger"
            onClick={() => {
              setDeletePassword("");
              setDeleteError("");
              setConfirmDeleteOpen(true);
            }}
          >
            Excluir conta
          </Button>
        </div>
      </Card>

      <Modal
        open={confirmDeleteOpen}
        onClose={() => {
          if (deleting) return;
          setConfirmDeleteOpen(false);
          setDeletePassword("");
          setDeleteError("");
        }}
        title="Excluir conta?"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={deleting}
              onClick={() => {
                setConfirmDeleteOpen(false);
                setDeletePassword("");
                setDeleteError("");
              }}
            >
              Cancelar
            </Button>
            <Button variant="danger" disabled={deleting} onClick={confirmDeleteAccount}>
              {deleting ? "Excluindo..." : "Excluir definitivamente"}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-neutral-600">
          <p>
            Tem certeza de que deseja excluir a conta{" "}
            <strong>{user?.username}</strong>?
          </p>
          <p className="rounded-xl border border-danger/20 bg-danger-muted/60 px-3 py-2 text-danger">
            Essa ação não pode ser desfeita. Todos os dados serão apagados,
            incluindo categorias, transações e o acesso à conta.
          </p>
          <PasswordInput
            label="Digite sua senha para confirmar"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            error={deleteError}
            autoComplete="current-password"
          />
        </div>
      </Modal>
    </div>
  );
}
