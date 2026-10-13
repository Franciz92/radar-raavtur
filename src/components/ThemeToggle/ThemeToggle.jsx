import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ size = 'md', showLabel = false }) {
  const { theme, toggleTheme, isDark } = useTheme()

  const sizes = {
    sm: { button: 32, icon: 14 },
    md: { button: 38, icon: 18 },
    lg: { button: 44, icon: 22 },
  }

  const { button, icon } = sizes[size] || sizes.md

  // DEBUG: Verificar se o toggle está funcionando
  const handleToggle = () => {
    console.log('🔘 ThemeToggle clicado!', 'Tema atual:', theme)
    toggleTheme()
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px',
        width: button,
        height: button,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        justifyContent: 'center',
        alignItems: 'center',
        color: isDark ? 'rgba(255,255,255,0.7)' : '#555',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.target.style.borderColor = '#D4A72C'
        e.target.style.color = '#D4A72C'
        e.target.style.transform = 'scale(1.05)'
      }}
      onMouseLeave={(e) => {
        e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
        e.target.style.color = isDark ? 'rgba(255,255,255,0.7)' : '#555'
        e.target.style.transform = 'scale(1)'
      }}
    >
      {/* Animação de transição */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '12px',
          background: isDark 
            ? 'radial-gradient(circle at 30% 30%, rgba(212,167,44,0.1), transparent 70%)'
            : 'radial-gradient(circle at 30% 30%, rgba(122,24,48,0.08), transparent 70%)',
          transition: 'all 0.6s',
          opacity: 0.5,
        }}
      />
      
      {isDark ? (
        <Sun 
          size={icon} 
          style={{ 
            position: 'relative',
            zIndex: 1,
            transform: 'rotate(0deg)',
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      ) : (
        <Moon 
          size={icon} 
          style={{ 
            position: 'relative',
            zIndex: 1,
            transform: 'rotate(0deg)',
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      )}

      {showLabel && (
        <span style={{ fontSize: '12px', fontWeight: 600, position: 'relative', zIndex: 1 }}>
          {isDark ? 'Claro' : 'Escuro'}
        </span>
      )}
    </button>
  )
}