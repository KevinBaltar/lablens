import { useState, useEffect } from "react";
import api from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";
import { formatDate, formatDateTime } from "../../../lib/utils";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import ChatBox from "../../../components/chat/ChatBox";
import Icon from "@/components/ui/Icons";

const statusLabelsPrint: Record<string, string> = {
  PENDENTE: "Pendente",
  ACEITO: "Aceito",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};

const orderTypeLabels: Record<string, string> = {
  GRADE: "Pedido em Grade",
  PAR_A_PAR: "Pedido Par a Par",
  SURFACADO: "Pedido Surfaçado",
};

interface OrderDetailsProps {
  orderId: string;
  onBack: () => void;
}

interface Order {
  id: string;
  os: string | null;
  clientOS: string | null;
  status: "PENDENTE" | "ACEITO" | "RECUSADO" | "CANCELADO";
  orderType: string;
  quantity: number;
  patientName: string | null;
  pedidoPor: string | null;
  notes: string | null;
  selectedGrade: string | null;
  gradeData: Record<string, number> | null;
  createdAt: string;

  // OD
  odEsf: number | null;
  odCil: number | null;
  odEixo: number | null;
  odAdicao: number | null;
  odCentroOptico: number | null;
  odDnp: number | null;

  // OE
  oeEsf: number | null;
  oeCil: number | null;
  oeEixo: number | null;
  oeAdicao: number | null;
  oeCentroOptico: number | null;
  oeDnp: number | null;

  // Armação
  pa: number | null;
  am: number | null;
  vertical: number | null;
  diametro: number | null;
  frameFormat: string | null;

