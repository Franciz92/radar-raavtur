import { useState } from 'react'
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle2, MessageSquare, Sparkles, Clock } from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Salvar no Supabase
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      })

      if (error) throw error

      // Chamar Edge Function para enviar email
      try {
        await fetch('https://jcprdnatipbbwxiyewgg.supabase.co/functions/v1/resend-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } catch (fetchErr) {
        console.log('Edge function error (não bloqueia):', fetchErr)
      }

      setSent(true)
      toast.success('Mensagem enviada com sucesso!')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      console.error('Erro:', err)
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Atendimento Telefónico',
      detail: '+244 9330807200',
      subtext: 'Seg a Sex, 8h às 18h',
      href: 'tel:++244 932 297 004',
    },
    {
      icon: Mail,
      title: 'Suporte por Correio Eletrónico',
      detail: 'isemibeat@gmail.com',
      subtext: 'Resposta em menos de 24h',
      href: 'mailto:isemibeat@gmail.com',
    },
    {
      icon: MapPin,
      title: 'Sede Principal',
      detail: 'Luena, Angola',
      subtext: 'Disponível para reuniões presenciais',
      href: '#',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-16 transition-colors duration-300 relative overflow-hidden">
      {/* Background Orbs para efeito estético de profundidade */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Header da Página */}
        <div className="text-center max-w-2xl mx-auto mb-14 animate-slide-up">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Canais Oficiais
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-slate-900 via-primary-900 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Fale Connosco
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Tem alguma dúvida ou precisa de suporte? A nossa equipa está pronta para ajudar.
          </p>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Card de Informações de Contacto (4 Colunas) */}
          <div className="lg:col-span-5 space-y-4 animate-slide-up">
            {contactInfo.map((item, idx) => {
              const Icon = item.icon
              return (
                <a
                  key={idx}
                  href={item.href}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-sm hover:shadow-md hover:border-primary-500/40 dark:hover:border-primary-500/40 transition-all duration-300"
                >
                  <div className="p-3 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300 shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-0.5">
                      {item.title}
                    </h3>
                    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-1">
                      {item.detail}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 inline" />
                      {item.subtext}
                    </p>
                  </div>
                </a>
              )
            })}

            {/* Card extra de garantia de privacidade */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-900 to-slate-900 text-white shadow-xl relative overflow-hidden mt-6">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-500/20 rounded-full blur-xl" />
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-5 h-5 text-primary-400" />
                <h4 className="font-bold text-sm">Atendimento Personalizado</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Todas as solicitações enviadas através deste formulário são encriptadas e geridas pela nossa equipa com absoluta confidencialidade.
              </p>
            </div>
          </div>

          {/* Form / State de Sucesso (7 Colunas) */}
          <div className="lg:col-span-7 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up">
            {sent ? (
              <div className="text-center py-12 px-4 space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 ring-8 ring-emerald-500/5">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  Mensagem Enviada!
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Agradecemos o seu contacto. A nossa equipa irá analisar a sua mensagem e responderá num prazo máximo de 24 horas úteis.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="btn-secondary mt-6"
                >
                  Enviar nova mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                      Nome Completo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ex: Ana Silva"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="nome@exemplo.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="+244 9XX XXX XXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                      Assunto
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Qual é o motivo do contacto?"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Mensagem <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    className="input-field resize-none"
                    placeholder="Escreva a sua mensagem aqui com todos os detalhes..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-base shadow-lg shadow-primary-500/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>A enviar mensagem...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Enviar mensagem</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}