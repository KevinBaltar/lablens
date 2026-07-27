import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../contexts/AuthContext'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function useSocket() {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Só conectar se estiver autenticado
    if (!user) return

    // Cookie httpOnly é enviado automaticamente
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('WebSocket conectado')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('WebSocket desconectado')
      setIsConnected(false)
    })

    socket.on('connect_error', (error: Error) => {
      console.error('WebSocket erro:', error)
      setIsConnected(false)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [user])

  function joinChat(orderId: string) {
    socketRef.current?.emit('join-chat', orderId)
  }

  function leaveChat(orderId: string) {
    socketRef.current?.emit('leave-chat', orderId)
  }

  function sendMessage(orderId: string, content: string) {
    socketRef.current?.emit('send-message', { orderId, content })
  }

  function onNewMessage(callback: (data: { orderId: string; message: any }) => void) {
    socketRef.current?.on('new-message', callback)
    return () => {
      socketRef.current?.off('new-message', callback)
    }
  }

  function onNotification(callback: (notification: any) => void) {
    socketRef.current?.on('notification', callback)
    return () => {
      socketRef.current?.off('notification', callback)
    }
  }

  function onOrderUpdate(callback: (order: any) => void) {
    socketRef.current?.on('order-update', callback)
    return () => {
      socketRef.current?.off('order-update', callback)
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    joinChat,
    leaveChat,
    sendMessage,
    onNewMessage,
    onNotification,
    onOrderUpdate,
  }
}
