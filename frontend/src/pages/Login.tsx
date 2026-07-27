import { useState } from "react";
import logo from "../assets/logo.png";
import { useAuth } from "../contexts/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

interface LoginPageProps {
  onForgotPassword: () => void;
}

export default function LoginPage({ onForgotPassword }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white/90 p-2 shadow-lg">
              <img
                src={logo}
                alt="Lens Orders Lab"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">Lens Orders Lab</h1>
          <p className="text-xl text-primary-100">
            Sistema de Gestão de Lentes Ópticas
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary-50 p-2 shadow-sm">
                <img
                  src={logo}
                  alt="Lens Orders Lab"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-primary-600">
              Lens Orders Lab
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Entrar no sistema
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />

            <Input
              label="Senha"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Esqueci minha senha
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
