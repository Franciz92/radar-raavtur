// src/components/common/Logo.jsx
// ============================================
// LOGO — Componente reutilizável
// ✅ Imagem: /images/Logotipo.png
// ✅ Fallback automático se a imagem falhar
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const LOGO_SRC = '/images/Logotipo.png';

export default function Logo({
  size = 'md',
  variant = 'auto',
  showText = false,
  to = '/',
  className = '',
  onClick,
}) {
  const [error, setError] = useState(false);

  const heights = {
    xs: 'h-8',
    sm: 'h-9 sm:h-10',
    md: 'h-10 sm:h-11',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
  };

  const textColors = {
    light: 'text-white',
    dark: 'text-slate-900',
    auto: 'text-slate-900 dark:text-white',
  };

  const height = heights[size] || heights.md;
  const textColor = textColors[variant] || textColors.auto;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`inline-flex items-center gap-2 sm:gap-3 group flex-shrink-0 ${className}`}
      aria-label="Radar RAAVTUR — Início"
    >
      {!error ? (
        <img
          src={LOGO_SRC}
          alt="Radar RAAVTUR"
          className={`${height} w-auto object-contain group-hover:scale-105 transition-transform duration-300`}
          onError={(e) => {
            console.error('❌ [Logo] Erro:', LOGO_SRC, '->', e.currentTarget.src);
            setError(true);
          }}
          onLoad={() => console.log('✅ [Logo] Carregado:', LOGO_SRC)}
        />
      ) : (
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-[#7FC0FA] flex items-center justify-center flex-shrink-0">
            <Compass size={20} className="text-[#174A3A]" strokeWidth={2.5} />
          </span>
          {showText && (
            <span className={`font-extrabold tracking-tight text-base ${textColor}`}>
              RAAVTUR
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
