import { Shield, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fdfaf4', padding: '50px 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #7A1830, #3D0C19)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <FileText size={32} style={{ color: '#D4A72C' }} />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111315', marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Termos e Condições
          </h1>
          <p style={{ color: '#777', fontSize: '14px' }}>
            Última atualização: Agosto 2026
          </p>
        </div>

        {/* Conteúdo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1 */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#7A1830', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} /> 1. Aceitação dos Termos
            </h2>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
              Ao aceder e utilizar a plataforma Radar RAVTUR, o utilizador concorda com estes Termos e Condições.
              Se não concordar com alguma parte, não deverá utilizar a plataforma.
            </p>
          </div>

          {/* 2 */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#7A1830', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} /> 2. Descrição do Serviço
            </h2>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
              O Radar RAVTUR é uma plataforma digital que conecta turistas a empresas de turismo em Angola,
              incluindo hotéis, restaurantes, agências de viagens, guias turísticos, transportes e experiências.
            </p>
          </div>

          {/* 3 */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#7A1830', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} /> 3. Registo de Conta
            </h2>
            <ul style={{ color: '#555', fontSize: '14px', lineHeight: 1.7, margin: 0, paddingLeft: '20px' }}>
              <li>O utilizador deve fornecer informações verdadeiras e completas</li>
              <li>É responsável por manter a confidencialidade da sua senha</li>
              <li>Deve notificar imediatamente qualquer uso não autorizado</li>
              <li>Empresas precisam de verificação documental</li>
            </ul>
          </div>

          {/* 4 */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#7A1830', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} /> 4. Reservas e Pagamentos
            </h2>
            <ul style={{ color: '#555', fontSize: '14px', lineHeight: 1.7, margin: 0, paddingLeft: '20px' }}>
              <li>As reservas são confirmadas após pagamento bem-sucedido</li>
              <li>A plataforma aplica comissão sobre as transações</li>
              <li>Cancelamentos seguem as políticas específicas de cada serviço</li>
              <li>Reembolsos são processados conforme as regras aplicáveis</li>
            </ul>
          </div>

          {/* 5 */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#7A1830', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} /> 5. Responsabilidades
            </h2>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
              O Radar RAVTUR atua como intermediário entre utilizadores e empresas.
              As empresas são responsáveis pela qualidade dos serviços prestados.
            </p>
          </div>

          {/* 6 */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#7A1830', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} /> 6. Proteção de Dados
            </h2>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
              Os dados pessoais são protegidos conforme a legislação angolana.
              Consulte a Política de Privacidade para mais detalhes.
            </p>
          </div>

          {/* Aviso */}
          <div style={{
            background: 'rgba(212,167,44,0.06)', borderRadius: '16px',
            padding: '20px', border: '1px solid rgba(212,167,44,0.2)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <AlertCircle size={20} style={{ color: '#9A6C12', flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: '#9A6C12', margin: 0 }}>
              Para questões legais, contacte-nos através do email kinvestesol@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}