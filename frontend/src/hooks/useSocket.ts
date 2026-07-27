import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../contexts/AuthContext'

const isVercel = !!(import.meta as any).env?.VERCEL || (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app'))

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin)

const DEFAULT_TRANSPORTS: ('websocket' | 'polling')[] = isVercel
  ? ['polling', 'websocket']
  : ['websocket', 'polling']

export function useSocket() {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!user) return

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: DEFAULT_TRANSPORTS,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000,
    })

    socket.on('connect', () => {
      const transportName = (socket.io.engine as any)?.transport?.name || 'desconhecido'
      console.log(`[SOCKET] Conectado via ${transportName}`)
      setIsConnected(true)
    })

    socket.on('disconnect', (reason) => {
      console.log(`[SOCKET] Desconectado: ${reason}`)
      setIsConnected(false)
    })

    socket.on('connect_error', (error: Error) => {
      const transportName = (socket.io.engine as any)?.transport?.name
      console.warn('[SOCKET] Erro de conexão:', error.message, transportName ? `| transport: ${transportName}` : '')
      setIsConnected(false)
    })

    const manager = (socket.io as any)
    if (manager && typeof manager.on === 'function') {
      manager.on('upgrade', () => {
        const transportName = (socket.io.engine as any)?.transport?.name || 'desconhecido'
        console.log(`[SOCKET] Transport atualizado para ${transportName}`)
      })
    }

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
