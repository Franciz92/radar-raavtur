// src/pages/public/CompanyServicesPublicPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Loader2, ArrowLeft, Star, Clock, Users, DollarSign } from 'lucide-react';
import { companyService } from '../../services/companyService';
import { hotelManagementService } from '../../services/hotelManagementService';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

export default function CompanyServicesPublicPage() {
  const { id } = useParams();
  const { isEn } = useLanguage();
  const [company, setCompany] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const companyResult = await companyService.getCompanyById(id);
      if (companyResult.success) {
        setCompany(companyResult.data);
      }

      const servicesResult = await hotelManagementService.getServicesByCompany(id);
      if (servicesResult.success) {
        setServices(servicesResult.data || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error(isEn ? 'Error loading data' : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const activeServices = services.filter(s => s.status === 'active' || s.status === 'approved');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Link to={`/empresa/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={18} />
        {isEn ? 'Back to Company' : 'Voltar para Empresa'}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {company?.name} - {isEn ? 'Services' : 'Serviços'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {activeServices.length} {isEn ? 'services available' : 'serviços disponíveis'}
        </p>

        {activeServices.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">{isEn ? 'No services available' : 'Nenhum serviço disponível'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {activeServices.map((service) => (
              <Link
                key={service.id}
                to={`/servico/${service.id}`}
                className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 hover:shadow-md transition border border-gray-200 dark:border-gray-700"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                {service.category && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {service.category}
                  </span>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  {service.price > 0 && (
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {service.price.toLocaleString()} Kz
                    </span>
                  )}
                  {service.duration && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {service.duration}
                    </span>
                  )}
                  {service.capacity > 0 && (
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {service.capacity}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}