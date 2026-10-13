// src/pages/public/RestaurantsPage.jsx
import { useState, useEffect } from 'react';
import { usePublicBusiness } from '../../context/PublicBusinessContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { MapPin, Star, Phone, Mail, Utensils, Search } from 'lucide-react';

export default function RestaurantsPage() {
  const { restaurants, loading, refreshCategory } = usePublicBusiness();
  const { isEn } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  useEffect(() => {
    refreshCategory('restaurant');
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProvince = !selectedProvince || restaurant.province === selectedProvince;
    return matchSearch && matchProvince;
  });

  const provinces = [...new Set(restaurants.map(r => r.province).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Utensils className="w-8 h-8 text-primary-500" />
          {isEn ? 'Restaurants' : 'Restaurantes'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {isEn 
            ? `Discover the best restaurants in Angola (${filteredRestaurants.length} available)`
            : `Descubra os melhores restaurantes em Angola (${filteredRestaurants.length} disponíveis)`}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search restaurants...' : 'Buscar restaurantes...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        
        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-w-[180px]"
        >
          <option value="">{isEn ? 'All Provinces' : 'Todas Províncias'}</option>
          {provinces.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <Utensils className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isEn ? 'No restaurants found' : 'Nenhum restaurante encontrado'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'Try adjusting your search' : 'Tente ajustar sua busca'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              to={`/negocio/${restaurant.id}`}
              className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
            >
              <div className="h-48 relative overflow-hidden bg-gray-200 dark:bg-gray-700">
                {restaurant.cover_image ? (
                  <img
                    src={restaurant.cover_image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-red-500/20">
                    <Utensils className="w-16 h-16 text-primary-500/40" />
                  </div>
                )}
                {restaurant.is_verified && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {isEn ? 'Verified' : 'Verificado'}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition">
                  {restaurant.name}
                </h3>
                {restaurant.province && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {restaurant.province}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                  {restaurant.description || (isEn ? 'No description' : 'Sem descrição')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {restaurant.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {restaurant.phone}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}