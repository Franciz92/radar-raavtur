// src/components/layout/Navigation.jsx

import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  MapPin,
  Hotel,
  Utensils,
  Users,
  Compass,
  CalendarDays,
  Briefcase,
  Newspaper,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  Building2,
  Calendar,
  Star,
  Settings,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCompany } from '../../context/CompanyContext';
import { supabase } from '../../services/supabase';

export default function Navigation() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { company } = useCompany();
  const { isEn } = useLanguage();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Menu items principais
  const menuItems = [
    { label: isEn ? 'Home' : 'Início', path: '/', icon: Home },
    { label: isEn ? 'Destinations' : 'Destinos', path: '/destinos', icon: MapPin },
    { label: isEn ? 'Hotels' : 'Hotéis', path: '/hoteis', icon: Hotel },
    { label: isEn ? 'Restaurants' : 'Restaurantes', path: '/restaurantes', icon: Utensils },
    { label: isEn ? 'Agencies' : 'Agências', path: '/agencias', icon: Users },
    { label: isEn ? 'Experiences' : 'Experiências', path: '/experiencias', icon: Compass },
    { label: isEn ? 'Events' : 'Eventos', path: '/eventos', icon: CalendarDays },
    { label: isEn ? 'Services' : 'Serviços', path: '/servicos', icon: Briefcase },
    { label: isEn ? 'Blog' : 'Blog', path: '/blog', icon: Newspaper },
  ];

  // Itens do menu do usuário
  const userMenuItems = [
    { label: isEn ? 'Dashboard' : 'Dashboard', path: '/dashboard', icon: Home },
    { label: isEn ? 'My Bookings' : 'Minhas Reservas', path: '/minhas-reservas', icon: Calendar },
    { label: isEn ? 'Profile' : 'Perfil', path: '/perfil', icon: User },
    { label: isEn ? 'Favorites' : 'Favoritos', path: '/favoritos', icon: Star },
    { label: isEn ? 'Settings' : 'Configurações', path: '/usuario/configuracoes', icon: Settings },
  ];

  // Itens do menu da empresa
  const companyMenuItems = [
    { label: isEn ? 'Dashboard' : 'Dashboard', path: '/empresa/dashboard', icon: Building2 },
    { label: isEn ? 'Services' : 'Serviços', path: '/empresa/servicos', icon: Briefcase },
    { label: isEn ? 'Bookings' : 'Reservas', path: '/empresa/reservas', icon: Calendar },
    { label: isEn ? 'Payment Methods' : 'Métodos de Pagamento', path: '/empresa/pagamentos/metodos', icon: CreditCard },
    { label: isEn ? 'Settings' : 'Configurações', path: '/empresa/configuracoes', icon: Settings },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    setIsUserMenuOpen(false);
    setIsMobileOpen(false);
  };

  // Determinar role do usuário
  const userRole = user?.role || user?.user_metadata?.role || 'user';
  const isCompany = userRole === 'company' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">RAVTUR</span>
            {company && company.status === 'approved' && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full hidden md:inline">
                ✓ {isEn ? 'Verified' : 'Verificado'}
              </span>
            )}
          </Link>

          {/* Desktop Menu - Central */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon size={16} />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Ações do Usuário - Direita */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Botão Cadastrar Empresa */}
                {isCompany && !company && (
                  <Link
                    to="/cadastrar-empresa"
                    className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition"
                  >
                    <Building2 size={16} />
                    {isEn ? 'Register' : 'Cadastrar'}
                  </Link>
                )}

                {/* Dropdown do Usuário */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      {/* Header do dropdown */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {user?.name || 'Usuário'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            isCompany ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {isAdmin ? '👑 Admin' : isCompany ? '🏢 Company' : '👤 User'}
                          </span>
                          {company && company.status === 'approved' && (
                            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                              ✓ {isEn ? 'Verified' : 'Verificado'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Menu do Usuário (se não for company) */}
                      {!isCompany && userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          >
                            <Icon size={16} className="text-gray-400" />
                            {item.label}
                          </Link>
                        );
                      })}

                      {/* Menu da Empresa (se for company) */}
                      {isCompany && company && companyMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          >
                            <Icon size={16} className="text-gray-400" />
                            {item.label}
                          </Link>
                        );
                      })}

                      {/* Separador */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full"
                      >
                        <LogOut size={16} />
                        {isEn ? 'Sign Out' : 'Sair'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:inline-block px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {isEn ? 'Login' : 'Entrar'}
                </Link>
                <Link
                  to="/registar"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  {isEn ? 'Sign Up' : 'Registar'}
                </Link>
              </div>
            )}

            {/* Botão Mobile */}
            <button
              onClick={toggleMobile}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition ml-1"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMobileOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Links principais */}
            <div className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={20} />
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Separador */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {/* Links do Usuário (mobile) */}
            {isAuthenticated ? (
              <div className="flex flex-col gap-1">
                {/* Dashboard (usuário comum) */}
                {!isCompany && (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <span className="flex items-center gap-3">
                      <Home size={20} />
                      {isEn ? 'Dashboard' : 'Dashboard'}
                    </span>
                  </Link>
                )}

                {/* Dashboard (empresa) */}
                {isCompany && company && (
                  <Link
                    to="/empresa/dashboard"
                    onClick={() => setIsMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <span className="flex items-center gap-3">
                      <Building2 size={20} />
                      {isEn ? 'Company Dashboard' : 'Dashboard Empresa'}
                    </span>
                  </Link>
                )}

                {/* Minhas Reservas */}
                <Link
                  to="/minhas-reservas"
                  onClick={() => setIsMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <span className="flex items-center gap-3">
                    <Calendar size={20} />
                    {isEn ? 'My Bookings' : 'Minhas Reservas'}
                  </span>
                </Link>

                {/* Cadastrar Empresa (mobile) */}
                {isCompany && !company && (
                  <Link
                    to="/cadastrar-empresa"
                    onClick={() => setIsMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition"
                  >
                    <span className="flex items-center gap-3">
                      <Building2 size={20} />
                      {isEn ? 'Register Company' : 'Cadastrar Empresa'}
                    </span>
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full text-left"
                >
                  <span className="flex items-center gap-3">
                    <LogOut size={20} />
                    {isEn ? 'Sign Out' : 'Sair'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <span className="flex items-center gap-3">
                    <LogIn size={20} />
                    {isEn ? 'Login' : 'Entrar'}
                  </span>
                </Link>
                <Link
                  to="/registar"
                  onClick={() => setIsMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  <span className="flex items-center gap-3">
                    <User size={20} />
                    {isEn ? 'Sign Up' : 'Registar'}
                  </span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}