import { useState, useEffect, useRef } from 'react'
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

export default function ChatBox({ orderId }: ChatBoxProps) {
  const { user } = useAuth()
  const { joinChat, leaveChat, sendMessage: sendSocketMessage, onNewMessage } = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
    joinChat(orderId)

    return () => {
      leaveChat(orderId)
    }
  }, [orderId])

  useEffect(() => {
    const cleanup = onNewMessage((data) => {
      if (data.orderId === orderId) {
        setMessages((prev) => [...prev, data.message])
      }
    })

    return cleanup
  }, [orderId, onNewMessage])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadMessages() {
    try {
      const { data } = await api.get(`/chat/${orderId}`)
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()

    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      sendSocketMessage(orderId, newMessage.trim())
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-500 py-4">Carregando...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            Nenhuma mensagem ainda. Inicie a conversa!
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

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
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
