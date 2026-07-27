import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icons";

interface PriceTableData {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  createdAt: string;
}

export default function PriceTable() {
  const { isMaster } = useAuth();
  const [priceTable, setPriceTable] = useState<PriceTableData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadPriceTable();
  }, []);

  async function loadPriceTable() {
    try {
      const { data } = await api.get("/price-table");
      setPriceTable(data);
    } catch (error) {
      console.error("Error loading price table:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/price-table", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await loadPriceTable();
    } catch (error) {
      console.error("Error uploading price table:", error);
      alert("Erro ao enviar arquivo");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload() {
    try {
      const response = await api.get("/price-table/download", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        priceTable?.originalName || "tabela-precos.pdf",
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading price table:", error);
      alert("Erro ao baixar arquivo");
    }
  }

  async function handleDelete() {
    if (!priceTable) return;
    if (!confirm("Tem certeza que deseja excluir a tabela de preços?")) return;

    try {
      await api.delete(`/price-table/${priceTable.id}`);
      setPriceTable(null);
    } catch (error) {
      console.error("Error deleting price table:", error);
      alert("Erro ao excluir arquivo");
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          Tabela de Preços
        </h3>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : priceTable ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">
                  {priceTable.originalName}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatFileSize(priceTable.size)} • Enviado em{" "}
                  {new Date(priceTable.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleDownload} variant="secondary">
                  <span className="mr-2 inline-flex">
                    <Icon name="download" className="h-4 w-4" />
                  </span>
                  Download
                </Button>
                {isMaster && (
                  <Button onClick={handleDelete} variant="danger">
                    <span className="mr-2 inline-flex">
                      <Icon name="delete" className="h-4 w-4" />
                    </span>
                    Excluir
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">Nenhuma tabela de preços disponível</p>
            {isMaster && (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={isUploading}
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                  <Icon name="upload" className="h-4 w-4" />
                  {isUploading ? "Enviando..." : "Enviar PDF"}
                </span>
              </label>
            )}
          </div>
        )}

        {isMaster && priceTable && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">
              Substituir tabela atual:
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
              <span className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
                <Icon name="upload" className="h-4 w-4" />
                {isUploading ? "Enviando..." : "Enviar nova versão"}
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
