import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  LogOut,
  UserRound,
  LucideIcon,
} from "lucide-react";
import { cn } from "./utils";

export type SidebarItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const defaultItems: SidebarItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { to: "/categories", label: "Categorias", icon: Tags },
];

export type SidebarProps = {
  items?: SidebarItem[];
  onLogout?: () => void;
  brand?: string;
};

export function Sidebar({
  items = defaultItems,
  onLogout,
  brand = "Nexo",
}: SidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-44 animate-slide-in border-r border-neutral-200/80 bg-[var(--surface)] px-2.5 py-5 backdrop-blur-md md:flex md:flex-col">
        <div className="px-1.5">
          <p className="text-center font-display text-2xl font-bold tracking-tight text-primary">
            {brand}
          </p>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-neutral-200/80 pt-3">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )
            }
          >
            <UserRound size={16} />
            Perfil
          </NavLink>
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
            >
              <LogOut size={16} />
              Sair
            </button>
          ) : null}
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-[var(--surface-strong)]/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-1.5 py-1.5 text-[11px] font-semibold transition",
                  isActive ? "text-primary" : "text-neutral-500"
                )
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                "flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-1.5 py-1.5 text-[11px] font-semibold transition",
                isActive ? "text-primary" : "text-neutral-500"
              )
            }
          >
            <UserRound size={17} />
            Perfil
          </NavLink>
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-1.5 py-1.5 text-[11px] font-semibold text-neutral-500"
            >
              <LogOut size={17} />
              Sair
            </button>
          ) : null}
        </div>
      </nav>
    </>
  );
}
