// src/context/AuthContext.jsx
// ============================================
// AUTH CONTEXT - COM NOTIFICAÇÕES REALTIME
// ✅ SOLUÇO DEFINITIVA:
//    - Nome único de canal (evita reutilização pelo Supabase)
//    - await removeChannel() antes de criar novo
//    - Flag cancelled para evitar race conditions
//    - Set de canais ativos para limpeza garantida
//    - Toast dispara CustomEvent para navegação SPA
// ============================================

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [profile, setProfile] = useState(null);
  const [business, setBusiness] = useState(null);
  
  const authSubscriptionRef = useRef(null);
  const notificationPollRef = useRef(null);
  const isMountedRef = useRef(true);
  
  // ✅ Guardar TODOS os canais ativos para limpeza garantida
  const activeChannelsRef = useRef(new Set());
  // ✅ Contador para nomes únicos de canal
  const channelCounterRef = useRef(0);

  // ============================================
  // SOM DE NOTIFICAÇO
  // ============================================
  const playNotificationSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (error) {
      console.log('🔇 Som de notificação não disponível');
    }
  }, []);

  // ============================================
  // EMOJI POR TIPO
  // ============================================
  const getNotificationEmoji = (type) => {
    const emojis = {
      booking_created: '📅',
      booking_confirmed: '✅',
      booking_completed: '🎉',
      booking_cancelled: '❌',
      new_booking: '📅',
      booking_status: '📋',
      payment_received: '💰',
      new_transaction: '💳',
      review_created: '⭐',
      new_review: '⭐',
      new_comment: '💬',
      new_like: '❤️',
      new_follower: '👥',
      new_user: '👤',
      new_business: '🏢',
      business_approved: '✅',
      business_rejected: '❌',
      new_experience: '✨',
      support_ticket: '🆘',
      support_message: '💬',
      support_reply: '💬',
      ticket_status: '📋',
    };
    return emojis[type] || '🔔';
  };

  // ============================================
  // ✅ TOAST DE NOTIFICAÇO — NAVEGAÇO SPA
  // ============================================
  const showNotificationToast = useCallback((notif) => {
    if (!isMountedRef.current) return;
    
    const emoji = getNotificationEmoji(notif.type);
    playNotificationSound();
    
    // Função auxiliar para navegar
    const navigateToLink = (link) => {
      if (!link) return;
      
      // Reset flag
      window.__notificationNavigated = false;
      
      // 1. Disparar evento SPA (o NotificationBell escuta)
      window.dispatchEvent(
        new CustomEvent('notification-navigate', {
          detail: { link, notification: notif },
        })
      );
      
      // 2. Fallback: se ninguém ouvir o evento em 200ms, navega com reload
      setTimeout(() => {
        if (!window.__notificationNavigated) {
          console.warn('⚠️ [Auth] Evento não capturado, usando fallback:', link);
          window.location.href = link;
        }
      }, 200);
    };
    
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 overflow-hidden`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl">
                  {emoji}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {notif.title}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {notif.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                // ✅ Disparar evento para o NotificationBell navegar (SPA)
                navigateToLink(notif.link);
              }}
              className="w-full border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-center text-sm font-semibold text-amber-600 hover:text-amber-500 transition"
            >
              Ver
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full p-3 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      ),
      { duration: 8000, position: 'top-right' }
    );
  }, [playNotificationSound]);

  // ============================================
  // BUSCAR PERFIL
  // ============================================
  const getUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Erro ao buscar perfil:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('[Auth] Erro ao buscar perfil:', error);
      return null;
    }
  };

  // ============================================
  // BUSCAR EMPRESA
  // ============================================
  const getUserBusiness = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        if (error.code === '42P01') return null;
        console.error('[Auth] Erro ao buscar empresa:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('[Auth] Erro ao buscar empresa:', error);
      return null;
    }
  };

  // ============================================
  // BUSCAR SERVIÇOS
  // ============================================
  const getBusinessServices = async (businessId) => {
    try {
      const { data, error } = await supabase
        .from('business_services')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Auth] Erro ao buscar serviços:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('[Auth] Erro ao buscar serviços:', error);
      return [];
    }
  };

  // ============================================
  // ATUALIZAR PERFIL
  // ============================================
  const updateUserProfile = async (userId, updates) => {
    try {
      const allowedUpdates = [
        'name', 'phone', 'location', 'avatar_url', 'banner_url', 
        'company_id', 'bio', 'website', 'social_links', 'user_type',
        'nationality', 'interests', 'cover_image', 'guide_specialty',
        'guide_experience', 'guide_languages', 'guide_license'
      ];
      
      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      if (Object.keys(filteredUpdates).length === 0) return null;

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...filteredUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Auth] Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  // ============================================
  // CRIAR EMPRESA
  // ============================================
  const createBusiness = async (userId, businessData) => {
    try {
      const existing = await getUserBusiness(userId);
      if (existing) throw new Error('Usuário já possui uma empresa registrada');

      const dataToInsert = {
        user_id: userId,
        name: businessData.name,
        slug: businessData.slug || businessData.name.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        category: businessData.category || 'Outro',
        description: businessData.description || '',
        full_description: businessData.full_description || '',
        logo_url: businessData.logo_url || null,
        cover_image: businessData.cover_image || null,
        gallery: businessData.gallery || [],
        website: businessData.website || null,
        email: businessData.email || null,
        phone: businessData.phone || null,
        address: businessData.address || null,
        province: businessData.province || null,
        latitude: businessData.latitude || null,
        longitude: businessData.longitude || null,
        is_verified: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('businesses')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;

      await updateUserProfile(userId, { company_id: data.id });
      return data;
    } catch (error) {
      console.error('[Auth] Erro ao criar empresa:', error);
      throw error;
    }
  };

  // ============================================
  // ATUALIZAR EMPRESA
  // ============================================
  const updateBusiness = async (businessId, updates) => {
    try {
      const allowedUpdates = [
        'name', 'slug', 'category', 'description', 'full_description',
        'logo_url', 'cover_image', 'gallery', 'website', 'email',
        'phone', 'address', 'province', 'latitude', 'longitude',
        'is_verified', 'is_active'
      ];
      
      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      if (Object.keys(filteredUpdates).length === 0) return null;

      const { data, error } = await supabase
        .from('businesses')
        .update({
          ...filteredUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', businessId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Auth] Erro ao atualizar empresa:', error);
      throw error;
    }
  };

  // ============================================
  // CARREGAR NOTIFICAÇÕES
  // ============================================
  const loadNotifications = useCallback(async (userId) => {
    if (!isMountedRef.current) return [];
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        if (error.code === '42P01') {
          setNotifications([]);
          return [];
        }
        throw error;
      }
      
      if (isMountedRef.current) setNotifications(data || []);
      return data || [];
    } catch (error) {
      console.error('[Auth] Erro ao carregar notificações:', error);
      if (isMountedRef.current) setNotifications([]);
      return [];
    }
  }, []);

  // ============================================
  // CONTAGEM DE NO LIDAS
  // ============================================
  const loadUnreadCount = useCallback(async (userId) => {
    if (!isMountedRef.current) return 0;
    
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      if (error) {
        if (error.code === '42P01') {
          if (isMountedRef.current) setUnreadNotifications(0);
          return 0;
        }
        throw error;
      }
      
      if (isMountedRef.current) setUnreadNotifications(count || 0);
      return count || 0;
    } catch (error) {
      console.error('[Auth] Erro ao carregar contagem:', error);
      if (isMountedRef.current) setUnreadNotifications(0);
      return 0;
    }
  }, []);

  // ============================================
  // ✅ REALTIME - SOLUÇO DEFINITIVA
  // ============================================
  useEffect(() => {
    // Se não há user, limpar tudo e sair
    if (!user?.id) {
      activeChannelsRef.current.forEach((ch) => {
        try { supabase.removeChannel(ch); } catch (e) {}
      });
      activeChannelsRef.current.clear();
      setIsRealtimeConnected(false);
      return;
    }

    let cancelled = false;
    const userId = user.id;

    console.log('📡 [Auth] Iniciando Realtime para user:', userId);

    const setupRealtime = async () => {
      const channelsToRemove = Array.from(activeChannelsRef.current);
      for (const oldChannel of channelsToRemove) {
        try {
          await supabase.removeChannel(oldChannel);
          console.log('🗑️ [Auth] Canal antigo removido');
        } catch (e) {}
      }
      activeChannelsRef.current.clear();

      if (cancelled || !isMountedRef.current) return;

      channelCounterRef.current += 1;
      const uniqueId = `${Date.now()}-${channelCounterRef.current}-${Math.random().toString(36).substring(2, 8)}`;
      const channelName = `notifications-user-${userId}-${uniqueId}`;

      console.log('📡 [Auth] Criando canal único:', channelName);

      const channel = supabase.channel(channelName);

      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (cancelled || !isMountedRef.current) return;
            
            const notif = payload.new;
            console.log('🔔 [Auth] Nova notificação:', notif);

            setNotifications(prev => {
              if (prev.find(n => n.id === notif.id)) return prev;
              return [notif, ...prev];
            });

            if (!notif.read) {
              setUnreadNotifications(prev => prev + 1);
            }

            showNotificationToast(notif);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (cancelled || !isMountedRef.current) return;
            
            const updated = payload.new;
            setNotifications(prev =>
              prev.map(n => (n.id === updated.id ? updated : n))
            );
            loadUnreadCount(userId);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (cancelled || !isMountedRef.current) return;
            
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
            loadUnreadCount(userId);
          }
        );

      channel.subscribe((status) => {
        if (cancelled || !isMountedRef.current) return;
        console.log('📡 [Auth] Status do canal:', status);
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

      activeChannelsRef.current.add(channel);
    };

    const timeoutId = setTimeout(setupRealtime, 50);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      
      const channelsToRemove = Array.from(activeChannelsRef.current);
      channelsToRemove.forEach((ch) => {
        try {
          supabase.removeChannel(ch);
        } catch (e) {}
      });
      activeChannelsRef.current.clear();
      
      if (isMountedRef.current) setIsRealtimeConnected(false);
    };
  }, [user?.id, showNotificationToast, loadUnreadCount]);

  // ============================================
  // POLLING DE FALLBACK
  // ============================================
  useEffect(() => {
    if (notificationPollRef.current) {
      clearInterval(notificationPollRef.current);
      notificationPollRef.current = null;
    }

    if (!user?.id) return;

    console.log('🔔 [Auth] Polling de fallback iniciado (60s)');

    notificationPollRef.current = setInterval(async () => {
      if (!isRealtimeConnected && isMountedRef.current) {
        console.log('🔔 [Auth] Polling de fallback...');
        await loadNotifications(user.id);
        await loadUnreadCount(user.id);
      }
    }, 60000);

    return () => {
      if (notificationPollRef.current) {
        clearInterval(notificationPollRef.current);
        notificationPollRef.current = null;
      }
    };
  }, [user?.id, isRealtimeConnected, loadNotifications, loadUnreadCount]);

  // ============================================
  // MARCAR COMO LIDA
  // ============================================
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadNotifications(prev => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      console.error('[Auth] Erro ao marcar como lida:', error);
      return false;
    }
  }, []);

  // ============================================
  // MARCAR TODAS COMO LIDAS
  // ============================================
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifications(0);
      toast.success('Todas as notificações marcadas como lidas');
      return true;
    } catch (error) {
      console.error('[Auth] Erro ao marcar todas como lidas:', error);
      return false;
    }
  }, [user]);

  // ============================================
  // DELETAR NOTIFICAÇO
  // ============================================
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
      
      const deleted = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deleted && !deleted.read) {
        setUnreadNotifications(prev => Math.max(0, prev - 1));
      }
      return true;
    } catch (error) {
      console.error('[Auth] Erro ao deletar notificação:', error);
      return false;
    }
  }, [notifications]);

  // ============================================
  // CRIAR NOTIFICAÇO
  // ============================================
  const createNotification = useCallback(async (notificationData) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          link: notificationData.link || null,
          icon: notificationData.icon || 'Bell',
          metadata: notificationData.metadata || {},
          read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      setNotifications(prev => [data, ...prev]);
      setUnreadNotifications(prev => prev + 1);
      return data;
    } catch (error) {
      console.error('[Auth] Erro ao criar notificação:', error);
      throw error;
    }
  }, []);

  // ============================================
  // REFRESH NOTIFICAÇÕES
  // ============================================
  const refreshNotifications = useCallback(async () => {
    if (user?.id) {
      await loadNotifications(user.id);
      await loadUnreadCount(user.id);
    }
  }, [user, loadNotifications, loadUnreadCount]);

  // ============================================
  // LOGIN
  // ============================================
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      if (!email || !password) throw new Error('Email e senha são obrigatórios');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error('Formato de email inválido');

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        }
        throw error;
      }
      
      toast.success('✅ Login efetuado com sucesso!');
      return { data, error: null };
    } catch (error) {
      console.error('[Auth] Erro ao fazer login:', error);
      toast.error(error.message || 'Erro ao fazer login');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // LOGIN GOOGLE
  // ============================================
  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[Auth] Erro ao fazer login com Google:', error);
      toast.error(error.message || 'Erro ao fazer login com Google');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // REGISTER
  // ============================================
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      console.log('[Auth] Iniciando registro:', userData);

      if (!userData.email || !userData.password) {
        toast.error('Email e senha são obrigatórios');
        return { data: null, error: 'Email e senha são obrigatórios' };
      }
      if (userData.password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
        return { data: null, error: 'A senha deve ter pelo menos 6 caracteres' };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        toast.error('Formato de email inválido');
        return { data: null, error: 'Formato de email inválido' };
      }

      const displayName = userData.userType === 'business' 
        ? userData.businessName 
        : userData.name;

      if (!displayName || displayName.length < 3) {
        toast.error('Nome deve ter pelo menos 3 caracteres');
        return { data: null, error: 'Nome deve ter pelo menos 3 caracteres' };
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: displayName,
            role: userData.userType === 'business' ? 'company' : userData.userType === 'guide' ? 'guide' : 'user',
            user_type: userData.userType || 'user',
            phone: userData.phone || '',
            location: userData.location || '',
            nationality: userData.nationality || 'AO',
            bio: userData.bio || '',
          },
        },
      });
      
      if (authError) {
        console.error('[Auth] Erro no signUp:', authError);
        let errorMessage = authError.message;
        if (authError.message.includes('User already registered')) {
          errorMessage = 'Este email já está registado. Faça login.';
        }
        toast.error(errorMessage);
        return { data: null, error: errorMessage };
      }

      if (!authData?.user) {
        toast.error('Erro ao criar usuário');
        return { data: null, error: 'Erro ao criar usuário' };
      }

      console.log('[Auth] Usuário criado:', authData.user.id);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const profileData = {
        id: authData.user.id,
        name: displayName,
        email: userData.email,
        role: userData.userType === 'business' ? 'company' : userData.userType === 'guide' ? 'guide' : 'user',
        user_type: userData.userType || 'user',
        phone: userData.phone || '',
        location: userData.location || '',
        nationality: userData.nationality || 'AO',
        bio: userData.bio || '',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (userData.userType === 'guide') {
        profileData.guide_specialty = userData.guideSpecialty || '';
        profileData.guide_experience = userData.guideExperience || '';
        profileData.guide_languages = userData.guideLanguages || [];
        profileData.guide_license = userData.guideLicense || '';
      }

      if (userData.userType === 'business') {
        profileData.business_name = userData.businessName || '';
        profileData.business_category = userData.businessCategory || '';
        profileData.business_nif = userData.businessNif || '';
        profileData.business_description = userData.businessDescription || '';
        profileData.business_website = userData.businessWebsite || '';
        profileData.business_address = userData.businessAddress || '';
        profileData.business_phone = userData.businessPhone || '';
        profileData.business_email = userData.businessEmail || '';
        profileData.social_links = userData.socialLinks || {};
        profileData.payment_methods = userData.paymentMethods || [];
      }

      if (userData.userType === 'user' && userData.interests) {
        profileData.interests = userData.interests;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', authData.user.id);

      if (updateError) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData);
        if (insertError) console.error('[Auth] Erro ao inserir perfil:', insertError);
      }

      if (userData.userType === 'business') {
        try {
          const businessData = {
            name: userData.businessName,
            category: userData.businessCategory,
            description: userData.businessDescription || '',
            website: userData.businessWebsite || null,
            email: userData.businessEmail || userData.email,
            phone: userData.businessPhone || userData.phone || null,
            address: userData.businessAddress || null,
            province: userData.location || null,
            slug: userData.businessName.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, ''),
            user_id: authData.user.id,
          };

          const business = await createBusiness(authData.user.id, businessData);
          if (business) {
            const services = await getBusinessServices(business.id);
            business.services = services;
            setBusiness(business);
          }
        } catch (businessError) {
          console.error('[Auth] Erro ao criar empresa:', businessError);
          toast.error('Conta criada, mas houve erro ao criar a empresa. Contacte o suporte.');
        }
      }

      toast.success('✅ Conta criada com sucesso!');
      return { data: authData, error: null };
    } catch (error) {
      console.error('[Auth] Erro ao criar conta:', error);
      toast.error(error.message || 'Falha ao criar conta');
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [createBusiness, getBusinessServices]);

  // ============================================
  // LOGOUT
  // ============================================
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setBusiness(null);
      setIsAuthenticated(false);
      setUnreadNotifications(0);
      setNotifications([]);
      
      if (notificationPollRef.current) {
        clearInterval(notificationPollRef.current);
        notificationPollRef.current = null;
      }
      
      activeChannelsRef.current.forEach((ch) => {
        try { supabase.removeChannel(ch); } catch (e) {}
      });
      activeChannelsRef.current.clear();
      setIsRealtimeConnected(false);
      
      toast.success('✅ Até logo!');
      return { error: null };
    } catch (error) {
      console.error('[Auth] Erro ao sair:', error);
      toast.error('Erro ao sair');
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // UPDATE USER
  // ============================================
  const updateUser = useCallback(async (updates) => {
    setLoading(true);
    try {
      if (!user?.id) {
        toast.error('Usuário não autenticado');
        return null;
      }

      const updatedProfile = await updateUserProfile(user.id, updates);
      
      if (updatedProfile) {
        const newUser = {
          ...user,
          name: updatedProfile.name || user.name || 'Utilizador',
          role: updatedProfile.role || user.role || 'user',
          userType: updatedProfile.user_type || user.userType || 'user',
          phone: updatedProfile.phone || user.phone || '',
          location: updatedProfile.location || user.location || '',
          avatar_url: updatedProfile.avatar_url || user.avatar_url || null,
          banner_url: updatedProfile.banner_url || user.banner_url || null,
          cover_image: updatedProfile.cover_image || user.cover_image || null,
          bio: updatedProfile.bio || user.bio || '',
          website: updatedProfile.website || user.website || '',
          social_links: updatedProfile.social_links || user.social_links || {},
          nationality: updatedProfile.nationality || user.nationality || 'AO',
          interests: updatedProfile.interests || user.interests || [],
          company_id: updatedProfile.company_id || user.company_id || null,
          guide_specialty: updatedProfile.guide_specialty || user.guide_specialty || '',
          guide_experience: updatedProfile.guide_experience || user.guide_experience || '',
          guide_languages: updatedProfile.guide_languages || user.guide_languages || [],
          guide_license: updatedProfile.guide_license || user.guide_license || '',
        };
        
        setUser(newUser);
        setProfile(updatedProfile);
        
        if (updatedProfile.company_id) {
          const businessData = await getUserBusiness(user.id);
          if (businessData) {
            const services = await getBusinessServices(businessData.id);
            businessData.services = services;
            setBusiness(businessData);
          }
        }
        
        await refreshNotifications();
        toast.success('✅ Perfil atualizado com sucesso!');
        return updatedProfile;
      } else {
        toast.error('Erro ao atualizar perfil');
        return null;
      }
    } catch (error) {
      console.error('[Auth] Erro ao atualizar perfil:', error);
      toast.error(error.message || 'Erro ao atualizar perfil');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, getUserBusiness, getBusinessServices, refreshNotifications]);

  // ============================================
  // REFRESH USER
  // ============================================
  const refreshUser = useCallback(async () => {
    if (!user?.id) return null;
    
    try {
      const profileData = await getUserProfile(user.id);
      
      if (profileData) {
        let businessData = null;
        if (profileData.user_type === 'business' || profileData.role === 'company') {
          businessData = await getUserBusiness(user.id);
          if (businessData) {
            const services = await getBusinessServices(businessData.id);
            businessData.services = services;
            setBusiness(businessData);
          }
        }

        const updatedUser = {
          id: user.id,
          email: user.email,
          name: profileData.name || user.name || 'Utilizador',
          role: profileData.role || user.role || 'user',
          userType: profileData.user_type || user.userType || 'user',
          phone: profileData.phone || user.phone || '',
          location: profileData.location || user.location || '',
          avatar_url: profileData.avatar_url || user.avatar_url || null,
          banner_url: profileData.banner_url || user.banner_url || null,
          cover_image: profileData.cover_image || user.cover_image || null,
          bio: profileData.bio || user.bio || '',
          website: profileData.website || user.website || '',
          social_links: profileData.social_links || user.social_links || {},
          nationality: profileData.nationality || user.nationality || 'AO',
          interests: profileData.interests || user.interests || [],
          company_id: profileData.company_id || user.company_id || null,
          created_at: user.created_at,
          guide_specialty: profileData.guide_specialty || user.guide_specialty || '',
          guide_experience: profileData.guide_experience || user.guide_experience || '',
          guide_languages: profileData.guide_languages || user.guide_languages || [],
          guide_license: profileData.guide_license || user.guide_license || '',
        };
        setUser(updatedUser);
        setProfile(profileData);
        
        await refreshNotifications();
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error('[Auth] Erro ao recarregar perfil:', error);
      return null;
    }
  }, [user, getUserBusiness, getBusinessServices, refreshNotifications]);

  // ============================================
  // VERIFICAÇÕES DE ROLE
  // ============================================
  const isAdmin = useCallback(() => user?.role === 'admin', [user]);
  const isCompany = useCallback(() => user?.role === 'company' || user?.role === 'admin' || user?.userType === 'business', [user]);
  const isGuide = useCallback(() => user?.role === 'guide' || user?.userType === 'guide', [user]);
  const isUser = useCallback(() => user?.role === 'user' || user?.userType === 'user', [user]);

  // ============================================
  // BUSCAR RESERVAS
  // ============================================
  const getUserBookings = useCallback(async () => {
    if (!user?.id) return [];
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.code === '42P01') return [];
        return [];
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }, [user]);

  const getBusinessBookings = useCallback(async (businessId) => {
    if (!businessId) return [];
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, services(*)')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.code === '42P01') return [];
        return [];
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }, []);

  const getUserTransactions = useCallback(async () => {
    if (!user?.id) return [];
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.code === '42P01') return [];
        return [];
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }, [user]);

  // ============================================
  // MÉTODOS DE PAGAMENTO
  // ============================================
  const getPaymentMethods = useCallback(async (businessId) => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }, []);

  const addPaymentMethod = useCallback(async (businessId, methodData) => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert([{
          business_id: businessId,
          type: methodData.type,
          name: methodData.name,
          details: methodData.details || {},
          is_active: true,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const removePaymentMethod = useCallback(async (methodId) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }, []);

  // ============================================
  // FOLLOW
  // ============================================
  const followUser = useCallback(async (userIdToFollow) => {
    if (!user?.id) {
      toast.error('Faça login para seguir');
      return false;
    }
    if (user.id === userIdToFollow) {
      toast.error('Não pode seguir a si mesmo');
      return false;
    }
    try {
      const { error } = await supabase
        .from('follows')
        .insert([{
          follower_id: user.id,
          following_id: userIdToFollow,
          created_at: new Date().toISOString(),
        }]);

      if (error) {
        if (error.code === '42P01') {
          toast.error('Sistema de follows não está disponível');
          return false;
        }
        throw error;
      }
      toast.success('Seguindo!');
      return true;
    } catch (error) {
      console.error('[Auth] Erro ao seguir:', error);
      toast.error('Erro ao seguir');
      return false;
    }
  }, [user]);

  const unfollowUser = useCallback(async (userIdToUnfollow) => {
    if (!user?.id) return false;
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userIdToUnfollow);

      if (error) {
        if (error.code === '42P01') return false;
        throw error;
      }
      toast.success('Deixou de seguir');
      return true;
    } catch (error) {
      toast.error('Erro ao deixar de seguir');
      return false;
    }
  }, [user]);

  const isFollowing = useCallback(async (userIdToCheck) => {
    if (!user?.id) return false;
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userIdToCheck)
        .maybeSingle();

      if (error) {
        if (error.code === '42P01') return false;
        throw error;
      }
      return !!data;
    } catch (error) {
      return false;
    }
  }, [user]);

  // ============================================
  // MOUNT/UNMOUNT
  // ============================================
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ============================================
  // CARREGAR SESSO
  // ============================================
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        console.log('[Auth] 🔄 Carregando sessão...');
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('[Auth] ✅ Sessão encontrada para:', session.user.email);
          
          const profileData = await getUserProfile(session.user.id);
          console.log('[Auth] Profile carregado:', profileData);
          
          let businessData = null;
          if (profileData?.user_type === 'business' || profileData?.role === 'company') {
            businessData = await getUserBusiness(session.user.id);
            if (businessData) {
              const services = await getBusinessServices(businessData.id);
              businessData.services = services;
            }
          }

          const userRole = profileData?.role || session.user.user_metadata?.role || 'user';
          const userType = profileData?.user_type || 'user';

          const userObj = {
            id: session.user.id,
            email: session.user.email,
            name: profileData?.name || session.user.user_metadata?.name || 'Utilizador',
            role: userRole,
            userType: userType,
            phone: profileData?.phone || '',
            location: profileData?.location || '',
            avatar_url: profileData?.avatar_url || null,
            banner_url: profileData?.banner_url || null,
            cover_image: profileData?.cover_image || null,
            bio: profileData?.bio || '',
            website: profileData?.website || '',
            social_links: profileData?.social_links || {},
            nationality: profileData?.nationality || 'AO',
            interests: profileData?.interests || [],
            company_id: profileData?.company_id || null,
            created_at: session.user.created_at,
            guide_specialty: profileData?.guide_specialty || '',
            guide_experience: profileData?.guide_experience || '',
            guide_languages: profileData?.guide_languages || [],
            guide_license: profileData?.guide_license || '',
          };

          setUser(userObj);
          setProfile(profileData);
          setBusiness(businessData);
          setIsAuthenticated(true);
          
          if (profileData?.id) {
            await loadNotifications(profileData.id);
            await loadUnreadCount(profileData.id);
          }
        } else {
          console.log('[Auth] ⚠️ Nenhuma sessão encontrada');
          setUser(null);
          setProfile(null);
          setBusiness(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('[Auth] ❌ Erro ao carregar sessão:', error);
        setUser(null);
        setProfile(null);
        setBusiness(null);
        setIsAuthenticated(false);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };
    
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] 📡 Auth event:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('[Auth] 🔐 Usuário fez login:', session.user.email);
          
          const profileData = await getUserProfile(session.user.id);
          
          let businessData = null;
          if (profileData?.user_type === 'business' || profileData?.role === 'company') {
            businessData = await getUserBusiness(session.user.id);
            if (businessData) {
              const services = await getBusinessServices(businessData.id);
              businessData.services = services;
            }
          }

          const userRole = profileData?.role || session.user.user_metadata?.role || 'user';
          const userType = profileData?.user_type || 'user';

          const userObj = {
            id: session.user.id,
            email: session.user.email,
            name: profileData?.name || session.user.user_metadata?.name || 'Utilizador',
            role: userRole,
            userType: userType,
            phone: profileData?.phone || '',
            location: profileData?.location || '',
            avatar_url: profileData?.avatar_url || null,
            banner_url: profileData?.banner_url || null,
            cover_image: profileData?.cover_image || null,
            bio: profileData?.bio || '',
            website: profileData?.website || '',
            social_links: profileData?.social_links || {},
            nationality: profileData?.nationality || 'AO',
            interests: profileData?.interests || [],
            company_id: profileData?.company_id || null,
            created_at: session.user.created_at,
            guide_specialty: profileData?.guide_specialty || '',
            guide_experience: profileData?.guide_experience || '',
            guide_languages: profileData?.guide_languages || [],
            guide_license: profileData?.guide_license || '',
          };

          if (isMountedRef.current) {
            setUser(userObj);
            setProfile(profileData);
            setBusiness(businessData);
            setIsAuthenticated(true);
          }
          
          if (profileData?.id) {
            await loadNotifications(profileData.id);
            await loadUnreadCount(profileData.id);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[Auth] 🚪 Usuário fez logout');
          if (isMountedRef.current) {
            setUser(null);
            setProfile(null);
            setBusiness(null);
            setIsAuthenticated(false);
            setUnreadNotifications(0);
            setNotifications([]);
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[Auth] 🔄 Token atualizado');
        }
        
        if (isMountedRef.current) setLoading(false);
      }
    );

    authSubscriptionRef.current = subscription;

    return () => {
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
      }
      if (notificationPollRef.current) {
        clearInterval(notificationPollRef.current);
        notificationPollRef.current = null;
      }
      activeChannelsRef.current.forEach((ch) => {
        try { supabase.removeChannel(ch); } catch (e) {}
      });
      activeChannelsRef.current.clear();
    };
  }, []);

  // ============================================
  // VALUE - EXPORT
  // ============================================
  const value = {
    user,
    profile,
    business,
    isAuthenticated,
    loading,
    notifications,
    unreadNotifications,
    isRealtimeConnected,

    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refreshNotifications,

    login,
    loginWithGoogle,
    register,
    logout,

    updateUser,
    refreshUser,

    isAdmin,
    isCompany,
    isGuide,
    isUser,

    getUserBusiness,
    createBusiness,
    updateBusiness,
    getBusinessServices,

    getUserBookings,
    getBusinessBookings,

    getUserTransactions,

    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,

    followUser,
    unfollowUser,
    isFollowing,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

export default AuthContext;