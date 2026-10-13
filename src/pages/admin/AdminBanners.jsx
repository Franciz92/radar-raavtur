// src/pages/admin/AdminBanners.jsx
// ============================================
// ADMIN - GESTO DE BANNERS
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Upload, X,
  Image as ImageIcon, ArrowUp, ArrowDown, Link as LinkIcon,
  Sparkles, Save, Loader2, AlertCircle, CheckCircle,
  Monitor, PanelTop, ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import {
  getAllBanners, createBanner, updateBanner, deleteBanner,
  reorderBanners, uploadBannerImage, deleteBannerImage,
} from '../../services/bannerService';
import { useBanners } from '../../context/BannerContext';

const PLACEMENTS = {
  home_hero: {
    label_pt: 'Homepage — Hero (grande)',
    label_en: 'Homepage — Hero (large)',
    icon: Monitor,
    desc_pt: 'Slides grandes no topo da homepage',
    desc_en: 'Large slides on homepage hero',
  },
  header_top: {
    label_pt: 'Header — Top Bar (fino)',
    label_en: 'Header — Top Bar (thin)',
    icon: PanelTop,
    desc_pt: 'Faixa fina no topo do header',
    desc_en: 'Thin bar at top of header',
  },
};

const EMPTY_FORM = {
  id: null,
  placement: 'home_hero',
  title_pt: '',
  title_en: '',
  subtitle_pt: '',
  subtitle_en: '',
  badge_pt: '',
  badge_en: '',
  cta_pt: 'Ver mais',
  cta_en: 'See more',
  link: '/destinos',
  image_url: '',
  position: 0,
  is_active: true,
  starts_at: '',
  ends_at: '',
  stats: [],
};

