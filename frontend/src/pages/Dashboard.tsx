import { useState } from 'react'
import Layout from '../components/layout/Layout'
import OrderList from './dashboard/OrderList'
import OrderDetails from './dashboard/orders/OrderDetails'
import NewOrder from './dashboard/NewOrder'
import OrderConfirmation from './dashboard/OrderConfirmation'
import Contacts from './dashboard/Contacts'
import PriceTable from './dashboard/PriceTable'
import Profile from './dashboard/Profile'
import ChangePassword from './dashboard/ChangePassword'
import LensManagement from './dashboard/LensManagement'
import FilialManagement from './dashboard/FilialManagement'
import ClientManagement from './dashboard/ClientManagement'
import EstablishmentManagement from './dashboard/EstablishmentManagement'

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState('pedidos')
  const [orderType, setOrderType] = useState<'grade' | 'par-a-par' | 'surfacado'>('par-a-par')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [submittedOrderOs, setSubmittedOrderOs] = useState<string | null>(null)

  function handleNewOrder(type: 'grade' | 'par-a-par' | 'surfacado') {
    setOrderType(type)
    setActiveMenu('novo-pedido')
  }

  function handleOrderComplete(orderOs: string) {
    setSubmittedOrderOs(orderOs)
    setActiveMenu('confirmacao-pedido')
  }

  function handleNewOrderFromConfirmation() {
    setSubmittedOrderOs(null)
    setActiveMenu('novo-pedido')
  }

  function handleGoHome() {
    setSubmittedOrderOs(null)
    setSelectedOrderId(null)
    setActiveMenu('pedidos')
  }

  function handleSelectOrder(orderId: string) {
    setSelectedOrderId(orderId)
    setActiveMenu('detalhes-pedido')
  }

  function handleBackToOrders() {
    setSelectedOrderId(null)
    setActiveMenu('pedidos')
  }

  function renderContent() {
    switch (activeMenu) {
      case 'pedidos':
        return <OrderList onSelectOrder={handleSelectOrder} />
      case 'detalhes-pedido':
        return selectedOrderId ? (
          <OrderDetails orderId={selectedOrderId} onBack={handleBackToOrders} />
        ) : (
          <OrderList onSelectOrder={handleSelectOrder} />
        )
      case 'novo-pedido':
        return <NewOrder type={orderType} onComplete={handleOrderComplete} />
      case 'confirmacao-pedido':
        return (
          <OrderConfirmation
            orderOs={submittedOrderOs || 'N/A'}
            onNewOrder={handleNewOrderFromConfirmation}
            onGoHome={handleGoHome}
          />
        )
      case 'clientes':
        return <ClientManagement />
      case 'estabelecimentos':
        return <EstablishmentManagement />
      case 'contatos':
        return <Contacts />
      case 'tabela-precos':
        return <PriceTable />
      case 'perfil':
        return <Profile />
      case 'alterar-senha':
        return <ChangePassword />
      case 'cadastrar-lentes':
        return <LensManagement />
      case 'cadastrar-filial':
        return <FilialManagement />
      default:
        return <OrderList onSelectOrder={handleSelectOrder} />
    }
  }

  return (
    <Layout
      activeMenu={activeMenu}
      onMenuChange={setActiveMenu}
      onNewOrder={handleNewOrder}
    >
      {renderContent()}
    </Layout>
  )
}
