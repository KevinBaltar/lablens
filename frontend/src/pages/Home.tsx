import { useState } from "react";
import logo from "../assets/logo.png";
import { useAuth } from "../contexts/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icons";

export default function Home() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_35%),linear-gradient(135deg,_#f8fbff_0%,_#f3f7fc_100%)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-primary-100">
              <img
                src={logo}
                alt="Lens Orders Lab"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Lens Orders Lab
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#sobre" className="text-slate-600 hover:text-slate-900">
              Sobre
            </a>
            <a href="#produtos" className="text-slate-600 hover:text-slate-900">
              Produtos
            </a>
            <a href="#servicos" className="text-slate-600 hover:text-slate-900">
              Serviços
            </a>
            <Button
              variant="secondary"
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </Button>
          </nav>
        </div>
      </header>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-3 py-1 text-sm font-medium text-primary-700 shadow-sm mb-6">
                <Icon name="sparkles" className="h-4 w-4" />
                Fluxo moderno para ópticas
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight mb-6">
                Gestão de lentes com precisão e leveza.
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Sistema completo para envio e gestão de pedidos entre matriz e
                filiais, com comunicação integrada e um fluxo de trabalho mais
                claro.
              </p>
              <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                Entre em Contato
              </Button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-soft backdrop-blur">
              <h3 className="text-2xl font-semibold mb-6">Acesse o Sistema</h3>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
                <Input
                  label="Senha"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-12">Sobre</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-slate-600 mb-6">
              A LabLens é uma empresa especializada em soluções para o setor
              óptico, oferecendo tecnologia de ponta para gestão de pedidos de
              lentes.
            </p>
            <p className="text-lg text-slate-600">
              Nosso sistema conecta matrizes e filiais de forma eficiente,
              garantindo controle total sobre o fluxo de pedidos e comunicação
              integrada.
            </p>
          </div>
        </div>
      </section>

      <section id="produtos" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Produtos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Visão Simples Pronta",
                desc: "Lentes prontas para uso imediato",
              },
              {
                title: "Visão Simples Surfaçada",
                desc: "Lentes sob medida para sua necessidade",
              },
              {
                title: "Progressivas",
                desc: "Lentes multifocais de alta performance",
              },
              { title: "Bifocais", desc: "Lentes com dois campos de visão" },
            ].map((product, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-4">
                  <Icon
                    name={i === 0 || i === 1 ? "lens" : "orders"}
                    className="h-5 w-5"
                  />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {product.title}
                </h3>
                <p className="text-sm text-slate-600">{product.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Serviços</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Gestão de Pedidos",
                desc: "Controle completo do fluxo de pedidos entre matriz e filiais",
              },
              {
                title: "Comunicação Integrada",
                desc: "Chat em tempo real para resolução de problemas",
              },
              {
                title: "Relatórios",
                desc: "Acompanhamento e histórico completo de pedidos",
              },
            ].map((service, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-white/80 p-8 text-center shadow-sm"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mx-auto mb-4">
                  <Icon
                    name={
                      i === 0 ? "orders" : i === 1 ? "contacts" : "priceTable"
                    }
                    className="h-6 w-6"
                  />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-slate-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Endereços</h4>
              <p className="text-gray-400">Rua Principal, 100 - Centro</p>
              <p className="text-gray-400">
                Av. Industrial, 500 - Distrito Industrial
              </p>
              <p className="text-gray-400">
                Rua das Flores, 200 - Jardim América
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contatos</h4>
              <p className="text-gray-400">(11) 3333-1111 - Gerência</p>
              <p className="text-gray-400">(11) 3333-2222 - Expedição</p>
              <p className="text-gray-400">(11) 3333-3333 - Produção</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Lens Orders Lab</h4>
              <p className="text-gray-400">
                Sistema de Gestão de Lentes Ópticas
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            © 2026 Lens Orders Lab. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