export default function AdminBanners() {
  const { isEn } = useLanguage();
  const { refresh: refreshPublic } = useBanners();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home_hero');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ============================================
  // CARREGAR
  // ============================================
  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllBanners();
    setBanners(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = banners.filter((b) => b.placement === activeTab);

  // ============================================
  // ABRIR FORM
  // ============================================
  const openNew = () => {
    setForm({
      ...EMPTY_FORM,
      placement: activeTab,
      position: filtered.length,
    });
  };

  const openEdit = (banner) => {
    setForm({
      ...banner,
      starts_at: banner.starts_at ? banner.starts_at.slice(0, 16) : '',
      ends_at: banner.ends_at ? banner.ends_at.slice(0, 16) : '',
    });
  };

  // ============================================
  // GUARDAR
  // ============================================
  const handleSave = async () => {
    if (!form) return;
    if (!form.image_url) {
      toast.error(isEn ? 'Please add an image' : 'Adiciona uma imagem');
      return;
    }
    if (!form.title_pt && !form.title_en) {
      toast.error(isEn ? 'Please add a title' : 'Adiciona um título');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        placement: form.placement,
        title_pt: form.title_pt || '',
        title_en: form.title_en || '',
        subtitle_pt: form.subtitle_pt || '',
        subtitle_en: form.subtitle_en || '',
        badge_pt: form.badge_pt || '',
        badge_en: form.badge_en || '',
        cta_pt: form.cta_pt || '',
        cta_en: form.cta_en || '',
        link: form.link || '/destinos',
        image_url: form.image_url,
        position: form.position ?? 0,
        is_active: !!form.is_active,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        stats: Array.isArray(form.stats) ? form.stats : [],
      };

      if (form.id) {
        await updateBanner(form.id, payload);
        toast.success(isEn ? 'Banner updated!' : 'Banner atualizado!');
      } else {
        await createBanner(payload);
        toast.success(isEn ? 'Banner created!' : 'Banner criado!');
      }

      setForm(null);
      await load();
      refreshPublic();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Erro ao guardar');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // ELIMINAR
  // ============================================
  const handleDelete = async (banner) => {
    const ok = confirm(
      isEn ? 'Delete this banner? This cannot be undone.' : 'Eliminar este banner? Não pode ser desfeito.'
    );
    if (!ok) return;
    try {
      await deleteBanner(banner.id);
      // Tentar apagar imagem (se for do bucket)
      await deleteBannerImage(banner.image_url);
      toast.success(isEn ? 'Banner deleted' : 'Banner eliminado');
      await load();
      refreshPublic();
    } catch (err) {
      toast.error(err.message || 'Erro ao eliminar');
    }
  };

  // ============================================
  // TOGGLE ATIVO
  // ============================================
  const handleToggleActive = async (banner) => {
    try {
      await updateBanner(banner.id, { is_active: !banner.is_active });
      await load();
      refreshPublic();
    } catch (err) {
      toast.error('Erro ao alterar estado');
    }
  };

  // ============================================
  // REORDENAR
  // ============================================
  const move = async (banner, direction) => {
    const list = [...filtered].sort((a, b) => a.position - b.position);
    const idx = list.findIndex((b) => b.id === banner.id);
    const target = idx + direction;
    if (target < 0 || target >= list.length) return;

    [list[idx], list[target]] = [list[target], list[idx]];
    const orderedIds = list.map((b) => b.id);

    // Otimista
    setBanners((prev) =>
      prev.map((b) => {
        const pos = orderedIds.indexOf(b.id);
        return pos >= 0 ? { ...b, position: pos } : b;
      })
    );

    try {
      await reorderBanners(orderedIds);
      refreshPublic();
    } catch (err) {
      toast.error('Erro ao reordenar');
      await load();
    }
  };

  // ============================================
  // UPLOAD
  // ============================================
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(isEn ? 'Only images allowed' : 'Apenas imagens são permitidas');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error(isEn ? 'Max 8MB' : 'Máximo 8MB');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadBannerImage(file);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success(isEn ? 'Image uploaded!' : 'Imagem carregada!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar imagem');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <ImageIcon className="text-amber-500" size={32} />
              {isEn ? 'Banner Management' : 'Gestão de Banners'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {isEn
                ? 'Manage the images and content shown on homepage and header'
                : 'Gere as imagens e conteúdos mostrados na homepage e no header'}
            </p>
          </div>
          <button onClick={openNew} className="btn-primary inline-flex items-center gap-2 px-5 py-3">
            <Plus size={18} />
            {isEn ? 'New banner' : 'Novo banner'}
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
          {Object.entries(PLACEMENTS).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const count = banners.filter((b) => b.placement === key).length;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                {isEn ? cfg.label_en : cfg.label_pt}
                <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* INFO */}
        <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
          <strong>{isEn ? 'Where it appears:' : 'Onde aparece:'}</strong>{' '}
          {isEn ? PLACEMENTS[activeTab].desc_en : PLACEMENTS[activeTab].desc_pt}
        </div>

        {/* LISTA */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-amber-500" size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <ImageIcon className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={56} />
            <p className="text-slate-500 mb-4">
              {isEn ? 'No banners yet in this section' : 'Ainda não há banners nesta secção'}
            </p>
            <button onClick={openNew} className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} />
              {isEn ? 'Create first banner' : 'Criar primeiro banner'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered
              .sort((a, b) => a.position - b.position)
              .map((banner, idx) => (
                <BannerCard
                  key={banner.id}
                  banner={banner}
                  index={idx}
                  total={filtered.length}
                  isEn={isEn}
                  onEdit={() => openEdit(banner)}
                  onDelete={() => handleDelete(banner)}
                  onToggle={() => handleToggleActive(banner)}
                  onMoveUp={() => move(banner, -1)}
                  onMoveDown={() => move(banner, +1)}
                />
              ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {form && (
        <BannerModal
          form={form}
          setForm={setForm}
          onClose={() => setForm(null)}
          onSave={handleSave}
          saving={saving}
          uploading={uploading}
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
          isEn={isEn}
        />
      )}
    </div>
  );
}

// ============================================
// CARD
// ============================================
function BannerCard({ banner, index, total, isEn, onEdit, onDelete, onToggle, onMoveUp, onMoveDown }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      <div className="relative h-44 bg-slate-100 dark:bg-slate-800">
        {banner.image_url ? (
          <img src={banner.image_url} alt={banner.title_pt} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <ImageIcon size={40} />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-black/60 text-white backdrop-blur">
            #{index + 1}
          </span>
          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full backdrop-blur ${
            banner.is_active ? 'bg-green-500/80 text-white' : 'bg-slate-500/80 text-white'
          }`}>
            {banner.is_active ? (isEn ? 'Active' : 'Ativo') : (isEn ? 'Inactive' : 'Inativo')}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-slate-900 dark:text-white truncate">
          {isEn ? banner.title_en || banner.title_pt : banner.title_pt || banner.title_en || '—'}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
          {isEn ? banner.subtitle_en || banner.subtitle_pt : banner.subtitle_pt || banner.subtitle_en}
        </p>
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
          <LinkIcon size={12} />
          <span className="truncate">{banner.link}</span>
        </div>

        <div className="flex items-center justify-between gap-1 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
              title="Mover para cima"
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
              title="Mover para baixo"
            >
              <ArrowDown size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title={banner.is_active ? 'Desativar' : 'Ativar'}
            >
              {banner.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              title="Editar"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MODAL
// ============================================
function BannerModal({ form, setForm, onClose, onSave, saving, uploading, fileInputRef, onFileSelect, isEn }) {
  const upd = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Sparkles className="text-amber-500" size={20} />
            {form.id ? (isEn ? 'Edit banner' : 'Editar banner') : (isEn ? 'New banner' : 'Novo banner')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* PLACEMENT */}
          <div>
            <label className="block text-sm font-bold mb-2">
              {isEn ? 'Placement' : 'Localização'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(PLACEMENTS).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => upd('placement', key)}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      form.placement === key
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={20} className={form.placement === key ? 'text-amber-500' : 'text-slate-400'} />
                    <div>
                      <p className="font-bold text-sm">{isEn ? cfg.label_en : cfg.label_pt}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{isEn ? cfg.desc_en : cfg.desc_pt}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* IMAGEM */}
          <div>
            <label className="block text-sm font-bold mb-2">
              {isEn ? 'Image' : 'Imagem'} *
            </label>
            {form.image_url ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <img src={form.image_url} alt="preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => upd('image_url', '')}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-48 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-amber-500 transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={32} />
                    <span className="text-sm font-semibold">{isEn ? 'Uploading...' : 'A carregar...'}</span>
                  </>
                ) : (
                  <>
                    <Upload size={32} />
                    <span className="text-sm font-semibold">{isEn ? 'Click to upload image' : 'Clica para carregar imagem'}</span>
                    <span className="text-xs">JPG, PNG, WEBP — máx 8MB</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileSelect}
              className="hidden"
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={form.image_url}
                onChange={(e) => upd('image_url', e.target.value)}
                placeholder={isEn ? 'Or paste image URL' : 'Ou cola URL da imagem'}
                className="input-field text-xs flex-1"
              />
            </div>
          </div>

          {/* TÍTULOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Título (PT) *</label>
              <input
                type="text"
                value={form.title_pt}
                onChange={(e) => upd('title_pt', e.target.value)}
                className="input-field"
                placeholder="Visite e Conheça Angola"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Title (EN)</label>
              <input
                type="text"
                value={form.title_en}
                onChange={(e) => upd('title_en', e.target.value)}
                className="input-field"
                placeholder="Visit and Discover Angola"
              />
            </div>
          </div>

          {/* SUBTÍTULOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Subtítulo (PT)</label>
              <textarea
                value={form.subtitle_pt}
                onChange={(e) => upd('subtitle_pt', e.target.value)}
                className="input-field min-h-[80px]"
                placeholder="Viagens extraordinárias..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Subtitle (EN)</label>
              <textarea
                value={form.subtitle_en}
                onChange={(e) => upd('subtitle_en', e.target.value)}
                className="input-field min-h-[80px]"
                placeholder="Extraordinary journeys..."
              />
            </div>
          </div>

          {/* BADGES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Badge (PT)</label>
              <input
                type="text"
                value={form.badge_pt}
                onChange={(e) => upd('badge_pt', e.target.value)}
                className="input-field"
                placeholder="Mais Procurado"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Badge (EN)</label>
              <input
                type="text"
                value={form.badge_en}
                onChange={(e) => upd('badge_en', e.target.value)}
                className="input-field"
                placeholder="Most Wanted"
              />
            </div>
          </div>

          {/* CTA + LINK */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">CTA (PT)</label>
              <input
                type="text"
                value={form.cta_pt}
                onChange={(e) => upd('cta_pt', e.target.value)}
                className="input-field"
                placeholder="Ver mais"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">CTA (EN)</label>
              <input
                type="text"
                value={form.cta_en}
                onChange={(e) => upd('cta_en', e.target.value)}
                className="input-field"
                placeholder="See more"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Link</label>
              <input
                type="text"
                value={form.link}
                onChange={(e) => upd('link', e.target.value)}
                className="input-field"
                placeholder="/destinos"
              />
            </div>
          </div>

          {/* DATAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                {isEn ? 'Starts at (optional)' : 'Começa em (opcional)'}
              </label>
              <input
                type="datetime-local"
                value={form.starts_at || ''}
                onChange={(e) => upd('starts_at', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                {isEn ? 'Ends at (optional)' : 'Termina em (opcional)'}
              </label>
              <input
                type="datetime-local"
                value={form.ends_at || ''}
                onChange={(e) => upd('ends_at', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* ATIVO */}
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => upd('is_active', e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="font-bold text-sm">
              {isEn ? 'Active (visible on site)' : 'Ativo (visível no site)'}
            </span>
          </label>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            {isEn ? 'Cancel' : 'Cancelar'}
          </button>
          <button
            onClick={onSave}
            disabled={saving || uploading}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? (isEn ? 'Saving...' : 'A guardar...') : (isEn ? 'Save' : 'Guardar')}
          </button>
        </div>
      </div>
    </div>
  );
}