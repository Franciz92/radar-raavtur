// src/App.jsx
// ============================================
// APP - ROTAS DA APLICAÇO
// - Última atualização: BannerProvider + rota /admin/banners
// ============================================

import { Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/navigation/ScrollToTop';
import MainLayout from './components/layout/MainLayout';

// ============================================
// PÁGINAS PÚBLICAS
// ============================================
import HomePage from './pages/public/HomePage';
import DestinationsPage from './pages/public/DestinationsPage';
import DestinationDetailPage from './pages/public/DestinationDetailPage';
import HotelsPage from './pages/public/HotelsPage';
import HotelDetailPage from './pages/public/HotelDetailPage';
import RestaurantsPage from './pages/public/RestaurantsPage';
import RestaurantDetailPage from './pages/public/RestaurantDetailPage';
import AgenciesPage from './pages/public/AgenciesPage';
import AgencyDetailPage from './pages/public/AgencyDetailPage';
import GuidesPage from './pages/public/GuidesPage';
import GuideDetailPage from './pages/public/GuideDetailPage';
import ExperiencesPage from './pages/public/ExperiencesPage';
import ExperienceDetailPage from './pages/public/ExperienceDetailPage';
import EventsPage from './pages/public/EventsPage';
import EventDetailPage from './pages/public/EventDetailPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import TermsPage from './pages/public/TermsPage';
import PrivacyPage from './pages/public/PrivacyPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// ============================================
// PÁGINAS PÚBLICAS ESPECÍFICAS
// ============================================
import PublicProfilePage from './pages/public/PublicProfilePage';
import BusinessPage from './pages/public/BusinessPage';
import CompaniesPage from './pages/public/CompaniesPage';

// ============================================
// OUTROS SERVIÇOS
// ============================================
import OtherServicesPage from './pages/public/OtherServicesPage';

// ============================================
// BLOG
// ============================================
import BloggerPage from './pages/blog/BloggerPage';
import BlogPostDetailPage from './pages/blog/BlogPostDetailPage';

// ============================================
// BLOG ADMIN
// ============================================
import BlogAdminPage from './pages/admin/BlogAdminPage';
import BlogPostForm from './pages/admin/BlogPostForm';

// ============================================
// PAGAMENTO E RESERVAS
// ============================================
import ServiceDetailPage from './pages/public/ServiceDetailPage';
import BookingForm from './pages/public/BookingForm';
import PaymentPage from './pages/public/PaymentPage';
import PaymentSuccessPage from './pages/public/PaymentSuccessPage';
import PaymentCancelPage from './pages/public/PaymentCancelPage';
import MyBookingsPage from './pages/public/MyBookingsPage';
import UserBookingDetailPage from './pages/public/UserBookingDetailPage';
import ReviewPage from './pages/public/ReviewPage';
import PaymentFlowTest from './pages/public/PaymentFlowTest';

// ============================================
// AVALIAÇÕES E TRANSAÇÕES
// ============================================
import ReviewsPage from './pages/public/ReviewsPage';
import ReviewDetailPage from './pages/public/ReviewDetailPage';
import TransactionsPage from './pages/public/TransactionsPage';
import TransactionDetailPage from './pages/public/TransactionDetailPage';

// ============================================
// USER PAGES
// ============================================
import DashboardPage from './pages/user/DashboardPage';
import ProfilePage from './pages/user/ProfilePage';
import FavoritesPage from './pages/user/FavoritesPage';
import BookingsPage from './pages/user/BookingsPage';
import BookingDetailPage from './pages/user/BookingDetailPage';
import UserSettingsPage from './pages/user/UserSettingsPage';
import UserTransactionsPage from './pages/user/UserTransactionsPage';
import UserNotificationsPage from './pages/user/UserNotificationsPage';
import MyExperiencesPage from './pages/user/MyExperiencesPage';

// ============================================
// APOIO AO CLIENTE
// ============================================
import SupportPage from './pages/user/SupportPage';
import TicketDetailPage from './pages/user/TicketDetailPage';

// ============================================
// EVENTOS
// ============================================
import EventPurchaseSuccess from './pages/public/EventPurchaseSuccess';
import EventPaymentPage from './pages/public/EventPaymentPage';
import EventPaymentConfirm from './pages/public/EventPaymentConfirm';
import MyTicketsPage from './pages/user/MyTicketsPage';

// ============================================
// OWNER DASHBOARD
// ============================================
import OwnerDashboard from './pages/owner/OwnerDashboard';

// ============================================
// COMPANY PAGES
// ============================================
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyRegistration from './pages/company/CompanyRegistration';
import CompanyEdit from './pages/company/CompanyEdit';
import CompanyProfile from './pages/company/CompanyProfile';
import CompanyServices from './pages/company/CompanyServices';
import CompanyServiceForm from './pages/company/CompanyServiceForm';
import CompanyServiceDetail from './pages/company/CompanyServiceDetail';
import CompanyBookings from './pages/company/CompanyBookings';
import CompanyBookingDetail from './pages/company/CompanyBookingDetail';
import CompanyReviews from './pages/company/CompanyReviews';
import CompanyReviewDetail from './pages/company/CompanyReviewDetail';
import CompanySettings from './pages/company/CompanySettings';
import CompanyPayment from './pages/company/CompanyPayment';
import CompanyPaymentMethods from './pages/company/CompanyPaymentMethods';
import CompanyTransactions from './pages/company/CompanyTransactions';
import CompanyTransactionDetail from './pages/company/CompanyTransactionDetail';
import CompanyWithdrawals from './pages/company/CompanyWithdrawals';
import CompanyWithdrawalNew from './pages/company/CompanyWithdrawalNew';
import CompanyWithdrawalDetail from './pages/company/CompanyWithdrawalDetail';
import CompanyNotifications from './pages/company/CompanyNotifications';
import CompanyMenu from './pages/company/CompanyMenu';

// ============================================
// ADMIN PAGES
// ============================================
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminCompanyDetail from './pages/admin/AdminCompanyDetail';
import AdminDestinations from './pages/admin/AdminDestinations';
import AdminDestinationNew from './pages/admin/AdminDestinationNew';
import AdminDestinationEdit from './pages/admin/AdminDestinationEdit';
import AdminBookings from './pages/admin/AdminBookings';
import AdminBookingDetail from './pages/admin/AdminBookingDetail';
import AdminServices from './pages/admin/AdminServices';
import AdminServiceDetail from './pages/admin/AdminServiceDetail';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminTransactionDetail from './pages/admin/AdminTransactionDetail';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminWithdrawalDetail from './pages/admin/AdminWithdrawalDetail';
import AdminReviews from './pages/admin/AdminReviews';
import AdminReviewDetail from './pages/admin/AdminReviewDetail';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminCompanyApprovals from './pages/admin/AdminCompanyApprovals';
import AdminEvents from './pages/admin/AdminEvents';
import AdminBusinessApprovals from './pages/admin/AdminBusinessApprovals';

// ✅ ADMIN - BANNERS
import AdminBanners from './pages/admin/AdminBanners';

// ============================================
// ADMIN - APOIO AO CLIENTE
// ============================================
import AdminSupportPage from './pages/admin/AdminSupportPage';

// ============================================
// ADMIN - GERENCIAMENTO
// ============================================
import AdminHotels from './pages/admin/AdminHotels';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminAgencies from './pages/admin/AdminAgencies';
import AdminGuides from './pages/admin/AdminGuides';
import AdminExperiences from './pages/admin/AdminExperiences';

// ============================================
// CHAT
// ============================================
import ChatPage from './pages/chat/ChatPage';

// ============================================
// CONTEXT
// ============================================
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { BusinessProvider } from './context/BusinessContext';
import { PublicBusinessProvider } from './context/PublicBusinessContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { BannerProvider } from './context/BannerContext';

// ============================================
// ROUTE GUARDS
// ============================================
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || user?.user_metadata?.role || 'user';
    const hasAccess = allowedRoles.some(role => 
      role.toLowerCase() === userRole.toLowerCase()
    );
    
    if (!hasAccess) {
      if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (userRole === 'company') return <Navigate to="/empresa/dashboard" replace />;
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (isAuthenticated && user) {
    const userRole = user?.role || user?.user_metadata?.role || 'user';
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'company') return <Navigate to="/empresa/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// ============================================
// APP
// ============================================
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BannerProvider>
            <BusinessProvider>
              <PublicBusinessProvider>
                <CompanyProvider>
                  <ChatProvider>
                    <ScrollToTop />
                    <MainLayout>
                      <Routes>
                        {/* ROTAS PÚBLICAS */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/destinos" element={<DestinationsPage />} />
                        <Route path="/destinos/:id" element={<DestinationDetailPage />} />
                        
                        {/* NEGÓCIOS */}
                        <Route path="/hoteis" element={<HotelsPage />} />
                        <Route path="/restaurantes" element={<RestaurantsPage />} />
                        <Route path="/agencias" element={<AgenciesPage />} />
                        <Route path="/guias" element={<GuidesPage />} />
                        
                        {/* EXPERIÊNCIAS */}
                        <Route path="/experiencias" element={<ExperiencesPage />} />
                        <Route path="/experiencia/:id" element={<ExperienceDetailPage />} />
                        
                        {/* EVENTOS */}
                        <Route path="/eventos" element={<EventsPage />} />
                        <Route path="/evento/:id" element={<EventDetailPage />} />
                        
                        {/* EMPRESA PÚBLICA */}
                        <Route path="/negocio/:id" element={<BusinessPage />} />
                        <Route path="/empresa/:id" element={<BusinessPage />} />
                        <Route path="/empresas" element={<CompaniesPage />} />
                        
                        {/* OUTROS SERVIÇOS */}
                        <Route path="/outros-servicos" element={<OtherServicesPage />} />
                        <Route path="/outros-servicos/:subcategory" element={<OtherServicesPage />} />
                        
                        {/* REDIRECIONAR */}
                        <Route path="/servicos" element={<Navigate to="/outros-servicos" replace />} />
                        <Route path="/servicos/:subcategory" element={<Navigate to="/outros-servicos/:subcategory" replace />} />
                        
                        {/* SERVIÇO */}
                        <Route path="/servico/:id" element={<ServiceDetailPage />} />
                        
                        {/* BLOG */}
                        <Route path="/blog" element={<BloggerPage />} />
                        <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
                        
                        {/* AVALIAÇÕES E TRANSAÇÕES */}
                        <Route path="/avaliacoes" element={<ReviewsPage />} />
                        <Route path="/avaliacao/:id" element={<ReviewDetailPage />} />
                        <Route path="/transacoes" element={<TransactionsPage />} />
                        <Route path="/transacao/:id" element={<TransactionDetailPage />} />
                        
                        {/* ESTÁTICAS */}
                        <Route path="/sobre" element={<AboutPage />} />
                        <Route path="/contacto" element={<ContactPage />} />
                        <Route path="/termos" element={<TermsPage />} />
                        <Route path="/privacidade" element={<PrivacyPage />} />
                        <Route path="/teste-pagamento" element={<PaymentFlowTest />} />

                        {/* PERFIL PÚBLICO */}
                        <Route path="/perfil/:id" element={<PublicProfilePage />} />

                        {/* AUTENTICAÇO */}
                        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                        <Route path="/registar" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                        <Route path="/recuperar-senha" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

                        {/* REGISTO EMPRESA */}
                        <Route path="/empresa/registar" element={
                          <ProtectedRoute allowedRoles={['company', 'admin', 'user']}>
                            <CompanyRegistration />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/cadastrar-empresa" element={
                          <ProtectedRoute allowedRoles={['company', 'admin', 'user']}>
                            <CompanyRegistration />
                          </ProtectedRoute>
                        } />

                        {/* USER */}
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                        <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path="/favoritos" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                        <Route path="/reservas" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
                        <Route path="/reserva/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
                        <Route path="/usuario/transacoes" element={<ProtectedRoute><UserTransactionsPage /></ProtectedRoute>} />
                        <Route path="/usuario/transacao/:id" element={<ProtectedRoute><TransactionDetailPage /></ProtectedRoute>} />
                        <Route path="/usuario/notificacoes" element={<ProtectedRoute><UserNotificationsPage /></ProtectedRoute>} />
                        <Route path="/usuario/configuracoes" element={<ProtectedRoute><UserSettingsPage /></ProtectedRoute>} />
                        <Route path="/minhas-experiencias" element={<ProtectedRoute><MyExperiencesPage /></ProtectedRoute>} />

                        {/* APOIO - USER */}
                        <Route path="/apoio" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
                        <Route path="/apoio/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />

                        {/* RESERVA E PAGAMENTO */}
                        <Route path="/reservar/:serviceId/:companyId" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
                        <Route path="/pagamento/:bookingId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                        <Route path="/pagamento/sucesso" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
                        <Route path="/pagamento/cancelado" element={<ProtectedRoute><PaymentCancelPage /></ProtectedRoute>} />
                        
                        <Route path="/minhas-reservas" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
                        <Route path="/minha-reserva/:id" element={<ProtectedRoute><UserBookingDetailPage /></ProtectedRoute>} />
                        <Route path="/avaliar/:bookingId" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />

                        {/* EVENTOS - PAGAMENTO */}
                        <Route path="/evento/pagamento/:purchaseId" element={<ProtectedRoute><EventPaymentPage /></ProtectedRoute>} />
                        <Route path="/evento/pagamento/confirmar/:purchaseId" element={<ProtectedRoute><EventPaymentConfirm /></ProtectedRoute>} />
                        <Route path="/compra/sucesso/:purchaseId" element={<ProtectedRoute><EventPurchaseSuccess /></ProtectedRoute>} />
                        <Route path="/meus-ingressos" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />

                        {/* OWNER */}
                        <Route path="/meu-negocio" element={
                          <ProtectedRoute allowedRoles={['company', 'admin', 'user']}>
                            <OwnerDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/proprietario/dashboard" element={
                          <ProtectedRoute allowedRoles={['company', 'admin', 'user']}>
                            <OwnerDashboard />
                          </ProtectedRoute>
                        } />

                        {/* EMPRESA - GESTO */}
                        <Route path="/empresa/dashboard" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyDashboard /></ProtectedRoute>} />
                        <Route path="/empresa/editar" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyEdit /></ProtectedRoute>} />
                        <Route path="/empresa/perfil" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyProfile /></ProtectedRoute>} />
                        
                        <Route path="/empresa/servicos" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyServices /></ProtectedRoute>} />
                        <Route path="/empresa/servicos/novo" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyServiceForm /></ProtectedRoute>} />
                        <Route path="/empresa/servicos/editar/:id" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyServiceForm /></ProtectedRoute>} />
                        <Route path="/empresa/servicos/:id" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyServiceDetail /></ProtectedRoute>} />
                        
                        <Route path="/empresa/reservas" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyBookings /></ProtectedRoute>} />
                        <Route path="/empresa/reserva/:id" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyBookingDetail /></ProtectedRoute>} />
                        <Route path="/empresa/avaliacoes" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyReviews /></ProtectedRoute>} />
                        <Route path="/empresa/avaliacao/:id" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyReviewDetail /></ProtectedRoute>} />
                        <Route path="/empresa/transacoes" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyTransactions /></ProtectedRoute>} />
                        <Route path="/empresa/transacao/:id" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyTransactionDetail /></ProtectedRoute>} />
                        <Route path="/empresa/saques" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyWithdrawals /></ProtectedRoute>} />
                        <Route path="/empresa/saques/novo" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyWithdrawalNew /></ProtectedRoute>} />
                        <Route path="/empresa/saques/:id" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyWithdrawalDetail /></ProtectedRoute>} />
                        <Route path="/empresa/pagamentos" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyPayment /></ProtectedRoute>} />
                        <Route path="/empresa/pagamentos/metodos" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyPaymentMethods /></ProtectedRoute>} />
                        <Route path="/empresa/notificacoes" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyNotifications /></ProtectedRoute>} />
                        <Route path="/empresa/configuracoes" element={
                          <ProtectedRoute allowedRoles={['company', 'admin']}>
                            <CompanySettings />
                          </ProtectedRoute>
                        } />
                        <Route path="/empresa/menu" element={<ProtectedRoute allowedRoles={['company', 'admin']}><CompanyMenu /></ProtectedRoute>} />

                        {/* ADMIN */}
                        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
                        
                        <Route path="/admin/aprovar-empresas" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminBusinessApprovals />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/admin/utilizadores" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
                        <Route path="/admin/utilizador/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserDetail /></ProtectedRoute>} />
                        <Route path="/admin/empresas" element={<ProtectedRoute allowedRoles={['admin']}><AdminCompanies /></ProtectedRoute>} />
                        <Route path="/admin/empresa/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminCompanyDetail /></ProtectedRoute>} />
                        <Route path="/admin/destinos" element={<ProtectedRoute allowedRoles={['admin']}><AdminDestinations /></ProtectedRoute>} />
                        <Route path="/admin/destinos/novo" element={<ProtectedRoute allowedRoles={['admin']}><AdminDestinationNew /></ProtectedRoute>} />
                        <Route path="/admin/destinos/editar/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminDestinationEdit /></ProtectedRoute>} />
                        <Route path="/admin/reservas" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookings /></ProtectedRoute>} />
                        <Route path="/admin/reserva/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookingDetail /></ProtectedRoute>} />
                        <Route path="/admin/servicos" element={<ProtectedRoute allowedRoles={['admin']}><AdminServices /></ProtectedRoute>} />
                        <Route path="/admin/servico/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminServiceDetail /></ProtectedRoute>} />
                        <Route path="/admin/transacoes" element={<ProtectedRoute allowedRoles={['admin']}><AdminTransactions /></ProtectedRoute>} />
                        <Route path="/admin/transacao/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminTransactionDetail /></ProtectedRoute>} />
                        <Route path="/admin/saques" element={<ProtectedRoute allowedRoles={['admin']}><AdminWithdrawals /></ProtectedRoute>} />
                        <Route path="/admin/saque/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminWithdrawalDetail /></ProtectedRoute>} />
                        <Route path="/admin/avaliacoes" element={<ProtectedRoute allowedRoles={['admin']}><AdminReviews /></ProtectedRoute>} />
                        <Route path="/admin/avaliacao/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminReviewDetail /></ProtectedRoute>} />
                        <Route path="/admin/notificacoes" element={<ProtectedRoute allowedRoles={['admin']}><AdminNotifications /></ProtectedRoute>} />
                        <Route path="/admin/configuracoes" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
                        <Route path="/admin/aprovar" element={<ProtectedRoute allowedRoles={['admin']}><AdminCompanyApprovals /></ProtectedRoute>} />

                        {/* ✅ ADMIN - BANNERS */}
                        <Route path="/admin/banners" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminBanners />
                          </ProtectedRoute>
                        } />

                        {/* ADMIN - APOIO */}
                        <Route path="/admin/apoio" element={<ProtectedRoute allowedRoles={['admin']}><AdminSupportPage /></ProtectedRoute>} />
                        <Route path="/admin/apoio/:id" element={<ProtectedRoute allowedRoles={['admin']}><TicketDetailPage /></ProtectedRoute>} />

                        {/* ADMIN - GERENCIAMENTO */}
                        <Route path="/admin/hoteis" element={<ProtectedRoute allowedRoles={['admin']}><AdminHotels /></ProtectedRoute>} />
                        <Route path="/admin/restaurantes" element={<ProtectedRoute allowedRoles={['admin']}><AdminRestaurants /></ProtectedRoute>} />
                        <Route path="/admin/agencias" element={<ProtectedRoute allowedRoles={['admin']}><AdminAgencies /></ProtectedRoute>} />
                        <Route path="/admin/guias" element={<ProtectedRoute allowedRoles={['admin']}><AdminGuides /></ProtectedRoute>} />
                        <Route path="/admin/experiencias" element={<ProtectedRoute allowedRoles={['admin']}><AdminExperiences /></ProtectedRoute>} />
                        <Route path="/admin/eventos" element={<ProtectedRoute allowedRoles={['admin']}><AdminEvents /></ProtectedRoute>} />

                        {/* ADMIN - BLOG */}
                        <Route path="/admin/blog" element={<ProtectedRoute allowedRoles={['admin']}><BlogAdminPage /></ProtectedRoute>} />
                        <Route path="/admin/blog/novo" element={<ProtectedRoute allowedRoles={['admin']}><BlogPostForm /></ProtectedRoute>} />
                        <Route path="/admin/blog/editar/:id" element={<ProtectedRoute allowedRoles={['admin']}><BlogPostForm /></ProtectedRoute>} />

                        {/* CHAT */}
                        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

                        {/* FALLBACK */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </MainLayout>
                  </ChatProvider>
                </CompanyProvider>
              </PublicBusinessProvider>
            </BusinessProvider>
          </BannerProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;