// src/pages/public/BusinessDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicBusiness } from '../../context/PublicBusinessContext';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Phone, Mail, Globe, Star, Building2, ArrowLeft, Share2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BusinessDetailPage() {
  const { id } = useParams();
  const { getBusinessById, loading } = usePublicBusiness();
  const { isEn } = useLanguage();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBusiness = async () => {
      setIsLoading(true);
      try {
        const data = getBusinessById(id);
        setBusiness(data);
      } catch (error) {
        console.error('Erro ao carregar empresa:', error);
        toast.error(isEn ? 'Error loading business' : 'Erro ao carregar empresa');
      } finally {
        setIsLoading(false);
      }
    };
    loadBusiness();
  }, [id, getBusinessById]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
        <Building2 className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEn ? 'Business not found' : 'Empresa não encontrada'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {isEn 
            ? 'The business you are looking for does not exist or may have been removed.'
            : 'A empresa que você está procurando não existe ou pode ter sido removida.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {isEn ? 'Go Home' : 'Voltar ao Início'}
        </Link>
      </div>
    );
  }

  const categoryLabels = {
    pt: {
      hotel: 'Hotel',
      restaurant: 'Restaurante',
      agency: 'Agência de Viagens',
      rent_a_car: 'Rent-a-Car',
      guide: 'Guia Turístico',
      transport: 'Transporte',
      tour: 'Passeio/Atividade',
      event: 'Evento',
      other: 'Outro Serviço'
    },
    en: {
      hotel: 'Hotel',
      restaurant: 'Restaurant',
      agency: 'Travel Agency',
      rent_a_car: 'Rent-a-Car',
      guide: 'Tour Guide',
      transport: 'Transport',
      tour: 'Tour/Activity',
      event: 'Event',
      other: 'Other Service'
    }
  };

  const category = isEn ? categoryLabels.en[business.category] : categoryLabels.pt[business.category];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Link
        to={`/${business.category}s`}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {isEn ? 'Back' : 'Voltar'}
      </Link>

      {/* Banner */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-r from-primary-500/30 to-primary-600/30">
        {business.cover_image ? (
          <img
            src={business.cover_image}
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-24 h-24 text-primary-500/40" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full text-sm font-medium">
            {category}
          </span>
          {business.is_verified && (
            <span className="px-3 py-1 bg-green-500/80 backdrop-blur-sm text-white rounded-full text-sm font-medium flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              {isEn ? 'Verified' : 'Verificado'}
            </span>
          )}
        </div>

        {/* Logo */}
        {business.logo_url && (
          <div className="absolute -bottom-8 left-8 w-24 h-24 rounded-xl bg-white dark:bg-gray-800 shadow-lg border-4 border-white dark:border-gray-800 overflow-hidden">
            <img
              src={business.logo_url}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="mt-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {business.name}
            </h1>
            {business.province && (
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {business.province}
                {business.address && `, ${business.address}`}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success(isEn ? 'Link copied!' : 'Link copiado!');
              }}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <Share2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
              <Heart className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-red-500 transition" />
            </button>
          </div>
        </div>

        {/* Descrição */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isEn ? 'About' : 'Sobre'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {business.full_description || business.description || (isEn ? 'No description available' : 'Sem descrição disponível')}
          </p>
        </div>

        {/* Contato */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isEn ? 'Contact Information' : 'Informações de Contato'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition"
              >
                <Phone className="w-5 h-5" />
                {business.phone}
              </a>
            )}
            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition"
              >
                <Mail className="w-5 h-5" />
                {business.email}
              </a>
            )}
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition"
              >
                <Globe className="w-5 h-5" />
                {business.website}
              </a>
            )}
            {business.address && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <MapPin className="w-5 h-5" />
                {business.address}
              </div>
            )}
          </div>
        </div>

        {/* Galeria */}
        {business.gallery && business.gallery.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Gallery' : 'Galeria'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {business.gallery.map((image, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img
                    src={image}
                    alt={`${business.name} - ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}