  lens: {
    id: string;
    name: string;
    type: string;
  };
  filial: {
    id: string;
    name: string;
    cnpj: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  statusHistory: {
    id: string;
    fromStatus: string | null;
    toStatus: string;
    reason: string | null;
    createdAt: string;
  }[];
  chat: {
    id: string;
    messages: {
      id: string;
      content: string;
      createdAt: string;
      sender: {
        id: string;
        name: string;
        role: string;
      };
    }[];
  } | null;
}

const statusColors = {
  PENDENTE: "bg-yellow-500",
  ACEITO: "bg-green-500",
  RECUSADO: "bg-red-500",
  CANCELADO: "bg-gray-500",
};

const statusLabels = {
  PENDENTE: "Pendente",
  ACEITO: "Aceito",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};

export default function OrderDetails({ orderId, onBack }: OrderDetailsProps) {
  const { user, isMaster } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const parseNumber = (val: any) => {
    if (val === undefined || val === null || String(val).trim() === "") return undefined;
    const num = parseFloat(val);
    return isNaN(num) ? undefined : num;
  };

  function startEditing() {
    if (!order) return;
    setEditData({
      clientOS: order.clientOS || "",
      patientName: order.patientName || "",
      pedidoPor: order.pedidoPor || "",
      notes: order.notes || "",
      odEsf: order.odEsf !== null ? order.odEsf.toString() : "",
      odCil: order.odCil !== null ? order.odCil.toString() : "",
      odEixo: order.odEixo !== null ? order.odEixo.toString() : "",
      odAdicao: order.odAdicao !== null ? order.odAdicao.toString() : "",
      odCentroOptico: order.odCentroOptico !== null ? order.odCentroOptico.toString() : "",
      odDnp: order.odDnp !== null ? order.odDnp.toString() : "",
      oeEsf: order.oeEsf !== null ? order.oeEsf.toString() : "",
      oeCil: order.oeCil !== null ? order.oeCil.toString() : "",
      oeEixo: order.oeEixo !== null ? order.oeEixo.toString() : "",
      oeAdicao: order.oeAdicao !== null ? order.oeAdicao.toString() : "",
      oeCentroOptico: order.oeCentroOptico !== null ? order.oeCentroOptico.toString() : "",
      oeDnp: order.oeDnp !== null ? order.oeDnp.toString() : "",
      pa: order.pa !== null ? order.pa.toString() : "",
      am: order.am !== null ? order.am.toString() : "",
      vertical: order.vertical !== null ? order.vertical.toString() : "",
    });
    setIsEditing(true);
  }

  async function handleSave() {
    if (!order) return;
    setIsProcessing(true);
    try {
      const payload: Record<string, any> = {
        clientOS: editData.clientOS || undefined,
        patientName: editData.patientName || undefined,
        pedidoPor: editData.pedidoPor || undefined,
        notes: editData.notes || undefined,
      };

      if (order.orderType !== "GRADE") {
        payload.odEsf = parseNumber(editData.odEsf);
        payload.odCil = parseNumber(editData.odCil);
        payload.odEixo = parseNumber(editData.odEixo);
        payload.odAdicao = parseNumber(editData.odAdicao);
        payload.odCentroOptico = parseNumber(editData.odCentroOptico);
        payload.odDnp = parseNumber(editData.odDnp);

        payload.oeEsf = parseNumber(editData.oeEsf);
        payload.oeCil = parseNumber(editData.oeCil);
        payload.oeEixo = parseNumber(editData.oeEixo);
        payload.oeAdicao = parseNumber(editData.oeAdicao);
        payload.oeCentroOptico = parseNumber(editData.oeCentroOptico);
        payload.oeDnp = parseNumber(editData.oeDnp);
      }

      if (order.orderType === "SURFACADO") {
        payload.pa = parseNumber(editData.pa);
        payload.am = parseNumber(editData.am);
        payload.vertical = parseNumber(editData.vertical);
      }

      await api.put(`/orders/${orderId}`, payload);

      if (order.status === "RECUSADO") {
        await api.patch(`/orders/${orderId}/status`, { status: "PENDENTE" });
      }

      setIsEditing(false);
      await loadOrder();
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.errors?.map((e: any) => `${e.field}: ${e.message}`).join("\n") ||
        "Erro ao salvar alterações";
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  }

  async function loadOrder() {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAccept() {
    if (!confirm("Tem certeza que deseja aceitar este pedido?")) return;

    setIsProcessing(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: "ACEITO" });
      await loadOrder();
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro ao aceitar pedido");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      alert("O motivo da recusa é obrigatório");
      return;
    }

    setIsProcessing(true);
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status: "RECUSADO",
        reason: rejectReason,
      });
      setShowRejectModal(false);
      setRejectReason("");
      await loadOrder();
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro ao recusar pedido");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) return;

