import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../hooks/useSocket'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface ChatBoxProps {
  orderId: string
}

interface Message {
  id: string
  content: string
  createdAt: string
  sender: {
    id: string
    name: string
    role: string
  }
}

const POLL_INTERVAL_MS = 3000

export default function ChatBox({ orderId }: ChatBoxProps) {
  const { user } = useAuth()
  const { isConnected, joinChat, leaveChat, sendMessage: sendSocketMessage, onNewMessage } = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollTimerRef = useRef<number | null>(null)

  const loadMessages = useCallback(async () => {
    try {
      const { data } = await api.get(`/chat/${orderId}`)
      const incoming: Message[] = data.messages || []
      setMessages((prev) => {
        if (prev.length === 0) return incoming
        const prevIds = new Set(prev.map((m) => m.id))
        const novidades = incoming.filter((m) => !prevIds.has(m.id))
        return novidades.length > 0 ? [...prev, ...novidades] : prev
      })
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    loadMessages()
    if (isConnected) {
      joinChat(orderId)
    }

    if (!isConnected) {
      pollTimerRef.current = window.setInterval(() => {
        loadMessages()
      }, POLL_INTERVAL_MS)
    }

    return () => {
      leaveChat(orderId)
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [orderId, isConnected, joinChat, leaveChat, loadMessages])

  useEffect(() => {
    const cleanup = onNewMessage((data) => {
      if (data.orderId === orderId) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id))
          if (ids.has(data.message.id)) return prev
          return [...prev, data.message]
        })
      }
    })

    return cleanup
  }, [orderId, onNewMessage])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()

    if (!newMessage.trim() || isSending) return

    const conteudo = newMessage.trim()
    setIsSending(true)
    try {
      if (isConnected) {
        sendSocketMessage(orderId, conteudo)
        setNewMessage('')
      } else {
        const { data } = await api.post(`/chat/${orderId}`, { content: conteudo })
        if (data?.message) {
          setMessages((prev) => [...prev, data.message])
        }
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-500 py-4">Carregando...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            Nenhuma mensagem ainda. Inicie a conversa!
            {!isConnected && (
              <p className="mt-2 text-xs text-amber-600">
                Modo: atualização automática a cada {POLL_INTERVAL_MS / 1000}s
              </p>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender.id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender.id === user?.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.sender.id !== user?.id && (
                  <p className={`text-xs font-medium mb-1 ${
                    message.sender.role === 'MASTER' ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {message.sender.name}
                    {message.sender.role === 'MASTER' && ' (Matriz)'}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? 'Digite sua mensagem...' : 'Digite (envio via HTTP)...'}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending}>
            {isSending ? '...' : 'Enviar'}
          </Button>
        </div>
      </form>
    </div>
  )
}
