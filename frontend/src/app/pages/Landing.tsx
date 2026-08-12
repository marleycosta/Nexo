import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  BarChart3,
  FileSpreadsheet,
  LayoutDashboard,
  Menu,
  PencilLine,
  Tags,
  X,
} from "lucide-react";
import { Button, Card } from "@/design-system";
import { useAuth } from "../hooks/useAuth";

const PAGE_BG =
  "radial-gradient(1100px 640px at 100% 8%, rgba(243, 144, 123, 0.45), transparent 55%), linear-gradient(160deg, #0e2a4f 0%, #1b3456 32%, #304260 58%, #df7d71 86%, #f3907b 100%)";

const glassCard =
  "h-full border-white/25 bg-white/10 shadow-soft backdrop-blur-md";

const steps = [
  {
    title: "Crie sua conta",
    description: "Cadastro rápido, sem cartão e sem complicação.",
  },
  {
    title: "Registre seus movimentos",
    description: "Cadastre cada entrada ou saída com valor, categoria e data.",
  },
  {
    title: "Acompanhe o mês",
    description: "Veja saldo, receitas e despesas reunidos no painel.",
  },
] as const;

const features = [
  {
    icon: Tags,
    title: "Categorias com cor",
    description: "Separe mercado, salário e transporte em segundos.",
  },
  {
    icon: BarChart3,
    title: "Gráfico do mês",
    description: "Veja quanto cada categoria consumiu do orçamento.",
  },
  {
    icon: FileSpreadsheet,
    title: "Exportar para Excel",
    description: "Baixe seus lançamentos em planilha para analisar ou arquivar.",
  },
] as const;

const appScreens = [
  {
    icon: LayoutDashboard,
    title: "Painel",
    description: "Resumo do mês: quanto entrou, quanto saiu e o que sobrou.",
  },
  {
    icon: PencilLine,
    title: "Lançamentos",
    description: "Lista de receitas e despesas com filtro por data e categoria.",
  },
  {
    icon: Tags,
    title: "Categorias",
    description: "Você define nomes e cores para organizar cada movimento.",
  },
] as const;

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen text-white" style={{ background: PAGE_BG }}>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#0e2a4f]/55 backdrop-blur-md">
        <div className="site-container flex h-16 items-center justify-between">
          <Link
            to="/"
            className="font-display text-xl font-bold tracking-tight text-primary md:text-2xl"
          >
            Nexo
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login">
              <Button
                variant="outline"
                className="border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="outline"
                className="border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Criar conta
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10 md:hidden"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/10 bg-[#0e2a4f]/95 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Entrar
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Criar conta
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <section className="site-container flex min-h-[100dvh] flex-col justify-center pb-16 pt-28 md:pb-20 md:pt-32">
        <p className="animate-fade-up font-display text-5xl font-bold tracking-tight text-white md:text-7xl">
          Nexo
        </p>
        <h1
          className="mt-4 animate-fade-up whitespace-nowrap font-display text-[clamp(1.05rem,3.6vw,2.35rem)] font-semibold leading-none tracking-tight text-white"
          style={{ animationDelay: "70ms" }}
        >
          Controle suas finanças sem planilha
        </h1>
        <p
          className="mt-4 max-w-lg animate-fade-up text-base text-white/85 md:text-lg"
          style={{ animationDelay: "120ms" }}
        >
          Organize receitas e despesas, veja pra onde seu dinheiro vai e tome decisões com
          clareza.
        </p>
      </section>

      <section className="site-container pb-14 md:pb-16">
        <div className="animate-fade-up">
          <h2 className="font-display text-xl font-semibold tracking-tight text-white md:text-2xl">
            O que você usa no dia a dia
          </h2>
          <p className="mt-2 text-sm text-white/85 md:text-base">Três áreas simples.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
            {appScreens.map(({ icon: Icon, title, description }) => (
              <Card key={title} className={glassCard}>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-[#0e2a4f]">
                    <Icon size={22} />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
                </div>
                <p className="mt-3 text-sm text-white/85">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container pb-14 md:pb-16">
        <h2 className="font-display text-xl font-semibold tracking-tight text-white md:text-2xl">
          Como funciona
        </h2>
        <p className="mt-2 text-sm text-white/85 md:text-base">
          Três passos para ter clareza do mês.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
          {steps.map(({ title, description }, index) => (
            <Card
              key={title}
              className={`${glassCard} animate-fade-up`}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <p className="text-sm font-semibold text-primary">Passo {index + 1}</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-white">{title}</h3>
              <p className="mt-1 text-sm text-white/85">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="site-container pb-16 md:pb-20">
        <h2 className="font-display text-xl font-semibold tracking-tight text-white md:text-2xl">
          O que você encontra no Nexo
        </h2>
        <p className="mt-2 text-sm text-white/85 md:text-base">
          Ferramentas para acompanhar o dinheiro no dia a dia.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
          {features.map(({ icon: Icon, title, description }, index) => (
            <Card
              key={title}
              className={`${glassCard} animate-fade-up`}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-[#0e2a4f]">
                  <Icon size={22} />
                </span>
                <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
              </div>
              <p className="mt-3 text-sm text-white/85">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/20 bg-white/80 backdrop-blur-sm">
        <div className="site-container flex flex-col gap-3 py-4 md:flex-row md:items-end md:justify-between md:py-5">
          <div>
            <p className="font-display text-base font-bold text-primary">Nexo</p>
            <p className="mt-0.5 text-xs text-neutral-600">
              Criado por{" "}
              <a
                href="https://github.com/marleycosta"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-neutral-800 underline-offset-2 hover:text-primary hover:underline"
              >
                Marley Costa
              </a>
            </p>
            <p className="mt-1 text-xs text-neutral-600">
              © {new Date().getFullYear()} Nexo ·{" "}
              <Link to="/licenca" className="font-medium text-neutral-800 underline-offset-2 hover:text-primary hover:underline">
                CC BY-NC-ND 4.0
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-medium text-neutral-700">
            <Link to="/termos" className="hover:text-primary">
              Termos
            </Link>
            <Link to="/privacidade" className="hover:text-primary">
              Privacidade
            </Link>
            <Link to="/licenca" className="hover:text-primary">
              Licença
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