    setIsProcessing(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: "CANCELADO" });
      await loadOrder();
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro ao cancelar pedido");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleResend() {
    if (!confirm("Tem certeza que deseja reenviar este pedido?")) return;

    setIsProcessing(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: "PENDENTE" });
      await loadOrder();
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro ao reenviar pedido");
    } finally {
      setIsProcessing(false);
    }
  }

  function handlePrint() {
    if (!order) return;

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Pedido #${order.os} - LabLens</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header p { font-size: 12px; color: #666; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 12px; color: white; font-size: 12px; font-weight: bold; }
    .status-pendente { background: #eab308; }
    .status-aceito { background: #22c55e; }
    .status-recusado { background: #ef4444; }
    .status-cancelado { background: #6b7280; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 12px; }
    .info-item { }
    .info-label { color: #666; font-size: 10px; }
    .info-value { font-weight: bold; }
    .lens-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .lens-box { border: 1px solid #ddd; padding: 10px; border-radius: 4px; }
    .lens-box h4 { font-size: 13px; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
    .lens-data { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; }
    .lens-data span:first-child { color: #666; }
    .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 10px; color: #999; text-align: center; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>LabLens - Pedido de Lentes</h1>
    <p>OS: ${order.os || "-"} | Status: <span class="status status-${order.status.toLowerCase()}">${statusLabelsPrint[order.status]}</span></p>
  </div>

  <div class="section">
    <div class="section-title">Informações do Pedido</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Nº Pedido</div>
        <div class="info-value">${order.os || "-"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">OS Cliente</div>
        <div class="info-value">${order.clientOS || "-"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Tipo</div>
        <div class="info-value">${orderTypeLabels[order.orderType] || order.orderType}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Quantidade</div>
        <div class="info-value">${order.quantity} par(es)</div>
      </div>
      <div class="info-item">
        <div class="info-label">Data</div>
        <div class="info-value">${formatDate(order.createdAt)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Lente</div>
        <div class="info-value">${order.lens.name}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Filial</div>
        <div class="info-value">${order.filial.name}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Paciente</div>
        <div class="info-value">${order.patientName || "-"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Pedido por</div>
        <div class="info-value">${order.pedidoPor || "-"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Solicitante</div>
        <div class="info-value">${order.createdBy.name}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Dados das Lentes</div>
    <div class="lens-grid">
      <div class="lens-box">
        <h4>Olho Direito (OD)</h4>
        <div class="lens-data">
          <span>Esférico:</span><span>${order.odEsf ?? "-"}</span>
          <span>Cilíndrico:</span><span>${order.odCil ?? "-"}</span>
          <span>Eixo:</span><span>${order.odEixo ?? "-"}</span>
          <span>Adição:</span><span>${order.odAdicao ?? "-"}</span>
          <span>Centro Óptico:</span><span>${order.odCentroOptico ?? "-"}</span>
          <span>DNP:</span><span>${order.odDnp ?? "-"}</span>
        </div>
      </div>
      <div class="lens-box">
        <h4>Olho Esquerdo (OE)</h4>
        <div class="lens-data">
          <span>Esférico:</span><span>${order.oeEsf ?? "-"}</span>
          <span>Cilíndrico:</span><span>${order.oeCil ?? "-"}</span>
          <span>Eixo:</span><span>${order.oeEixo ?? "-"}</span>
          <span>Adição:</span><span>${order.oeAdicao ?? "-"}</span>
          <span>Centro Óptico:</span><span>${order.oeCentroOptico ?? "-"}</span>
          <span>DNP:</span><span>${order.oeDnp ?? "-"}</span>
        </div>
      </div>
    </div>
    ${
      order.orderType === "SURFACADO"
        ? `
    <div style="margin-top: 15px;">
      <div class="lens-box">
        <h4>Dados da Armação</h4>
        <div class="lens-data">
          <span>PA:</span><span>${order.pa ?? "-"}</span>
          <span>AM:</span><span>${order.am ?? "-"}</span>
          <span>Vertical:</span><span>${order.vertical ?? "-"}</span>
          <span>Diâmetro:</span><span>${order.diametro ?? "-"}</span>
        </div>
      </div>
    </div>`
        : ""
    }
    ${
      order.orderType === "GRADE" &&
      order.gradeData &&
      Object.keys(order.gradeData).length > 0
        ? `
    <div style="margin-top: 15px;">
      <div class="lens-box">
        <h4>Grade Selecionada</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">Esférico</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">Cilíndrico</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">Qtd</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(order.gradeData)
              .map(([key, qty]) => {
                const [esf, cil] = key.split("_");
                return (
                  '<tr><td style="border: 1px solid #ddd; padding: 6px;">' +
                  parseFloat(esf).toFixed(2) +
                  '</td><td style="border: 1px solid #ddd; padding: 6px;">' +
                  parseFloat(cil).toFixed(2) +
                  '</td><td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: bold;">' +
                  qty +
                  "</td></tr>"
                );
              })
              .join("")}
          </tbody>
          <tfoot>
            <tr style="background: #f3f4f6; font-weight: bold;">
              <td colspan="2" style="border: 1px solid #ddd; padding: 6px; text-align: right;">Total:</td>
              <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${Object.values(order.gradeData).reduce((sum, qty) => sum + qty, 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>`
        : ""
    }
  </div>

  ${
    order.notes
      ? `
  <div class="section">
    <div class="section-title">Observações</div>
    <p style="font-size: 12px;">${order.notes}</p>
  </div>`
      : ""
  }

  <div class="footer">
    <p>Documento gerado em ${new Date().toLocaleString("pt-BR")} | LabLens - Sistema de Gestão de Lentes Ópticas</p>
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12 text-gray-500">
        Pedido não encontrado
      </div>
    );
  }

  const canAccept = isMaster && order.status === "PENDENTE";
  const canReject = isMaster && ["PENDENTE", "ACEITO"].includes(order.status);
  const canCancel =
    !isMaster &&
    ["PENDENTE", "RECUSADO"].includes(order.status) &&
    user?.filialId === order.filial.id;
  const canResend =
    !isMaster &&
    order.status === "RECUSADO" &&
    user?.filialId === order.filial.id;
  const canEdit =
    !isMaster &&
    ["PENDENTE", "RECUSADO"].includes(order.status) &&
    user?.filialId === order.filial.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <span className="mr-2 inline-flex">
              <Icon name="refresh" className="h-4 w-4" />
            </span>
            Voltar
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">
            Pedido #{order.os}
          </h2>
          <div
            className={`px-3 py-1 rounded-full text-white text-sm ${statusColors[order.status]}`}
          >
            {statusLabels[order.status]}
          </div>
        </div>

        <div className="flex gap-3">
        {isEditing ? (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsEditing(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isProcessing}>
              {isProcessing ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handlePrint}>
              <span className="mr-2 inline-flex">
                <Icon name="print" className="h-4 w-4" />
              </span>
              Imprimir
            </Button>
            {canEdit && (
              <Button onClick={startEditing}>
                <span className="mr-2 inline-flex">
                  <Icon name="edit" className="h-4 w-4" />
                </span>
                Editar
              </Button>
            )}
            {canAccept && (
              <Button onClick={handleAccept} disabled={isProcessing}>
                <span className="mr-2 inline-flex">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                Aceitar
              </Button>
            )}
            {canReject && (
              <Button
                variant="danger"
                onClick={() => setShowRejectModal(true)}
                disabled={isProcessing}
              >
                <span className="mr-2 inline-flex">
                  <Icon name="close" className="h-4 w-4" />
                </span>
                Recusar
              </Button>
            )}
            {canCancel && (
              <Button
                variant="danger"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
            )}
            {canResend && (
              <Button onClick={handleResend} disabled={isProcessing}>
                Reenviar
              </Button>
            )}
          </div>
        )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Pedido
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nº Pedido</p>
                <p className="font-medium">{order.os}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">OS Cliente</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.clientOS}
                    onChange={(e) => setEditData({ ...editData, clientOS: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-xl text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="font-medium">{order.clientOS || "-"}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-medium">{order.orderType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantidade</p>
                <p className="font-medium">{order.quantity} par(es)</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lente</p>
                <p className="font-medium">{order.lens.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Filial</p>
                <p className="font-medium">{order.filial.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pedido por</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.pedidoPor}
                    onChange={(e) => setEditData({ ...editData, pedidoPor: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-xl text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="font-medium">{order.pedidoPor || "-"}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Paciente</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.patientName}
                    onChange={(e) => setEditData({ ...editData, patientName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-xl text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="font-medium">{order.patientName || "-"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Lens Data */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dados das Lentes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* OD */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Olho Direito (OD)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Esférico:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.odEsf}
                        onChange={(e) => setEditData({ ...editData, odEsf: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.odEsf ?? "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Cilíndrico:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.odCil}
                        onChange={(e) => setEditData({ ...editData, odCil: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.odCil ?? "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Eixo:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="1"
                        value={editData.odEixo}
                        onChange={(e) => setEditData({ ...editData, odEixo: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.odEixo ?? "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Adição:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.odAdicao}
                        onChange={(e) => setEditData({ ...editData, odAdicao: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.odAdicao ?? "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Centro Óptico:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="1"
                        value={editData.odCentroOptico}
                        onChange={(e) => setEditData({ ...editData, odCentroOptico: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.odCentroOptico ?? "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">DNP:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.5"
                        value={editData.odDnp}
                        onChange={(e) => setEditData({ ...editData, odDnp: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.odDnp ?? "-"}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* OE */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Olho Esquerdo (OE)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Esférico:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.oeEsf}
                        onChange={(e) => setEditData({ ...editData, oeEsf: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.oeEsf ?? "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Cilíndrico:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.oeCil}
                        onChange={(e) => setEditData({ ...editData, oeCil: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.oeCil ?? "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Eixo:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="1"
                        value={editData.oeEixo}
                        onChange={(e) => setEditData({ ...editData, oeEixo: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.oeEixo ?? "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Adição:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.oeAdicao}
                        onChange={(e) => setEditData({ ...editData, oeAdicao: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.oeAdicao ?? "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Centro Óptico:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="1"
                        value={editData.oeCentroOptico}
                        onChange={(e) => setEditData({ ...editData, oeCentroOptico: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.oeCentroOptico ?? "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">DNP:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.5"
                        value={editData.oeDnp}
                        onChange={(e) => setEditData({ ...editData, oeDnp: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.oeDnp ?? "-"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Frame Data (Surfaçado) */}
            {order.orderType === "SURFACADO" && (
              <div className="mt-6 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Dados da Armação
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">PA:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.pa}
                        onChange={(e) => setEditData({ ...editData, pa: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.pa ?? "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">AM:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.am}
                        onChange={(e) => setEditData({ ...editData, am: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.am ?? "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Vertical:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.vertical}
                        onChange={(e) => setEditData({ ...editData, vertical: e.target.value })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="ml-2 font-medium">{order.vertical ?? "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Diâmetro:</span>
                    <span className="ml-2 font-medium">
                      {order.diametro ?? "-"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Grade Data (Grade) */}
            {order.orderType === "GRADE" &&
              order.gradeData &&
              Object.keys(order.gradeData).length > 0 && (
                <div className="mt-6 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Grade Selecionada
                  </h4>
                  <div className="overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Esférico
                          </th>
                          <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Cilíndrico
                          </th>
                          <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500">
                            Qtd
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(order.gradeData).map(([key, qty]) => {
                          const [esf, cil] = key.split("_");
                          return (
                            <tr key={key} className="hover:bg-gray-50">
                              <td className="border border-gray-200 px-3 py-2 font-medium">
                                {parseFloat(esf).toFixed(2)}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 font-medium">
                                {parseFloat(cil).toFixed(2)}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-center font-bold">
                                {qty}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-bold">
                          <td
                            colSpan={2}
                            className="border border-gray-200 px-3 py-2 text-right"
                          >
                            Total:
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center">
                            {Object.values(order.gradeData).reduce(
                              (sum, qty) => sum + qty,
                              0,
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
          </div>

          {/* Notes */}
          {(order.notes || isEditing) && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Observações
              </h3>
              {isEditing ? (
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  placeholder="Escreva alguma observação..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  rows={3}
                />
              ) : (
                <p className="text-gray-700">{order.notes}</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Histórico de Status
            </h3>
            <div className="space-y-4">
              {order.statusHistory.map((history) => (
                <div key={history.id} className="flex gap-3">
                  <div
                    className={`w-3 h-3 rounded-full mt-1.5 ${statusColors[history.toStatus as keyof typeof statusColors]}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {history.fromStatus
                        ? `${statusLabels[history.fromStatus as keyof typeof statusLabels]} → `
                        : ""}
                      {
                        statusLabels[
                          history.toStatus as keyof typeof statusLabels
                        ]
                      }
                    </p>
                    {history.reason && (
                      <p className="text-sm text-red-600 mt-1">
                        Motivo: {history.reason}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(history.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
            </div>
            <div className="h-96">
              <ChatBox orderId={order.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recusar Pedido
            </h3>
            <p className="text-gray-600 mb-4">
              Informe o motivo da recusa. Esta informação será enviada para a
              filial.
            </p>
            <Input
              label="Motivo da Recusa"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Descreva o motivo..."
              required
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
              >
                {isProcessing ? "Recusando..." : "Recusar Pedido"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
