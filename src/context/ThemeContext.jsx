import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Carregar tema do localStorage ou usar 'light' como padrão
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved || 'light'
  })

  // Aplicar tema ao HTML e salvar no localStorage
  useEffect(() => {
    const root = document.documentElement
    
    // Remover classes anteriores
    root.classList.remove('light', 'dark')
    
    // Adicionar classe do tema atual
    root.classList.add(theme)
    
    // Salvar no localStorage
    localStorage.setItem('theme', theme)
    
    // Forçar atualização de componentes
    root.style.colorScheme = theme
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }
  return context
}

export default ThemeContext