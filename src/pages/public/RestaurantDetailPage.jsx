// src/pages/public/RestaurantDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import {
  MapPin,Star,Loader2,ArrowLeft,Clock,Heart,Share2,Calendar,Info,AlertCircle,Phone,Mail,ExternalLink,
  Utensils,DollarSign,Plus,Minus,ShoppingCart,CreditCard,X,CheckCircle,Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE DE MODAL DE PEDIDO
// ============================================

const OrderModal = ({ isOpen, onClose, dish, restaurant, onOrder }) => {
  const { isEn } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !dish) return null;

  const totalPrice = dish.price * quantity;

  const handleSubmit = async () => {
    if (quantity < 1) {
      toast.error(isEn ? 'Please select at least 1' : 'Selecione pelo menos 1');
      return;
    }
    if (!paymentMethod) {
      toast.error(isEn ? 'Please select a payment method' : 'Selecione um método de pagamento');
      return;
    }

    setLoading(true);
    try {
      await onOrder({
        dishId: dish.id,
        dishName: dish.name,
        quantity,
        totalPrice,
        paymentMethod,
        notes,
      });
      onClose();
    } catch (error) {
      console.error('❌ Erro ao fazer pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEn ? 'Order Dish' : 'Pedir Prato'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Dish Info */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              {dish.image_url ? (
                <img
                  src={dish.image_url}
                  alt={dish.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <Utensils size={24} className="text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{dish.name}</h3>
                <p className="text-sm text-gray-500">{dish.description}</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {dish.price.toLocaleString()} Kz
                </p>
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Quantity' : 'Quantidade'}
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-xl font-bold"
              >
                <Minus size={16} />
              </button>
              <span className="text-xl font-semibold min-w-[40px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-xl font-bold"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Payment Method' : 'Método de Pagamento'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['multicaixa', 'card', 'cash', 'transfer'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-xl border-2 transition ${
                    paymentMethod === method
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">
                    {method === 'multicaixa' && '🏦'}
                    {method === 'card' && '💳'}
                    {method === 'cash' && '💰'}
                    {method === 'transfer' && '🏛️'}
                  </span>
                  <p className="text-xs capitalize mt-1">
                    {method === 'multicaixa' && 'Multicaixa'}
                    {method === 'card' && 'Cartão'}
                    {method === 'cash' && 'Dinheiro'}
                    {method === 'transfer' && 'Transferência'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Notes (optional)' : 'Observações (opcional)'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isEn ? 'Any special requests?' : 'Alguma solicitação especial?'}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Total */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">{isEn ? 'Total' : 'Total'}</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalPrice.toLocaleString()} Kz
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !paymentMethod}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <ShoppingCart size={20} />
                  {isEn ? 'Order Now' : 'Pedir Agora'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE PRATO
// ============================================

const DishCard = ({ dish, onOrder, isEn }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-200 dark:border-gray-700">
      <div className="relative h-40 overflow-hidden">
        {dish.image_url ? (
          <img
            src={dish.image_url}
            alt={dish.name}
            className="w-full h-full object-cover hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-300 dark:from-orange-900 dark:to-orange-700 flex items-center justify-center">
            <Utensils size={40} className="text-white/50" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
          {dish.price.toLocaleString()} Kz
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white">{dish.name}</h4>
        {dish.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {dish.description}
          </p>
        )}
        {dish.category && (
          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full mt-2 inline-block">
            {dish.category}
          </span>
        )}
        <button
          onClick={() => onOrder(dish)}
          className="w-full mt-3 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          {isEn ? 'Order' : 'Pedir'}
        </button>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isEn } = useLanguage();
  
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    loadRestaurantData();
  }, [id]);

  // ============================================
  // CARREGAR DADOS DO RESTAURANTE
  // ============================================
  const loadRestaurantData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando restaurante:', id);
      
      // 1. Buscar restaurante
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .eq('category', 'restaurant')
        .in('status', ['approved', 'active'])
        .single();
      
      if (restaurantError) {
        console.error('❌ Erro ao buscar restaurante:', restaurantError);
        throw restaurantError;
      }
      
      if (!restaurantData) {
        setError(isEn ? 'Restaurant not found' : 'Restaurante não encontrado');
        setLoading(false);
        return;
      }
      
      console.log('✅ Restaurante encontrado:', restaurantData.name);
      setRestaurant(restaurantData);

      // 2. Buscar pratos do restaurante
      const { data: dishesData, error: dishesError } = await supabase
        .from('restaurant_dishes')
        .select('*')
        .eq('restaurant_id', id)
        .eq('status', 'active')
        .order('category', { ascending: true });

      if (!dishesError && dishesData) {
        setDishes(dishesData);
        console.log('🍽️ Pratos carregados:', dishesData.length);
      }

      // 3. Verificar favorito
      if (isAuthenticated && user) {
        const { data: favData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('item_id', id)
          .eq('item_type', 'restaurant')
          .maybeSingle();
        setIsFavorite(!!favData);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar restaurante:', error);
      setError(error.message || (isEn ? 'Error loading restaurant' : 'Erro ao carregar restaurante'));
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // TOGGLE FAVORITO
  // ============================================
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error(isEn ? 'Login to favorite' : 'Faça login para favoritar');
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', id)
          .eq('item_type', 'restaurant');
        if (error) throw error;
        setIsFavorite(false);
        toast.success(isEn ? 'Removed from favorites' : 'Removido dos favoritos');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            item_id: id,
            item_type: 'restaurant',
            created_at: new Date().toISOString()
          }]);
        if (error) throw error;
        setIsFavorite(true);
        toast.success(isEn ? 'Added to favorites' : 'Adicionado aos favoritos');
      }
    } catch (error) {
      console.error('❌ Erro ao favoritar:', error);
      toast.error(isEn ? 'Error favoriting' : 'Erro ao favoritar');
    }
  };

  // ============================================
  // FAZER PEDIDO
  // ============================================
  const handleOrder = async (orderData) => {
    if (!isAuthenticated) {
      toast.error(isEn ? 'Please login to order' : 'Faça login para pedir');
      return;
    }

    try {
      console.log('📝 Fazendo pedido:', orderData);

      const { data, error } = await supabase
        .from('restaurant_orders')
        .insert([{
          user_id: user.id,
          restaurant_id: id,
          dish_id: orderData.dishId,
          dish_name: orderData.dishName,
          quantity: orderData.quantity,
          total_price: orderData.totalPrice,
          payment_method: orderData.paymentMethod,
          notes: orderData.notes || '',
          status: 'pending',
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success(
        isEn 
          ? `✅ Order placed successfully! Total: ${orderData.totalPrice.toLocaleString()} Kz`
          : `✅ Pedido realizado com sucesso! Total: ${orderData.totalPrice.toLocaleString()} Kz`
      );

      // Redirecionar para página de pedidos
      setTimeout(() => {
        navigate('/meus-pedidos');
      }, 1500);

    } catch (error) {
      console.error('❌ Erro ao fazer pedido:', error);
      toast.error(isEn ? 'Error placing order' : 'Erro ao fazer pedido');
    }
  };

  // ============================================
  // SHARE
  // ============================================
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: restaurant?.name || 'Restaurante',
          text: `Descubra ${restaurant?.name}!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(isEn ? 'Link copied!' : 'Link copiado!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error);
      }
    }
  };

  // ============================================
  // RENDER: LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-blue-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading restaurant...' : 'Carregando restaurante...'}
        </p>
      </div>
    );
  }

  // ============================================
  // RENDER: ERROR
  // ============================================
  if (error || !restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            {isEn ? 'Restaurant not found' : 'Restaurante não encontrado'}
          </h2>
          <Link
            to="/restaurantes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
          >
            <ArrowLeft size={18} />
            {isEn ? 'Back to restaurants' : 'Voltar para restaurantes'}
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Imagem de Capa */}
      <div className="relative h-[300px] md:h-[400px] bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {restaurant.cover_image ? (
          <img
            src={restaurant.cover_image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500">
            <Utensils size={80} className="text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={toggleFavorite}
            className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition shadow-lg"
          >
            <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition shadow-lg"
          >
            <Share2 size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <Link
              to="/restaurantes"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition"
            >
              <ArrowLeft size={16} />
              {isEn ? 'Back to restaurants' : 'Voltar para restaurantes'}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {restaurant.address && (
                <span className="flex items-center gap-1 text-white/80">
                  <MapPin size={16} />
                  {typeof restaurant.address === 'string' 
                    ? restaurant.address 
                    : `${restaurant.address?.city || ''}, ${restaurant.address?.province || ''}`}
                </span>
              )}
              {restaurant.rating > 0 && (
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  {restaurant.rating.toFixed(1)}
                </span>
              )}
              {restaurant.phone && (
                <span className="flex items-center gap-1 text-white/80">
                  <Phone size={14} />
                  {restaurant.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Menu */}
          <div className="lg:col-span-2">
            {/* Descrição */}
            {restaurant.description && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Info size={20} className="text-orange-500" />
                  {isEn ? 'About' : 'Sobre'}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {restaurant.description}
                </p>
              </div>
            )}

            {/* Pratos */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Utensils size={20} className="text-orange-500" />
                {isEn ? 'Menu' : 'Menu'}
                <span className="text-sm font-normal text-gray-500">
                  ({dishes.length} {isEn ? 'dishes' : 'pratos'})
                </span>
              </h2>

              {dishes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Utensils size={40} className="mx-auto mb-2 opacity-30" />
                  <p>{isEn ? 'No dishes available' : 'Nenhum prato disponível'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dishes.map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      onOrder={(dish) => {
                        setSelectedDish(dish);
                        setShowOrderModal(true);
                      }}
                      isEn={isEn}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Informações */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">
                {isEn ? 'Information' : 'Informações'}
              </h3>
              
              <div className="space-y-3">
                {restaurant.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">
                        {isEn ? 'Address' : 'Endereço'}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {typeof restaurant.address === 'string' 
                          ? restaurant.address 
                          : `${restaurant.address?.city || ''}, ${restaurant.address?.province || ''}`}
                      </span>
                    </div>
                  </div>
                )}

                {restaurant.phone && (
                  <div className="flex items-start gap-2 text-sm">
                    <Phone size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">
                        {isEn ? 'Phone' : 'Telefone'}
                      </span>
                      <a href={`tel:${restaurant.phone}`} className="text-gray-900 dark:text-white hover:text-blue-500">
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>
                )}

                {restaurant.email && (
                  <div className="flex items-start gap-2 text-sm">
                    <Mail size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">
                        {isEn ? 'Email' : 'Email'}
                      </span>
                      <a href={`mailto:${restaurant.email}`} className="text-gray-900 dark:text-white hover:text-blue-500">
                        {restaurant.email}
                      </a>
                    </div>
                  </div>
                )}

                {restaurant.working_hours && (
                  <div className="flex items-start gap-2 text-sm">
                    <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">
                        {isEn ? 'Working Hours' : 'Horário'}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {typeof restaurant.working_hours === 'string' 
                          ? restaurant.working_hours 
                          : JSON.stringify(restaurant.working_hours)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {restaurant.latitude && restaurant.longitude && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={`https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition"
                  >
                    <ExternalLink size={14} />
                    {isEn ? 'View on map' : 'Ver no mapa'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pedido */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedDish(null);
        }}
        dish={selectedDish}
        restaurant={restaurant}
        onOrder={handleOrder}
      />
    </div>
  );
}