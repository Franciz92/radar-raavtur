import { Shield, Lock, Eye, FileText } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fdfaf4', padding: '50px 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #123C32, #071E18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Lock size={32} style={{ color: '#D4A72C' }} />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111315', marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Política de Privacidade
          </h1>
          <p style={{ color: '#777', fontSize: '14px' }}>Última atualização: Agosto 2026</p>
        </div>

        {[
          { title: '1. Dados Coletados', content: 'Nome, email, telefone, localização, dados de reservas e informações da empresa.' },
          { title: '2. Uso dos Dados', content: 'Para processar reservas, melhorar a plataforma e enviar comunicações relevantes.' },
          { title: '3. Partilha de Dados', content: 'Os dados são partilhados com as empresas prestadoras de serviços quando necessário para a reserva.' },
          { title: '4. Segurança', content: 'Utilizamos encriptação e medidas de segurança para proteger as suas informações.' },
          { title: '5. Direitos', content: 'Pode solicitar acesso, correção ou eliminação dos seus dados a qualquer momento.' },
        ].map((section, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#123C32', marginBottom: '10px' }}>{section.title}</h2>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}