import { useState } from 'react'
import { Globe, Check } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function LanguageSelector() {
  const { language, changeLanguage } = useLanguage()
  const [show, setShow] = useState(false)

  const languages = [
    { code: 'pt', label: 'Português', flag: '🇦🇴' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ]

  const currentLanguage = languages.find(l => l.code === language)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShow(!show)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 12px', borderRadius: '10px',
          border: '1.5px solid #e0d8cc', background: 'white',
          cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          color: '#555', transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.target.style.borderColor = '#7A1830' }}
        onMouseLeave={(e) => { e.target.style.borderColor = '#e0d8cc' }}
      >
        <Globe size={16} />
        <span>{currentLanguage?.flag}</span>
        <span>{currentLanguage?.label}</span>
      </button>

      {show && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setShow(false)} />
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: '180px', background: 'white', borderRadius: '14px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            zIndex: 100, overflow: 'hidden', padding: '6px',
          }}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code)
                  setShow(false)
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  border: 'none', background: language === lang.code ? 'rgba(122,24,48,0.05)' : 'transparent',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                  color: language === lang.code ? '#7A1830' : '#555',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{lang.label}</span>
                {language === lang.code && <Check size={16} style={{ color: '#7A1830' }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}