import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  User, Mail, Lock, Phone, MapPin, Eye, EyeOff, 
  ArrowRight, Compass, Building2, CheckCircle, ShieldCheck,
  Briefcase, ChevronDown
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { provinces } from '../../constants/provinces'
import toast from 'react-hot-toast'

const countries = [
  { code: 'AO', name: 'Angola', dialCode: '+244' },
  { code: 'PT', name: 'Portugal', dialCode: '+351' },
  { code: 'BR', name: 'Brasil', dialCode: '+55' },
  { code: 'ZA', name: 'África do Sul', dialCode: '+27' },
  { code: 'GB', name: 'Reino Unido', dialCode: '+44' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1' },
  { code: 'FR', name: 'França', dialCode: '+33' },
  { code: 'DE', name: 'Alemanha', dialCode: '+49' },
  { code: 'ES', name: 'Espanha', dialCode: '+34' },
  { code: 'IT', name: 'Itália', dialCode: '+39' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'NG', name: 'Nigéria', dialCode: '+234' },
]

const FlagIcon = ({ countryCode, size = 22 }) => (
  <img 
    src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
    alt={countryCode}
    style={{ width: `${size}px`, height: `${Math.round(size * 0.67)}px`, borderRadius: '3px', objectFit: 'cover' }}
    onError={(e) => { e.target.style.display = 'none' }}
  />
)

const companyTypes = [
  'Agência de viagens', 'Operadora turística', 'Hotel', 'Resort',
  'Pousada', 'Alojamento turístico', 'Restaurante',
  'Empresa de transporte turístico', 'Rent-a-car', 'Guia turístico',
  'Agência de eventos', 'Empresa de excursões', 'Outro',
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState('user')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+244')
  const [nationality, setNationality] = useState('AO')
  const [location, setLocation] = useState('')
  const [isForeigner, setIsForeigner] = useState(false)
  const [companyType, setCompanyType] = useState('')
  const [companyNif, setCompanyNif] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    if (password !== confirmPassword) {
      toast.error('As palavras-passe não coincidem')
      return
    }
    if (password.length < 6) {
      toast.error('Mínimo 6 caracteres')
      return
    }
    setLoading(true)
    try {
      const fullPhone = countryCode + ' ' + phone
      await register({ 
        name, email, password, phone: fullPhone, location, role: userType,
        company_type: companyType,
        company_nif: companyNif,
        company_description: companyDescription,
      })
      toast.success('Conta criada com sucesso!')
      
      // Se for empresa, redirecionar para cadastro completo
      if (userType === 'company') {
        navigate('/empresa/cadastro')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = { fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }

  // PASSO 1
  if (step === 1) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #0f1115 0%, #1a1020 50%, #0f1115 100%)',
      }}>
        <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <div style={{ marginBottom: '36px' }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '22px',
              background: 'linear-gradient(135deg, #7A1830, #3D0C19)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Compass size={36} style={{ color: '#D4A72C' }} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginBottom: '6px' }}>
              {t('register')}
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              Escolha o tipo de conta
            </p>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <button onClick={() => { setUserType('user'); setStep(2) }}
              style={{
                width: '100%', padding: '24px 28px', borderRadius: '20px',
                border: userType === 'user' ? '2px solid #D4A72C' : '2px solid rgba(255,255,255,0.1)',
                background: userType === 'user' ? 'rgba(212,167,44,0.08)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '18px',
              }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #7A1830, #3D0C19)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={26} style={{ color: '#D4A72C' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Turista</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Explore destinos e reserve experiências</p>
              </div>
              <ArrowRight size={20} style={{ color: '#D4A72C' }} />
            </button>

            <button onClick={() => { setUserType('company'); setStep(2) }}
              style={{
                width: '100%', padding: '24px 28px', borderRadius: '20px',
                border: userType === 'company' ? '2px solid #D4A72C' : '2px solid rgba(255,255,255,0.1)',
                background: userType === 'company' ? 'rgba(212,167,44,0.08)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '18px',
              }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #123C32, #071E18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={26} style={{ color: '#D4A72C' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Empresa</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  Cadastro completo com verificação
                </p>
              </div>
              <ArrowRight size={20} style={{ color: '#D4A72C' }} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // PASSO 2
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #0f1115 0%, #1a1020 50%, #0f1115 100%)',
    }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
            {userType === 'company' ? 'Registar empresa' : t('register')}
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            {userType === 'company' ? 'Cadastro completo em 10 etapas' : 'Preencha os seus dados'}
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.95)', borderRadius: '24px', padding: '28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div>
              <label style={labelStyle}>{userType === 'company' ? 'Nome da empresa' : 'Nome completo'} *</label>
              <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label style={labelStyle}>{t('email')} *</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>{t('password')} *</label>
                <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div>
                <label style={labelStyle}>Confirmar *</label>
                <input type="password" className="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>

            {/* NACIONALIDADE */}
            <div>
              <label style={labelStyle}>Nacionalidade</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                  <FlagIcon countryCode={nationality} />
                </div>
                <select className="input-field" value={nationality} onChange={(e) => {
                  setNationality(e.target.value)
                  setIsForeigner(e.target.value !== 'AO')
                  const country = countries.find(c => c.code === e.target.value)
                  if (country) setCountryCode(country.dialCode)
                }} style={{ paddingLeft: '46px' }}>
                  {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* TELEFONE */}
            <div>
              <label style={labelStyle}>{t('phone')}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                    <FlagIcon countryCode={nationality} size={18} />
                  </div>
                  <select className="input-field" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                    style={{ width: '100px', paddingLeft: '36px', fontSize: '12px' }}>
                    {countries.map(c => <option key={c.code} value={c.dialCode}>{c.dialCode}</option>)}
                  </select>
                </div>
                <input type="tel" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="9XX XXX XXX" style={{ flex: 1 }} />
              </div>
            </div>

            {/* CAMPOS ESPECÍFICOS PARA EMPRESA */}
            {userType === 'company' && (
              <>
                <div>
                  <label style={labelStyle}>Tipo de empresa *</label>
                  <select className="input-field" value={companyType} onChange={(e) => setCompanyType(e.target.value)} required>
                    <option value="">Selecione o tipo</option>
                    {companyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>NIF *</label>
                  <input className="input-field" value={companyNif} onChange={(e) => setCompanyNif(e.target.value)}
                    placeholder="Número de Identificação Fiscal" required />
                </div>

                <div>
                  <label style={labelStyle}>Descrição da empresa</label>
                  <textarea className="input-field" rows={2} value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Descreva brevemente os serviços" />
                </div>

                <div style={{
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(212,167,44,0.08)', fontSize: '11px', color: '#9A6C12',
                }}>
                  Após criar a conta, poderá completar o cadastro detalhado com documentos e verificação.
                </div>
              </>
            )}

            {/* LOCALIZAÇO PARA ANGOLANOS */}
            {!isForeigner && userType === 'user' && (
              <div>
                <label style={labelStyle}>{t('province')}</label>
                <select className="input-field" value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="">{t('province')}</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', padding: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}>
              {loading ? 'Criando...' : <><CheckCircle size={16} /> {userType === 'company' ? 'Criar conta e continuar' : t('create')}</>}
            </button>
          </form>

          <button onClick={() => setStep(1)}
            style={{ width: '100%', marginTop: '12px', padding: '8px', border: 'none', background: 'transparent', color: '#777', fontSize: '12px', cursor: 'pointer' }}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}