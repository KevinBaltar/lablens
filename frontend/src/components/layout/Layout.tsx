import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  onNewOrder?: (type: "grade" | "par-a-par" | "surfacado") => void;
}

export default function Layout({
  children,
  activeMenu,
  onMenuChange,
  onNewOrder,
}: LayoutProps) {
  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar activeMenu={activeMenu} onMenuChange={onMenuChange} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeMenu={activeMenu} onNewOrder={onNewOrder || (() => {})} />

        <main className="flex-1 overflow-y-auto p-6 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
