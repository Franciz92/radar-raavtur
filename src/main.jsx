// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import './styles/index.css';

// ============================================
// CONFIGURAÇO DO TEMA
// ============================================

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('ravtur-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return isDark;
};

const isDark = getInitialTheme();

// ============================================
// TOAST CONFIGURAÇO
// ============================================

const toastConfig = {
  position: 'top-right',
  toastOptions: {
    duration: 4000,
    style: {
      borderRadius: '12px',
      padding: '14px 18px',
      fontSize: '14px',
      fontWeight: '500',
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#0f172a',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
      boxShadow: isDark 
        ? '0 20px 60px rgba(0,0,0,0.5)' 
        : '0 20px 60px rgba(0,0,0,0.08)',
    },
    success: {
      style: {
        background: isDark ? '#065f46' : '#ecfdf5',
        color: isDark ? '#a7f3d0' : '#065f46',
        border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.2)',
      },
      icon: '✅',
    },
    error: {
      style: {
        background: isDark ? '#7f1d1d' : '#fef2f2',
        color: isDark ? '#fca5a5' : '#991b1b',
        border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(239,68,68,0.2)',
      },
      icon: '❌',
    },
    loading: {
      style: {
        background: isDark ? '#1e293b' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#0f172a',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
      },
    },
  },
};

// ============================================
// RENDERIZAÇO DA APLICAÇO
// ============================================

console.log('🚀 Iniciando Radar RAVTUR...');
console.log(`🎨 Tema: ${isDark ? '🌙 Dark' : '☀️ Light'}`);
console.log(`📱 Ambiente: ${import.meta.env.MODE}`);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <App />
            <Toaster {...toastConfig} />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);