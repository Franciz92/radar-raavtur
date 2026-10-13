// src/components/company/CompanyCard.jsx

import { Link } from 'react-router-dom';
import { Building2, MapPin, Star, Users, Briefcase, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function CompanyCard({ company, isEn }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(price || 0);
  };

  // Calcular média de avaliações (se houver)
  const averageRating = company.rating || 0;
  const totalReviews = company.total_reviews || 0;

  return (
    <Link
      to={`/empresa/${company.id}`}
      className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Imagem de capa */}
      <div className="relative h-48 overflow-hidden">
        {company.cover_image ? (
          <img
            src={company.cover_image}
            alt={company.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-amber-600 to-amber-400 flex items-center justify-center">
            <Building2 size={64} className="text-white/30" />
          </div>
        )}
        
        {/* Badge de verificação */}
        {company.is_verified && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Star size={12} className="fill-white" />
            {isEn ? 'Verified' : 'Verificado'}
          </div>
        )}

        {/* Badge de destaque (se tiver serviços em destaque) */}
        {company.is_featured && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            {isEn ? 'Featured' : 'Destaque'}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 border border-gray-200 dark:border-gray-600">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 size={24} className="text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
              {company.name}
            </h3>
            {company.category && (
              <span className="inline-block mt-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                {company.category}
              </span>
            )}
          </div>

          {/* Avaliação */}
          {averageRating > 0 && (
            <div className="flex items-center gap-1 text-sm flex-shrink-0">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {averageRating.toFixed(1)}
              </span>
              {totalReviews > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({totalReviews})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Descrição */}
        {company.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {company.description}
          </p>
        )}

        {/* Informações adicionais */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          {company.province && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {company.province}
            </span>
          )}
          {company.services_count > 0 && (
            <span className="flex items-center gap-1">
              <Briefcase size={14} />
              {company.services_count} {isEn ? 'services' : 'serviços'}
            </span>
          )}
          {company.address && (
            <span className="flex items-center gap-1 truncate max-w-[150px]">
              <MapPin size={14} />
              {company.address}
            </span>
          )}
        </div>

        {/* Botão de ação */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end">
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 flex items-center gap-1">
            {isEn ? 'View Company' : 'Ver Empresa'}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}