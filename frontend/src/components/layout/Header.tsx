import { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import Button from "../ui/Button";
import NotificationIndicator from "../ui/NotificationIndicator";

interface HeaderProps {
  activeMenu: string;
  onNewOrder: (type: "grade" | "par-a-par" | "surfacado") => void;
}

const orderTypes = [
  {
    id: "par-a-par" as const,
    label: "Pedido Par a Par",
    description: "Visão Simples Pronta",
  },
  {
    id: "grade" as const,
    label: "Pedido em Grade",
    description: "Visão Simples Pronta",
  },
  {
    id: "surfacado" as const,
    label: "Pedido Surfaçado",
    description: "Surfaçada, Progressiva, Bifocal",
  },
];

export default function Header({ activeMenu, onNewOrder }: HeaderProps) {
  const showOrderButtons = activeMenu === "novo-pedido";
  const [activeOrderType, setActiveOrderType] = useState<string | null>(null);

  useEffect(() => {
    if (!showOrderButtons) {
      setActiveOrderType(null);
    }
  }, [showOrderButtons]);

  const handleOrderSelect = (typeId: "grade" | "par-a-par" | "surfacado") => {
    setActiveOrderType(typeId);
    onNewOrder(typeId);
  };

  return (
    <header className="border-b border-slate-200/80 bg-white/70 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-primary-50">
            <img
              src={logo}
              alt="Lens Orders Lab"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Painel</p>
            <h2 className="text-xl font-semibold text-slate-900">
              {activeMenu === "novo-pedido" && "Novo Pedido"}
              {activeMenu === "pedidos" && "Meus Pedidos"}
              {activeMenu === "detalhes-pedido" && "Detalhes do Pedido"}
              {activeMenu === "clientes" && "Cadastro de Clientes"}
              {activeMenu === "estabelecimentos" &&
                "Cadastro de Estabelecimentos"}
              {activeMenu === "contatos" && "Contatos"}
              {activeMenu === "tabela-precos" && "Tabela de Preços"}
              {activeMenu === "cadastrar-lentes" && "Cadastrar Lentes"}
              {activeMenu === "cadastrar-filial" && "Cadastrar Filial"}
              {activeMenu === "perfil" && "Meu Perfil"}
              {activeMenu === "alterar-senha" && "Alterar Senha"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationIndicator />

          {showOrderButtons && (
            <div className="flex gap-3">
              {orderTypes.map((type) => {
                const isActive = activeOrderType === type.id;

                return (
                  <Button
                    key={type.id}
                    variant="primary"
                    aria-pressed={isActive}
                    onClick={() => handleOrderSelect(type.id)}
                    className={
                      isActive
                        ? "bg-primary-700 text-white shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"
                        : "bg-white text-slate-700 border-slate-200 hover:border-primary-300 hover:text-primary-700"
                    }
                  >
                    {type.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
