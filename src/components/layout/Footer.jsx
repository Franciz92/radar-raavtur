// src/components/layout/Footer.jsx
// FOOTER profissional

import { Link } from 'react-router-dom';
import {
  Compass, MapPin, Phone, Mail, ChevronRight,
  Code2, Paintbrush, Building2, ArrowUp,
} from 'lucide-react';
import SocialLinks from '../common/SocialLinks';
import Logo from '../common/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const translations = {
  pt: {
    description: 'A plataforma digital que liga turistas aos destinos de Angola e do Mundo.',
    explore: 'Explorar',
    destinations: 'Destinos',
    hotels: 'Hoteis',
    restaurants: 'Restaurantes',
    experiences: 'Experiencias',
    events: 'Eventos',
    blog: 'Blog',
    otherServices: 'Outros Servicos',
    businesses: 'Empresas',
    registerBusiness: 'Registar empresa',
    fullRegistration: 'Cadastro completo',
    advertiseService: 'Anunciar servico',
    helpCenter: 'Central de ajuda',
    contacts: 'Contactos',
    address: 'Bairro Social, Luena/Angola',
    creator: 'Criado por Bernado Quiala Jose',
    developer: 'Desenvolvido por Moises Francisco',
    terms: 'Termos',
    privacy: 'Privacidade',
    contact: 'Contacto',
    backToTop: 'Voltar ao topo',
  },
  en: {
    description: 'The digital platform that connects tourists to destinations in Angola and the World.',
    explore: 'Explore',
    destinations: 'Destinations',
    hotels: 'Hotels',
    restaurants: 'Restaurants',
    experiences: 'Experiences',
    events: 'Events',
    blog: 'Blog',
    otherServices: 'Other Services',
    businesses: 'Businesses',
    registerBusiness: 'Register business',
    fullRegistration: 'Full registration',
    advertiseService: 'Advertise service',
    helpCenter: 'Help center',
    contacts: 'Contacts',
    address: 'Av. Bairro Social, Luena',
    creator: 'Created by Bernado Quiala Jose',
    developer: 'Developed by Moises Francisco',
    terms: 'Terms',
    privacy: 'Privacy',
    contact: 'Contact',
    backToTop: 'Back to top',
  },
};

const getExploreLinks = (t) => [
  { label: t.destinations, path: '/destinos' },
  { label: t.hotels, path: '/hoteis' },
  { label: t.restaurants, path: '/restaurantes' },
  { label: t.experiences, path: '/experiencias' },
  { label: t.events, path: '/eventos' },
  { label: t.blog, path: '/blog' },
  { label: t.otherServices, path: '/servicos' },
];

const getBusinessLinks = (t) => [
  { label: t.businesses, path: '/empresas' },
  { label: t.registerBusiness, path: '/cadastrar-empresa' },
  { label: t.fullRegistration, path: '/empresa/registar' },
  { label: t.advertiseService, path: '/empresa/servicos/novo' },
  { label: t.helpCenter, path: '/contacto' },
];

