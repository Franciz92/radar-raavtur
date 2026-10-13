import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Shield, User, Mail, Lock, Key, ArrowLeft, 
  CheckCircle, AlertCircle, Sparkles, Eye, EyeOff
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

export default function AdminRegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secretCode, setSecretCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const ADMIN_SECRET = 'RAVTUR-ADMIN-2026'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (secretCode !== ADMIN_SECRET) {
      setError('Código de administrador inválido!')
      toast.error('Código inválido')
      return
    }
    if (password.length < 6) {
      setError('Password mínimo 6 caracteres')
      return
    }
    
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, role: 'admin' } },
      })
      if (error) throw error
      
      toast.success('Administrador criado com sucesso!')
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Erro ao criar admin')
      toast.error('Erro ao criar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #0f1115 0%, #1a1020 50%, #0f1115 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Padrão decorativo */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L55 30 L30 55 L5 30Z' fill='none' stroke='%23D4A72C' stroke-width='0.3' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }} />

      {/* Gradiente decorativo */}
      <div style={{
        position: 'absolute', top: '-200px', right: '-200px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,167,44,0.12) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-200px', left: '-200px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(122,24,48,0.12) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '440px', width: '100%' }}>
        
        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #D4A72C, #9A6C12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 40px rgba(212,167,44,0.35)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '6px', left: '6px', right: '6px',
              height: '2px', background: 'linear-gradient(90deg, transparent, white, transparent)',
            }} />
            <Shield size={32} style={{ color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '26px', fontWeight: 800, color: 'white',
            marginBottom: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            Registo Administrador
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Acesso restrito — código obrigatório
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px', padding: '30px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          
          {/* Badge de segurança */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(212,167,44,0.08)', marginBottom: '16px',
          }}>
            <AlertCircle size={14} style={{ color: '#9A6C12', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: '#9A6C12', fontWeight: 500 }}>
              Este formulário é exclusivo para administradores da plataforma
            </span>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(220,38,38,0.06)', marginBottom: '14px',
              border: '1px solid rgba(220,38,38,0.2)',
            }}>
              <AlertCircle size={14} style={{ color: '#dc2626', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Nome */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '5px' }}>
                Nome completo
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#b0a590' }} />
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '38px' }} placeholder="Admin RAVTUR" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '5px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#b0a590' }} />
                <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px' }} placeholder="admin@ravtur.ao" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '5px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#b0a590' }} />
                <input type={showPassword ? 'text' : 'password'} className="input-field" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px', paddingRight: '38px' }} placeholder="••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#b0a590' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Código Secreto */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '5px' }}>
                Código de administrador
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#D4A72C' }} />
                <input type="password" className="input-field" value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  style={{ paddingLeft: '38px', borderColor: 'rgba(212,167,44,0.3)' }} placeholder="••••••••" required />
              </div>
            </div>

            {/* Botão */}
            <button type="submit" disabled={loading} className="btn-primary"
              style={{
                width: '100%', padding: '14px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontSize: '14px', marginTop: '4px',
                background: 'linear-gradient(135deg, #D4A72C, #9A6C12)',
              }}>
              {loading ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Criando...
                </>
              ) : (
                <>
                  <Shield size={16} /> Criar Admin
                </>
              )}
            </button>
          </form>

          {/* Voltar */}
          <Link to="/login" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            marginTop: '14px', fontSize: '12px', color: '#777', textDecoration: 'none',
          }}>
            <ArrowLeft size={13} /> Voltar ao login
          </Link>
        </div>

        {/* Rodapé */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '6px', marginTop: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.4)',
        }}>
          <CheckCircle size={12} style={{ color: '#22c55e' }} />
          Acesso protegido
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}