import { useState } from 'react'
import { CreditCard, Phone, QrCode, Loader2, CheckCircle, XCircle, Clock, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MulticaixaExpress({ amount, serviceName, onSuccess, onCancel }) {
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState('phone')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('pending') // pending | processing | confirmed | failed
  const [reference, setReference] = useState('')

  const generateReference = () => {
    const ref = `MCX-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    setReference(ref)
    return ref
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    
    if (method === 'phone' && !phone) {
      toast.error('Digite o número de telemóvel')
      return
    }
    
    setLoading(true)
    setStatus('processing')
    
    try {
      // Simulação — futuramente integrar com API real do Multicaixa Express
      const ref = generateReference()
      
      await new Promise((resolve) => setTimeout(resolve, 3000))
      
      setStatus('confirmed')
      toast.success('Pagamento confirmado com sucesso!')
      onSuccess?.(ref)
    } catch (err) {
      setStatus('failed')
      toast.error('Falha no pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'confirmed') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <CheckCircle size={70} style={{ color: '#22c55e', marginBottom: '20px' }} />
        <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111315', marginBottom: '8px' }}>
          Pagamento Confirmado!
        </h3>
        <p style={{ color: '#777', marginBottom: '24px' }}>
          A sua reserva foi concluída com sucesso.
        </p>
        <p style={{ fontSize: '13px', color: '#999' }}>
          Referência: {reference}
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '30px 20px' }}>
      {/* Cabeçalho */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '18px',
          background: 'linear-gradient(135deg, #7A1830, #3D0C19)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <CreditCard size={30} style={{ color: '#D4A72C' }} />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111315', marginBottom: '4px' }}>
          Multicaixa Express
        </h3>
        <p style={{ fontSize: '14px', color: '#777' }}>{serviceName}</p>
      </div>

      {/* Valor */}
      <div style={{
        textAlign: 'center', padding: '20px',
        background: 'rgba(122, 24, 48, 0.03)', borderRadius: '16px',
        marginBottom: '24px',
      }}>
        <p style={{ fontSize: '13px', color: '#777', marginBottom: '4px' }}>Valor a pagar</p>
        <p style={{ fontSize: '32px', fontWeight: 800, color: '#7A1830', margin: 0 }}>
          {amount.toLocaleString()} Kz
        </p>
      </div>

      {/* Seletor de método */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
        marginBottom: '24px',
      }}>
        <button
          onClick={() => setMethod('phone')}
          style={{
            padding: '16px', borderRadius: '14px',
            border: method === 'phone' ? '2px solid #7A1830' : '2px solid #e0d8cc',
            background: method === 'phone' ? 'rgba(122, 24, 48, 0.05)' : 'white',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '8px', transition: 'all 0.2s',
          }}>
          <Phone size={24} style={{ color: method === 'phone' ? '#7A1830' : '#999' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: method === 'phone' ? '#7A1830' : '#555' }}>
            Telemóvel
          </span>
        </button>

        <button
          onClick={() => setMethod('qr')}
          style={{
            padding: '16px', borderRadius: '14px',
            border: method === 'qr' ? '2px solid #7A1830' : '2px solid #e0d8cc',
            background: method === 'qr' ? 'rgba(122, 24, 48, 0.05)' : 'white',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '8px', transition: 'all 0.2s',
          }}>
          <QrCode size={24} style={{ color: method === 'qr' ? '#7A1830' : '#999' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: method === 'qr' ? '#7A1830' : '#555' }}>
            QR Code
          </span>
        </button>
      </div>

      {/* Formulário */}
      {method === 'phone' ? (
        <form onSubmit={handlePayment}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>
            Número de telemóvel
          </label>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Phone size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#b0a590' }} />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+244 9XX XXX XXX"
              className="input-field"
              style={{ paddingLeft: '42px' }}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard size={20} /> Pagar agora
              </>
            )}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '180px', height: '180px', margin: '0 auto 16px',
            border: '3px dashed #d0c8b8', borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'white',
          }}>
            <QrCode size={120} style={{ color: '#7A1830' }} />
          </div>
          <p style={{ fontSize: '13px', color: '#777' }}>
            Escaneie o código QR com a aplicação Multicaixa Express
          </p>
          <button onClick={handlePayment} disabled={loading} className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 700, marginTop: '16px' }}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Já efetuei o pagamento'}
          </button>
        </div>
      )}

      {/* Rodapé */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '8px', marginTop: '16px', fontSize: '12px', color: '#b0a590',
      }}>
        <Shield size={14} style={{ color: '#22c55e' }} />
        Pagamento seguro protegido
      </div>
    </div>
  )
}