function LinkColumn({ title, links, icon: Icon, isDark }) {
  return (
    <div>
      <h3 className={'flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] mb-4 ' + (isDark ? 'text-amber-400' : 'text-amber-600')}>
        {Icon && <Icon size={13} />}
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={'group inline-flex items-center gap-1.5 text-[13px] transition-colors ' + (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}
            >
              <ChevronRight
                size={12}
                className={'transition-transform group-hover:translate-x-0.5 ' + (isDark ? 'text-amber-700/70 group-hover:text-amber-400' : 'text-amber-600/70 group-hover:text-amber-600')}
              />
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const t = translations[language === 'en' ? 'en' : 'pt'];

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className={'relative overflow-hidden border-t transition-colors duration-300 ' + (isDark ? 'text-slate-200 border-amber-500/15' : 'text-slate-700 border-amber-500/25')}
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #0a0e1a 0%, #080c16 50%, #05080f 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background: 'linear-gradient(90deg, #7A1830 0%, #D4A72C 50%, #123C32 100%)',
        }}
      />

      <div
        aria-hidden="true"
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full pointer-events-none blur-3xl"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(212,167,44,0.35) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(212,167,44,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pt-10 pb-24 lg:pb-6">
        <div className={'flex items-center pb-6 mb-8 border-b transition-colors ' + (isDark ? 'border-white/[0.06]' : 'border-slate-200')}>
          <Logo size="md" variant={isDark ? 'light' : 'dark'} to="/" />
        </div>

        <div className={'grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 pb-8 border-b transition-colors ' + (isDark ? 'border-white/[0.06]' : 'border-slate-200')}>
          <div className="md:col-span-4 flex flex-col gap-4">
            <p className={'text-[13px] leading-relaxed max-w-md ' + (isDark ? 'text-slate-400' : 'text-slate-600')}>
              {t.description}
            </p>
            <SocialLinks size="sm" variant={isDark ? 'dark' : 'light'} />
          </div>

          <div className="md:col-span-3">
            <LinkColumn title={t.explore} links={getExploreLinks(t)} isDark={isDark} />
          </div>

          <div className="md:col-span-2">
            <LinkColumn title={t.businesses} links={getBusinessLinks(t)} icon={Building2} isDark={isDark} />
          </div>

          <div className="md:col-span-3">
            <h3 className={'text-[11px] font-bold uppercase tracking-[0.15em] mb-4 ' + (isDark ? 'text-amber-400' : 'text-amber-600')}>
              {t.contacts}
            </h3>
            <ul className={'space-y-3 text-[13px] ' + (isDark ? 'text-slate-400' : 'text-slate-600')}>
              <li className="flex items-start gap-2.5 leading-snug">
                <MapPin size={14} className={'flex-shrink-0 mt-0.5 ' + (isDark ? 'text-amber-400' : 'text-amber-600')} />
                <span>{t.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={14} className={'flex-shrink-0 mt-0.5 ' + (isDark ? 'text-amber-400' : 'text-amber-600')} />
                <a href="tel:+244931117067" className={'transition-colors ' + (isDark ? 'hover:text-white' : 'hover:text-slate-900')}>
                  +244 931 117 067
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={14} className={'flex-shrink-0 mt-0.5 ' + (isDark ? 'text-amber-400' : 'text-amber-600')} />
                <a href="tel:+244932297004" className={'transition-colors ' + (isDark ? 'hover:text-white' : 'hover:text-slate-900')}>
                  +244 932 297 004
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={14} className={'flex-shrink-0 mt-0.5 ' + (isDark ? 'text-amber-400' : 'text-amber-600')} />
                <a href="mailto:kinvestesol@gmail.com" className={'transition-colors break-all ' + (isDark ? 'hover:text-white' : 'hover:text-slate-900')}>
                  kinvestesol@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 space-y-4">
          <div className={'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] ' + (isDark ? 'text-slate-500' : 'text-slate-500')}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className={'font-semibold ' + (isDark ? 'text-slate-400' : 'text-slate-600')}>
                (c) 2026 Radar RAAVTUR
              </span>
              <span className="opacity-30 hidden sm:inline">-</span>
              <span className="inline-flex items-center gap-1.5">
                <Paintbrush size={11} className={isDark ? 'text-amber-500/70' : 'text-amber-600/70'} />
                <span>{t.creator}</span>
              </span>
              <span className="opacity-30 hidden sm:inline">-</span>
              <span className="inline-flex items-center gap-1.5">
                <Code2 size={11} className={isDark ? 'text-amber-500/70' : 'text-amber-600/70'} />
                <span>{t.developer}</span>
              </span>
            </div>
          </div>

          <div className={'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t text-[11px] ' + (isDark ? 'border-white/[0.06] text-slate-500' : 'border-slate-200 text-slate-500')}>
            <div className="flex items-center gap-4">
              {[
                { label: t.terms, path: '/termos' },
                { label: t.privacy, path: '/privacidade' },
                { label: t.contact, path: '/contacto' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={'font-medium transition-colors ' + (isDark ? 'hover:text-amber-400' : 'hover:text-amber-600')}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={handleBackToTop}
              aria-label={t.backToTop}
              title={t.backToTop}
              className={'inline-flex items-center justify-center gap-1.5 px-3 h-8 rounded-full border transition-all self-start sm:self-auto ' + (isDark ? 'border-white/10 bg-white/5 text-slate-400 hover:text-amber-400 hover:border-amber-500/30' : 'border-slate-200 bg-white text-slate-500 hover:text-amber-600 hover:border-amber-500/40')}
            >
              <ArrowUp size={12} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {t.backToTop}
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}