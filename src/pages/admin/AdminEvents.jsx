// src/pages/admin/AdminEvents.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';
import { 
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  getEventTickets,
  createTicket,
  updateTicket,
  deleteTicket
} from '../../services/eventService';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  MapPin,
  Ticket,
  Image as ImageIcon,
  X,
  Upload,
  AlertCircle,
  RefreshCw,
  Eye,
  Check,
  ChevronDown,
  DollarSign,
  Globe,
  Phone,
  Mail,
  Palette,
  Image as ImageIcon2
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE DE FORMULÁRIO DE EVENTO COM INGRESSOS E PERSONALIZAÇO
// ============================================

const EventForm = ({ event, onSave, onCancel, isEn }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date ? new Date(event.date).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    address: event?.address || '',
    category: event?.category || '',
    organizer: event?.organizer || '',
    organizer_logo: event?.organizer_logo || '',
    organizer_website: event?.organizer_website || '',
    organizer_phone: event?.organizer_phone || '',
    organizer_email: event?.organizer_email || '',
    ticket_color: event?.ticket_color || '#7c3aed',
    image_url: event?.image_url || '',
    banner_url: event?.banner_url || '',
    status: event?.status || 'active',
    featured: event?.featured || false,
  });
  const [ticketList, setTicketList] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicketIndex, setEditingTicketIndex] = useState(null);
  const [tempTicket, setTempTicket] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    benefits: ''
  });
  const [imagePreview, setImagePreview] = useState(event?.image_url || null);
  const [bannerPreview, setBannerPreview] = useState(event?.banner_url || null);
  const [logoPreview, setLogoPreview] = useState(event?.organizer_logo || null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const categories = [
    'Conferência',
    'Workshop',
    'Concerto',
    'Festival',
    'Exposição',
    'Feira',
    'Desporto',
    'Cultural',
    'Social',
    'Outro',
  ];

  const statusOptions = [
    { value: 'active', label: isEn ? 'Active' : 'Ativo' },
    { value: 'pending', label: isEn ? 'Pending' : 'Pendente' },
    { value: 'draft', label: isEn ? 'Draft' : 'Rascunho' },
    { value: 'cancelled', label: isEn ? 'Cancelled' : 'Cancelado' },
    { value: 'completed', label: isEn ? 'Completed' : 'Concluído' },
  ];

  // Carregar ingressos existentes se for edição
  useEffect(() => {
    if (event?.id) {
      loadExistingTickets(event.id);
    }
  }, [event?.id]);

  const loadExistingTickets = async (eventId) => {
    try {
      const result = await getEventTickets(eventId);
      if (result.success && result.data) {
        setTicketList(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar ingressos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `events/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      if (type === 'image') {
        setImagePreview(publicUrl);
        setFormData(prev => ({ ...prev, image_url: publicUrl }));
      } else if (type === 'banner') {
        setBannerPreview(publicUrl);
        setFormData(prev => ({ ...prev, banner_url: publicUrl }));
      } else if (type === 'logo') {
        setLogoPreview(publicUrl);
        setFormData(prev => ({ ...prev, organizer_logo: publicUrl }));
      }

      toast.success(isEn ? 'Image uploaded!' : 'Imagem carregada!');
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      toast.error(isEn ? 'Error uploading image' : 'Erro ao carregar imagem');
    } finally {
      setUploading(false);
    }
  };

  // Funções para gerenciar ingressos
  const openTicketModal = (index = null) => {
    if (index !== null) {
      const ticket = ticketList[index];
      setTempTicket({
        name: ticket.name,
        description: ticket.description || '',
        price: ticket.price,
        quantity: ticket.quantity,
        benefits: ticket.benefits ? ticket.benefits.join(', ') : ''
      });
      setEditingTicketIndex(index);
    } else {
      setTempTicket({
        name: '',
        description: '',
        price: '',
        quantity: '',
        benefits: ''
      });
      setEditingTicketIndex(null);
    }
    setShowTicketModal(true);
  };

  const addTicket = () => {
    if (!tempTicket.name.trim()) {
      toast.error(isEn ? 'Ticket name is required' : 'Nome do ingresso é obrigatório');
      return;
    }
    if (!tempTicket.price || parseFloat(tempTicket.price) <= 0) {
      toast.error(isEn ? 'Valid price is required' : 'Preço válido é obrigatório');
      return;
    }

    const newTicket = {
      id: Date.now(),
      name: tempTicket.name.trim(),
      description: tempTicket.description || '',
      price: parseFloat(tempTicket.price),
      quantity: parseInt(tempTicket.quantity) || 0,
      benefits: tempTicket.benefits ? tempTicket.benefits.split(',').map(b => b.trim()).filter(Boolean) : []
    };

    if (editingTicketIndex !== null) {
      const updated = [...ticketList];
      updated[editingTicketIndex] = newTicket;
      setTicketList(updated);
      setEditingTicketIndex(null);
      toast.success(isEn ? 'Ticket updated!' : 'Ingresso atualizado!');
    } else {
      setTicketList([...ticketList, newTicket]);
      toast.success(isEn ? 'Ticket added!' : 'Ingresso adicionado!');
    }

    setShowTicketModal(false);
    setTempTicket({ name: '', description: '', price: '', quantity: '', benefits: '' });
  };

  const removeTicket = (index) => {
    if (!confirm(isEn ? 'Remove this ticket?' : 'Remover este ingresso?')) return;
    const updated = ticketList.filter((_, i) => i !== index);
    setTicketList(updated);
    toast.success(isEn ? 'Ticket removed!' : 'Ingresso removido!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error(isEn ? 'Title is required' : 'Título é obrigatório');
      return;
    }
    if (!formData.date) {
      toast.error(isEn ? 'Date is required' : 'Data é obrigatória');
      return;
    }

    setLoading(true);
    try {
      const result = await onSave({
        ...formData,
        tickets: ticketList
      });
      if (result.success) {
        toast.success(isEn ? 'Event saved!' : 'Evento salvo!');
        onCancel();
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast.error(error.message || (isEn ? 'Error saving' : 'Erro ao salvar'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {event ? (isEn ? 'Edit Event' : 'Editar Evento') : (isEn ? 'New Event' : 'Novo Evento')}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Title' : 'Título'} *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={isEn ? 'Event title...' : 'Título do evento...'}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Description' : 'Descrição'}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder={isEn ? 'Event description...' : 'Descrição do evento...'}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Date and Time' : 'Data e Hora'} *
              </label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* Localização */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isEn ? 'Location' : 'Local'}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={isEn ? 'City, Country' : 'Cidade, País'}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isEn ? 'Address' : 'Endereço'}
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={isEn ? 'Full address...' : 'Endereço completo...'}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Categoria e Organizador */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isEn ? 'Category' : 'Categoria'}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                >
                  <option value="">{isEn ? 'Select category...' : 'Selecione a categoria...'}</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isEn ? 'Organizer Name' : 'Nome do Organizador'}
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder={isEn ? 'Organizer name...' : 'Nome do organizador...'}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* ============================================ */}
            {/* SEÇO DE PERSONALIZAÇO DO ORGANIZADOR */}
            {/* ============================================ */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <ImageIcon2 size={20} className="text-purple-500" />
                {isEn ? 'Organizer Customization' : 'Personalização do Organizador'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {isEn ? 'Customize how your brand appears on tickets' : 'Personalize como sua marca aparece nos ingressos'}
              </p>

              {/* Logo do Organizador */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isEn ? 'Organizer Logo' : 'Logo do Organizador'}
                </label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null);
                          setFormData(prev => ({ ...prev, organizer_logo: '' }));
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition">
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">
                        {isEn ? 'Upload Logo' : 'Carregar Logo'}
                      </span>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'logo');
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">
                      {isEn ? 'Upload your logo (PNG, JPG, SVG). Recommended size: 200x200px' : 'Carregue seu logo (PNG, JPG, SVG). Tamanho recomendado: 200x200px'}
                    </p>
                    <input
                      type="text"
                      name="organizer_logo"
                      value={formData.organizer_logo}
                      onChange={handleChange}
                      placeholder={isEn ? 'Or paste image URL' : 'Ou cole a URL da imagem'}
                      className="w-full mt-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Cor do Ingresso */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isEn ? 'Ticket Color' : 'Cor do Ingresso'}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    name="ticket_color"
                    value={formData.ticket_color || '#7c3aed'}
                    onChange={handleChange}
                    className="w-16 h-12 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    name="ticket_color"
                    value={formData.ticket_color || '#7c3aed'}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm font-mono"
                  />
                  <div 
                    className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-600"
                    style={{ backgroundColor: formData.ticket_color || '#7c3aed' }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {isEn ? 'This color will be used on the ticket header and QR code' : 'Esta cor será usada no cabeçalho do ingresso e no QR Code'}
                </p>
              </div>

              {/* Contatos do Organizador */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Globe size={14} className="inline mr-1" />
                    {isEn ? 'Website' : 'Website'}
                  </label>
                  <input
                    type="url"
                    name="organizer_website"
                    value={formData.organizer_website || ''}
                    onChange={handleChange}
                    placeholder="https://meusite.com"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Phone size={14} className="inline mr-1" />
                    {isEn ? 'Phone' : 'Telefone'}
                  </label>
                  <input
                    type="text"
                    name="organizer_phone"
                    value={formData.organizer_phone || ''}
                    onChange={handleChange}
                    placeholder="+244 900 000 000"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail size={14} className="inline mr-1" />
                    {isEn ? 'Organizer Email' : 'Email do Organizador'}
                  </label>
                  <input
                    type="email"
                    name="organizer_email"
                    value={formData.organizer_email || ''}
                    onChange={handleChange}
                    placeholder="organizador@email.com"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Status e Destaque */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isEn ? 'Status' : 'Status'}
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isEn ? 'Featured Event' : 'Evento em Destaque'}
                </label>
              </div>
            </div>

            {/* Imagens do Evento */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <ImageIcon size={20} className="text-purple-500" />
                {isEn ? 'Event Images' : 'Imagens do Evento'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isEn ? 'Event Image' : 'Imagem do Evento'}
                  </label>
                  <div className="relative">
                    {imagePreview ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                        <img src={imagePreview} alt="Event" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image_url: '' }));
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition">
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">
                          {isEn ? 'Upload' : 'Carregar'}
                        </span>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'image');
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isEn ? 'Banner Image' : 'Imagem de Banner'}
                  </label>
                  <div className="relative">
                    {bannerPreview ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setBannerPreview(null);
                            setFormData(prev => ({ ...prev, banner_url: '' }));
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition">
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">
                          {isEn ? 'Upload' : 'Carregar'}
                        </span>
                        <input
                          ref={bannerInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'banner');
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================ */}
            {/* SEÇO DE INGRESSOS */}
            {/* ============================================ */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Ticket size={20} className="text-purple-500" />
                  {isEn ? 'Tickets' : 'Ingressos'}
                  <span className="text-sm font-normal text-gray-400">
                    ({ticketList.length})
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => openTicketModal()}
                  className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                >
                  <Plus size={16} />
                  {isEn ? 'Add Ticket' : 'Adicionar Ingresso'}
                </button>
              </div>

              {/* Lista de ingressos */}
              {ticketList.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <Ticket size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {isEn ? 'No tickets added yet. Click "Add Ticket" to create one.' : 'Nenhum ingresso adicionado ainda. Clique em "Adicionar Ingresso" para criar um.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {ticketList.map((ticket, index) => (
                    <div 
                      key={ticket.id || index} 
                      className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600/30 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {ticket.name}
                          </p>
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full">
                            {ticket.price.toLocaleString()} Kz
                          </span>
                        </div>
                        {ticket.description && (
                          <p className="text-sm text-gray-500">{ticket.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          <span>{ticket.quantity > 0 ? `${ticket.quantity} disponíveis` : 'Ilimitado'}</span>
                          {ticket.benefits && ticket.benefits.length > 0 && (
                            <span>• {ticket.benefits.join(', ')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => openTicketModal(index)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 rounded transition"
                          title={isEn ? 'Edit' : 'Editar'}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTicket(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded transition"
                          title={isEn ? 'Remove' : 'Remover'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal de adicionar/editar ingresso */}
            {showTicketModal && (
              <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Ticket size={20} className="text-purple-500" />
                      {editingTicketIndex !== null ? (isEn ? 'Edit Ticket' : 'Editar Ingresso') : (isEn ? 'New Ticket' : 'Novo Ingresso')}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowTicketModal(false)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {isEn ? 'Ticket Name' : 'Nome do Ingresso'} *
                      </label>
                      <input
                        type="text"
                        value={tempTicket.name}
                        onChange={(e) => setTempTicket({ ...tempTicket, name: e.target.value })}
                        placeholder={isEn ? 'VIP, Normal, etc...' : 'VIP, Normal, etc...'}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {isEn ? 'Description' : 'Descrição'}
                      </label>
                      <input
                        type="text"
                        value={tempTicket.description}
                        onChange={(e) => setTempTicket({ ...tempTicket, description: e.target.value })}
                        placeholder={isEn ? 'Ticket description...' : 'Descrição do ingresso...'}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {isEn ? 'Price (Kz)' : 'Preço (Kz)'} *
                        </label>
                        <input
                          type="number"
                          value={tempTicket.price}
                          onChange={(e) => setTempTicket({ ...tempTicket, price: e.target.value })}
                          placeholder="5000"
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {isEn ? 'Quantity' : 'Quantidade'}
                        </label>
                        <input
                          type="number"
                          value={tempTicket.quantity}
                          onChange={(e) => setTempTicket({ ...tempTicket, quantity: e.target.value })}
                          placeholder="100"
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {isEn ? 'Leave 0 for unlimited' : 'Deixe 0 para ilimitado'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {isEn ? 'Benefits (comma separated)' : 'Benefícios (separados por vírgula)'}
                      </label>
                      <input
                        type="text"
                        value={tempTicket.benefits}
                        onChange={(e) => setTempTicket({ ...tempTicket, benefits: e.target.value })}
                        placeholder={isEn ? 'VIP area, Free drink, etc...' : 'Área VIP, Bebida grátis, etc...'}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => setShowTicketModal(false)}
                        className="flex-1 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition"
                      >
                        {isEn ? 'Cancel' : 'Cancelar'}
                      </button>
                      <button
                        type="button"
                        onClick={addTicket}
                        className="flex-[2] py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        {editingTicketIndex !== null ? (isEn ? 'Update' : 'Atualizar') : (isEn ? 'Add' : 'Adicionar')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botões do formulário */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition"
              >
                {isEn ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-[2] py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading || uploading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    {event ? <Check size={18} /> : <Plus size={18} />}
                    {event ? (isEn ? 'Update Event' : 'Atualizar Evento') : (isEn ? 'Create Event' : 'Criar Evento')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE INGRESSO (Admin - Para edição separada)
// ============================================

const TicketForm = ({ ticket, eventId, onSave, onCancel, isEn }) => {
  const [formData, setFormData] = useState({
    name: ticket?.name || '',
    description: ticket?.description || '',
    price: ticket?.price || '',
    quantity: ticket?.quantity || 0,
    benefits: ticket?.benefits?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(isEn ? 'Ticket name is required' : 'Nome do ingresso é obrigatório');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error(isEn ? 'Valid price is required' : 'Preço válido é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const benefits = formData.benefits.split(',').map(b => b.trim()).filter(Boolean);
      const result = await onSave({
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 0,
        benefits,
        event_id: eventId,
      });
      if (result.success) {
        toast.success(isEn ? 'Ticket saved!' : 'Ingresso salvo!');
        onCancel();
      }
    } catch (error) {
      console.error('❌ Erro ao salvar ingresso:', error);
      toast.error(error.message || (isEn ? 'Error saving' : 'Erro ao salvar'));
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
              {ticket ? (isEn ? 'Edit Ticket' : 'Editar Ingresso') : (isEn ? 'New Ticket' : 'Novo Ingresso')}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Ticket Name' : 'Nome do Ingresso'} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={isEn ? 'VIP, Normal, etc...' : 'VIP, Normal, etc...'}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Description' : 'Descrição'}
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={isEn ? 'Ticket description...' : 'Descrição do ingresso...'}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isEn ? 'Price (Kz)' : 'Preço (Kz)'} *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="5000"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isEn ? 'Quantity' : 'Quantidade'}
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="100"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Benefits (comma separated)' : 'Benefícios (separados por vírgula)'}
              </label>
              <input
                type="text"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                placeholder={isEn ? 'Access to VIP area, Free drink, etc...' : 'Acesso à área VIP, Bebida grátis, etc...'}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition"
              >
                {isEn ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    {ticket ? <Check size={18} /> : <Plus size={18} />}
                    {ticket ? (isEn ? 'Update' : 'Atualizar') : (isEn ? 'Create' : 'Criar')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function AdminEvents() {
  const { isEn } = useLanguage();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const result = await getEvents();
      if (result.success) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar eventos:', error);
      toast.error(isEn ? 'Error loading events' : 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async (eventId) => {
    setTicketLoading(true);
    try {
      const result = await getEventTickets(eventId);
      if (result.success) {
        setTickets(result.data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar ingressos:', error);
      toast.error(isEn ? 'Error loading tickets' : 'Erro ao carregar ingressos');
    } finally {
      setTicketLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    loadTickets(event.id);
  };

  const handleCreateEvent = async (data) => {
    const result = await createEvent(data);
    if (result.success) {
      setEvents(prev => [result.data, ...prev]);
    }
    return result;
  };

  const handleUpdateEvent = async (data) => {
    const result = await updateEvent(editingEvent.id, data);
    if (result.success) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? result.data : e));
    }
    return result;
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm(isEn ? 'Delete this event?' : 'Remover este evento?')) return;

    try {
      const result = await deleteEvent(id);
      if (result.success) {
        setEvents(prev => prev.filter(e => e.id !== id));
        if (selectedEvent?.id === id) {
          setSelectedEvent(null);
          setTickets([]);
        }
        toast.success(isEn ? 'Event removed!' : 'Evento removido!');
      }
    } catch (error) {
      console.error('❌ Erro ao remover evento:', error);
      toast.error(isEn ? 'Error removing' : 'Erro ao remover');
    }
  };

  const handleCreateTicket = async (data) => {
    const result = await createTicket(data);
    if (result.success) {
      setTickets(prev => [result.data, ...prev]);
    }
    return result;
  };

  const handleUpdateTicket = async (data) => {
    const result = await updateTicket(editingTicket.id, data);
    if (result.success) {
      setTickets(prev => prev.map(t => t.id === editingTicket.id ? result.data : t));
    }
    return result;
  };

  const handleDeleteTicket = async (id) => {
    if (!confirm(isEn ? 'Delete this ticket?' : 'Remover este ingresso?')) return;

    try {
      const result = await deleteTicket(id);
      if (result.success) {
        setTickets(prev => prev.filter(t => t.id !== id));
        toast.success(isEn ? 'Ticket removed!' : 'Ingresso removido!');
      }
    } catch (error) {
      console.error('❌ Erro ao remover ingresso:', error);
      toast.error(isEn ? 'Error removing' : 'Erro ao remover');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* HEADER COM BOTO ADICIONAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar size={28} className="text-purple-500" />
            {isEn ? 'Manage Events' : 'Gerir Eventos'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {events.length} {isEn ? 'events' : 'eventos'} {isEn ? 'registered' : 'registados'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadEvents}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition flex items-center gap-2"
            title={isEn ? 'Refresh' : 'Atualizar'}
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => {
              setEditingEvent(null);
              setShowEventForm(true);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2"
          >
            <Plus size={20} />
            {isEn ? 'New Event' : 'Novo Evento'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Eventos */}
        <div className="lg:col-span-2">
          {events.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {isEn ? 'No events created yet' : 'Nenhum evento criado ainda'}
              </p>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setShowEventForm(true);
                }}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                {isEn ? 'Create your first event' : 'Criar seu primeiro evento'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl border p-4 hover:shadow-md transition cursor-pointer ${
                    selectedEvent?.id === event.id
                      ? 'border-purple-500 shadow-md'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleSelectEvent(event)}
                >
                  <div className="flex items-start gap-4">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                        <Calendar size={24} className="text-purple-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {event.title}
                        </h3>
                        {event.featured && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                            ★
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          event.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          event.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          event.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' :
                          event.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(event.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {event.location && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin size={14} />
                          {event.location}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEvent(event);
                          setShowEventForm(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg transition"
                        title={isEn ? 'Edit' : 'Editar'}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition"
                        title={isEn ? 'Delete' : 'Remover'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ingressos do Evento Selecionado */}
        <div className="lg:col-span-1">
          {selectedEvent ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Ticket size={18} className="text-purple-500" />
                  {isEn ? 'Tickets' : 'Ingressos'}
                </h3>
                <button
                  onClick={() => {
                    setEditingTicket(null);
                    setShowTicketForm(true);
                  }}
                  className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                >
                  <Plus size={16} />
                  {isEn ? 'Add' : 'Adicionar'}
                </button>
              </div>

              {ticketLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-purple-500" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-6">
                  <Ticket size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {isEn ? 'No tickets for this event' : 'Nenhum ingresso para este evento'}
                  </p>
                  <button
                    onClick={() => {
                      setEditingTicket(null);
                      setShowTicketForm(true);
                    }}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 mx-auto"
                  >
                    <Plus size={14} />
                    {isEn ? 'Add first ticket' : 'Adicionar primeiro ingresso'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {ticket.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {ticket.price.toLocaleString()} Kz
                          </p>
                          {ticket.quantity > 0 && (
                            <p className="text-xs text-gray-400">
                              {ticket.quantity - (ticket.sold || 0)} {isEn ? 'available' : 'disponíveis'}
                            </p>
                          )}
                          {ticket.benefits && ticket.benefits.length > 0 && (
                            <p className="text-xs text-gray-400 truncate">
                              {ticket.benefits.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => {
                              setEditingTicket(ticket);
                              setShowTicketForm(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-500 rounded transition"
                            title={isEn ? 'Edit' : 'Editar'}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition"
                            title={isEn ? 'Delete' : 'Remover'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Ticket size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {isEn ? 'Select an event to manage tickets' : 'Selecione um evento para gerir ingressos'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isEn ? 'Click on an event in the list' : 'Clique em um evento na lista'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEventForm && (
        <EventForm
          event={editingEvent}
          onSave={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          isEn={isEn}
        />
      )}

      {showTicketForm && (
        <TicketForm
          ticket={editingTicket}
          eventId={selectedEvent?.id}
          onSave={editingTicket ? handleUpdateTicket : handleCreateTicket}
          onCancel={() => {
            setShowTicketForm(false);
            setEditingTicket(null);
          }}
          isEn={isEn}
        />
      )}
    </div>
  );
}