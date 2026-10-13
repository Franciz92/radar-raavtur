import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  MapPin, Star, ArrowLeft, Phone, Mail, Globe, 
  Building2, Loader2, Calendar, Users, Award,
  Clock, Shield, CheckCircle, ChevronRight
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

export default function AgencyDetailPage() {
  const { id } = useParams()
  const [agency, setAgency] = useState(null)
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState([])

  useEffect(() => {
    loadAgency()
  }, [id])

  const loadAgency = async () => {
    setLoading(true)
    try {
      // Buscar agência
      const { data: agencyData, error: agencyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .in('status', ['approved', 'active'])
        .maybeSingle()

      if (agencyError) throw agencyError
      
      if (agencyData) {
        setAgency(agencyData)

        // Buscar serviços da agência
        const { data: servicesData, error: servicesError } = await supabase
          .from('company_services')
          .select('*')
          .eq('company_id', id)
          .in('status', ['active', 'approved'])
          .order('created_at', { ascending: false })

        if (servicesError) throw servicesError
        setServices(servicesData || [])
      } else {
        toast.error('Agência não encontrada')
      }
    } catch (error) {
      console.error('Erro ao carregar agência:', error)
      toast.error('Erro ao carregar agência')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  if (!agency) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Building2 size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
          Agência não encontrada
        </h2>
        <Link to="/agencias" className="text-primary-500 hover:text-primary-600 mt-2 inline-block">
          Voltar para agências
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header com imagem de capa */}
      <div className="relative h-64 bg-gradient-to-r from-primary-500 to-primary-600 overflow-hidden">
        {agency.cover_image ? (
          <img 
            src={agency.cover_image} 
            alt={agency.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 size={64} className="text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <Link to="/agencias" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition">
              <ArrowLeft size={16} /> Voltar para agências
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">{agency.name}</h1>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descrição */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Sobre a Agência
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {agency.description || 'Agência de viagens especializada em oferecer as melhores experiências e pacotes turísticos para Angola.'}
              </p>
            </div>

            {/* Serviços */}
            {services.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Serviços Oferecidos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {service.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                        {service.description}
                      </p>
                      {service.price > 0 && (
                        <p className="text-primary-500 font-bold mt-2">
                          Kz {service.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avaliações */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Avaliações
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star size={24} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold">{agency.rating || 4.5}</span>
                  <span className="text-gray-500">/ 5.0</span>
                </div>
                <span className="text-gray-500">({agency.reviews || 0} avaliações)</span>
              </div>
              <p className="text-gray-500 text-sm">Nenhuma avaliação disponível no momento.</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações de Contato */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Informações de Contato
              </h3>
              
              <div className="space-y-3">
                {agency.phone && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Phone size={18} className="text-primary-500 flex-shrink-0" />
                    <span>{agency.phone}</span>
                  </div>
                )}
                
                {agency.email && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Mail size={18} className="text-primary-500 flex-shrink-0" />
                    <span>{agency.email}</span>
                  </div>
                )}
                
                {agency.website && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Globe size={18} className="text-primary-500 flex-shrink-0" />
                    <a 
                      href={agency.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:text-primary-600"
                    >
                      {agency.website}
                    </a>
                  </div>
                )}
                
                {agency.address && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <MapPin size={18} className="text-primary-500 flex-shrink-0" />
                    <span>
                      {agency.address?.street && `${agency.address.street}, `}
                      {agency.address?.city && `${agency.address.city}, `}
                      {agency.address?.province || 'Angola'}
                    </span>
                  </div>
                )}
              </div>

              <Link
                to={`/contacto?agency=${agency.id}`}
                className="w-full mt-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition text-center block"
              >
                Contactar Agência
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}