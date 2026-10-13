// src/services/restaurantService.js

import { supabase } from './supabase';

// ============================================
// PRATOS DO RESTAURANTE
// ============================================

// Buscar todos os pratos de um restaurante
export const getDishesByRestaurant = async (restaurantId) => {
  try {
    if (!restaurantId) {
      throw new Error('ID do restaurante é obrigatório');
    }

    const { data, error } = await supabase
      .from('restaurant_dishes')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'active')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return { data: data || [], success: true };
  } catch (error) {
    console.error('❌ Erro ao buscar pratos:', error);
    return { data: [], error: error.message, success: false };
  }
};

// Buscar um prato específico
export const getDishById = async (dishId) => {
  try {
    if (!dishId) {
      throw new Error('ID do prato é obrigatório');
    }

    const { data, error } = await supabase
      .from('restaurant_dishes')
      .select('*')
      .eq('id', dishId)
      .single();

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('❌ Erro ao buscar prato:', error);
    return { data: null, error: error.message, success: false };
  }
};

// Criar um novo prato
export const createDish = async (dishData) => {
  try {
    if (!dishData.restaurant_id) {
      throw new Error('ID do restaurante é obrigatório');
    }
    if (!dishData.name) {
      throw new Error('Nome do prato é obrigatório');
    }
    if (!dishData.price) {
      throw new Error('Preço é obrigatório');
    }

    const { data, error } = await supabase
      .from('restaurant_dishes')
      .insert([{
        restaurant_id: dishData.restaurant_id,
        name: dishData.name,
        description: dishData.description || '',
        price: dishData.price,
        category: dishData.category || 'Principal',
        image_url: dishData.image_url || null,
        status: dishData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('❌ Erro ao criar prato:', error);
    return { data: null, error: error.message, success: false };
  }
};

// Atualizar um prato
export const updateDish = async (dishId, updates) => {
  try {
    if (!dishId) {
      throw new Error('ID do prato é obrigatório');
    }

    const { data, error } = await supabase
      .from('restaurant_dishes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dishId)
      .select()
      .single();

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('❌ Erro ao atualizar prato:', error);
    return { data: null, error: error.message, success: false };
  }
};

// Remover um prato (soft delete)
export const deleteDish = async (dishId) => {
  try {
    if (!dishId) {
      throw new Error('ID do prato é obrigatório');
    }

    const { error } = await supabase
      .from('restaurant_dishes')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', dishId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao remover prato:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// PEDIDOS DO RESTAURANTE
// ============================================

// Criar um pedido
export const createOrder = async (orderData) => {
  try {
    if (!orderData.user_id) {
      throw new Error('Usuário é obrigatório');
    }
    if (!orderData.restaurant_id) {
      throw new Error('Restaurante é obrigatório');
    }
    if (!orderData.dish_id) {
      throw new Error('Prato é obrigatório');
    }
    if (!orderData.quantity || orderData.quantity < 1) {
      throw new Error('Quantidade deve ser pelo menos 1');
    }

    const { data, error } = await supabase
      .from('restaurant_orders')
      .insert([{
        user_id: orderData.user_id,
        restaurant_id: orderData.restaurant_id,
        dish_id: orderData.dish_id,
        dish_name: orderData.dish_name,
        quantity: orderData.quantity,
        total_price: orderData.total_price,
        payment_method: orderData.payment_method || 'pending',
        notes: orderData.notes || '',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error);
    return { data: null, error: error.message, success: false };
  }
};

// Buscar pedidos de um usuário
export const getUserOrders = async (userId) => {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório');
    }

    const { data, error } = await supabase
      .from('restaurant_orders')
      .select(`
        *,
        restaurant:restaurant_id (
          id,
          name,
          logo,
          address
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], success: true };
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error);
    return { data: [], error: error.message, success: false };
  }
};

// Buscar pedidos de um restaurante
export const getRestaurantOrders = async (restaurantId) => {
  try {
    if (!restaurantId) {
      throw new Error('ID do restaurante é obrigatório');
    }

    const { data, error } = await supabase
      .from('restaurant_orders')
      .select(`
        *,
        user:user_id (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], success: true };
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error);
    return { data: [], error: error.message, success: false };
  }
};

// Atualizar status do pedido
export const updateOrderStatus = async (orderId, status) => {
  try {
    if (!orderId) {
      throw new Error('ID do pedido é obrigatório');
    }
    if (!status) {
      throw new Error('Status é obrigatório');
    }

    const updates = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'confirmed') {
      updates.confirmed_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('restaurant_orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('❌ Erro ao atualizar pedido:', error);
    return { data: null, error: error.message, success: false };
  }
};