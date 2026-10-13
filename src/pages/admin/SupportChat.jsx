import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, MessageCircle, Users } from 'lucide-react'

export default function SupportChat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, from: 'user', text: 'Olá! Preciso de ajuda.', time: '10:30' },
    { id: 2, from: 'admin', text: 'Claro! Como posso ajudar?', time: '10:32' },
  ])

  const handleSend = () => {
    if (!message.trim()) return
    setMessages([
      ...messages,
      { id: messages.length + 1, from: 'admin', text: message, time: new Date().toLocaleTimeString() }
    ])
    setMessage('')
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="p-2 rounded-xl hover:bg-gray-100 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suporte ao Cliente</h1>
          <p className="text-sm text-gray-500">Atendimento em tempo real</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="grid lg:grid-cols-4 h-[600px]">
          {/* Lista de Clientes */}
          <div className="border-r border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Users size={16} /> Clientes
            </h3>
            <div className="space-y-2">
              {['João Silva', 'Maria Santos', 'Pedro Costa'].map((name) => (
                <div key={name} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition">
                  <p className="font-medium text-sm">{name}</p>
                  <p className="text-xs text-gray-400">Última mensagem...</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="font-semibold">João Silva</p>
              <p className="text-xs text-green-500">🟢 Online</p>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl ${msg.from === 'admin' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 rounded-bl-none shadow-sm'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <span className={`text-xs mt-1 block ${msg.from === 'admin' ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}