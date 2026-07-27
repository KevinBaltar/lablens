import Button from '../../components/ui/Button'

interface OrderConfirmationProps {
  orderOs: string
  onNewOrder: () => void
  onGoHome: () => void
}

export default function OrderConfirmation({ orderOs, onNewOrder, onGoHome }: OrderConfirmationProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pedido Enviado!
        </h2>

        {/* Order Number */}
        <p className="text-gray-600 mb-2">
          Seu pedido foi enviado com sucesso.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500">Número do Pedido (OS)</p>
          <p className="text-2xl font-bold text-primary-600">{orderOs}</p>
        </div>

        {/* Info */}
        <p className="text-sm text-gray-500 mb-6">
          Você receberá uma notificação quando o status do pedido for alterado.
          Acompanhe seus pedidos na lista de pedidos.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onGoHome}
          >
            ← Voltar ao Início
          </Button>
          <Button
            className="flex-1"
            onClick={onNewOrder}
          >
            + Novo Pedido
          </Button>
        </div>
      </div>
    </div>
  )
}
