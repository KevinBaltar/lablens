import { useState } from "react";
import logo from "../../assets/logo.png";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";
import Icon from "../ui/Icons";

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
}

const menuItems = [
  { id: "pedidos", label: "Meus Pedidos", icon: "orders" as const },
  { id: "novo-pedido", label: "Fazer Pedido", icon: "add" as const },
  { id: "clientes", label: "Clientes", icon: "clients" as const },
  {
    id: "estabelecimentos",
    label: "Estabelecimentos",
    icon: "establishments" as const,
  },
  { id: "contatos", label: "Contatos", icon: "contacts" as const },
  {
    id: "tabela-precos",
    label: "Tabela de Preços",
    icon: "priceTable" as const,
  },
];

const masterMenuItems = [
  { id: "cadastrar-lentes", label: "Cadastrar Lentes", icon: "lens" as const },
  {
    id: "cadastrar-filial",
    label: "Cadastrar Filial",
    icon: "branch" as const,
  },
  {
    id: "gerenciar-usuarios",
    label: "Gerenciar Usuários",
    icon: "user" as const,
  },
];

const userMenuItems = [
  { id: "perfil", label: "Usuário", icon: "user" as const },
  { id: "alterar-senha", label: "Alterar Senha", icon: "lock" as const },
];

export default function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  const { user, isMaster, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const allMenuItems = isMaster
    ? [...menuItems, ...masterMenuItems]
    : menuItems;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200"
      >
        <Icon name="menu" className="h-5 w-5 text-slate-700" />
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 shadow-[8px_0_30px_-20px_rgba(15,23,42,0.25)]",
          "transform transition-transform duration-200 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-primary-100 shadow-sm">
                <img
                  src={logo}
                  alt="Lens Orders Lab"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Lens Orders Lab
                </h1>
                {user?.filialName && (
                  <p className="text-sm text-slate-500">{user.filialName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.24em] mb-3">
              Navegação
            </p>
            {allMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onMenuChange(item.id);
                  setIsMobileOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all duration-200",
                  activeMenu === item.id
                    ? "bg-primary-50 text-primary-700 shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    activeMenu === item.id
                      ? "bg-white text-primary-600 shadow-sm"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  <Icon name={item.icon} className="h-4.5 w-4.5" />
                </span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}

            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.24em] mt-6 mb-3">
              Dados Pessoais
            </p>
            {userMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onMenuChange(item.id);
                  setIsMobileOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all duration-200",
                  activeMenu === item.id
                    ? "bg-primary-50 text-primary-700 shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    activeMenu === item.id
                      ? "bg-white text-primary-600 shadow-sm"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  <Icon name={item.icon} className="h-4.5 w-4.5" />
                </span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User info & logout */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-600 text-sm font-semibold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-colors"
            >
              <Icon name="logout" className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
