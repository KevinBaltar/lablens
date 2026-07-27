import { useState } from "react";
import api from "../lib/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icons";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export default function ForgotPasswordPage({
  onBack,
}: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao enviar email");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_35%),linear-gradient(135deg,_#f8fbff_0%,_#f3f7fc_100%)] p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 shadow-sm">
            <Icon name="lock" className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-semibold text-primary-600 mb-2">
            LabLens
          </h1>
          <h2 className="text-2xl font-semibold text-slate-900">
            Recuperar Senha
          </h2>
        </div>

        {success ? (
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-8 text-center shadow-soft backdrop-blur">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <Icon name="mail" className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Email enviado!
            </h3>
            <p className="text-gray-600 mb-6">
              Verifique sua caixa de entrada e siga as instruções para redefinir
              sua senha.
            </p>
            <Button onClick={onBack} variant="secondary">
              Voltar para o login
            </Button>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-soft backdrop-blur">
            <p className="text-gray-600 mb-6">
              Digite seu email para receber um link de redefinição de senha.
            </p>

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

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={onBack}
                >
                  Voltar
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
