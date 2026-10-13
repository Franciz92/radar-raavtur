// src/utils/serviceActions.js
// ============================================
// Ações contextuais por tipo de serviço
// "Comprar" vs "Reservar" vs "Marcar" vs "Inscrever" vs "Contratar" vs "Solicitar"
//
// ✅ Deteção por PALAVRA-CHAVE (substring match)
// ✅ Suporta categorias em PT e EN
// ✅ Ordem importa: primeiro match ganha
// ============================================

// ============================================
// MAPA DE PALAVRAS-CHAVE → AÇO
// ============================================
const KEYWORD_MAP = [
  // ────────────────────────────────────────
  // 🍽️ COMIDA / RESTAURANTE → "Comprar"
  // ────────────────────────────────────────
  {
    keywords: [
      'restaur', 'food', 'comida', 'alimenta', 'cozinha', 'lanche',
      'pizza', 'burger', 'hamburger', 'sushi', 'takeaway', 'take-away',
      'delivery', 'menu', 'prato', 'refeição', 'refeicao', 'meal',
      'churrasco', 'grelhado', 'fast food', 'fastfood',
      'padaria', 'bakery', 'pastelaria', 'doce', 'bolo', 'gelado',
    ],
    action: { pt: 'Comprar', en: 'Buy', icon: 'ShoppingCart' },
  },

  // Bebidas / Bar
  {
    keywords: [
      'bebida', 'drink', 'sumo', 'juice', 'vinho', 'wine',
      'cerveja', 'beer', 'cocktail', 'café', 'cafe',
    ],
    action: { pt: 'Comprar', en: 'Buy', icon: 'ShoppingCart' },
  },

  // Catering / Buffet
  {
    keywords: ['catering', 'buffet', 'banquete'],
    action: { pt: 'Contratar', en: 'Hire', icon: 'Handshake' },
  },

  // ────────────────────────────────────────
  // 🏨 HOTELARIA → "Reservar"
  // ────────────────────────────────────────
  {
    keywords: [
      'hotel', 'hotei', 'pousada', 'lodge', 'hostel', 'resort',
      'alojamento', 'accommodation', 'hospedagem', 'quarto', 'room',
      'estadia', 'inn', 'motel', 'bed and breakfast', 'b&b',
    ],
    action: { pt: 'Reservar', en: 'Book', icon: 'Calendar' },
  },

  // ────────────────────────────────────────
  // 🎭 TURISMO / EXPERIÊNCIAS → "Reservar"
  // ────────────────────────────────────────
  {
    keywords: [
      'turismo', 'tour', 'experienc', 'viagem', 'travel',
      'agência', 'agencia', 'agency', 'guide', 'guia',
      'aventura', 'adventure', 'passeio', 'safari', 'excursão', 'excursao',
    ],
    action: { pt: 'Reservar', en: 'Book', icon: 'Calendar' },
  },

  // ────────────────────────────────────────
  // 🎫 EVENTOS → "Comprar bilhete"
  // ────────────────────────────────────────
  {
    keywords: [
      'evento', 'event', 'show', 'concerto', 'concert', 'festival',
      'espetáculo', 'espetaculo', 'teatro', 'theater', 'theatre',
      'cinema', 'festa', 'party',
    ],
    action: { pt: 'Comprar bilhete', en: 'Buy ticket', icon: 'Ticket' },
  },

  // ────────────────────────────────────────
  // 💆 BEM-ESTAR / SAÚDE → "Marcar"
  // ────────────────────────────────────────
  {
    keywords: [
      'spa', 'massag', 'terapia', 'therapy', 'saúde', 'saude', 'health',
      'clínica', 'clinica', 'clinic', 'estética', 'estetica', 'beauty',
      'beleza', 'cabeleireiro', 'barbeiro', 'barber', 'manicure',
      'wellness', 'bem-estar', 'bem estar', 'dentista', 'dentist',
    ],
    action: { pt: 'Marcar', en: 'Schedule', icon: 'Calendar' },
  },

  // ────────────────────────────────────────
  // 📚 EDUCAÇO / FITNESS → "Inscrever"
  // ────────────────────────────────────────
  {
    keywords: [
      'curso', 'course', 'aula', 'class', 'escola', 'school',
      'educação', 'educacao', 'education', 'formação', 'formacao',
      'ginásio', 'ginasio', 'gym', 'fitness', 'treino', 'training',
      'workshop', 'seminário', 'seminario', 'palestra',
    ],
    action: { pt: 'Inscrever', en: 'Enroll', icon: 'PenTool' },
  },

  // ────────────────────────────────────────
  // 🛍️ RETAIL / LOJAS → "Comprar"
  // ────────────────────────────────────────
  {
    keywords: [
      'loja', 'shop', 'store', 'retail', 'mercado', 'market',
      'boutique', 'souvenir', 'recordação', 'recordacao', 'artesanato',
      'moda', 'fashion', 'roupa', 'clothing', 'calçado', 'calcado',
      'sapato', 'shoe',
    ],
    action: { pt: 'Comprar', en: 'Buy', icon: 'ShoppingCart' },
  },

  // Arte / Cultura
  {
    keywords: [
      'arte', 'art ', 'cultura', 'culture', 'galeria', 'gallery',
      'museu', 'museum',
    ],
    action: { pt: 'Comprar', en: 'Buy', icon: 'ShoppingCart' },
  },

  // ────────────────────────────────────────
  // 🔧 SERVIÇOS TÉCNICOS → "Solicitar"
  // ────────────────────────────────────────
  {
    keywords: [
      'técnic', 'tecnic', 'technical', 'repara', 'repair', 'conserto',
      'manutenção', 'manutencao', 'maintenance', 'limpeza', 'cleaning',
      'construção', 'construcao', 'construction', 'elétric', 'electric',
      'encanador', 'plumber', 'pintura', 'painting',
      'jardinagem', 'gardening',
    ],
    action: { pt: 'Solicitar', en: 'Request', icon: 'Wrench' },
  },

  // ────────────────────────────────────────
  // 🚗 ALUGUER → "Reservar"
  // ────────────────────────────────────────
  {
    keywords: [
      'aluguer', 'aluguel', 'rental', 'rent', 'carro', 'car ',
      'veículo', 'veiculo', 'vehicle', 'automóvel', 'automovel',
      'automobile',
    ],
    action: { pt: 'Reservar', en: 'Book', icon: 'Calendar' },
  },

  // ────────────────────────────────────────
  // 🚕 TRANSPORTE → "Reservar"
  // ────────────────────────────────────────
  {
    keywords: [
      'transport', 'taxi', 'transfer', 'motorista', 'driver',
      'shuttle', 'van ', 'ônibus', 'onibus', 'bus ',
    ],
    action: { pt: 'Reservar', en: 'Book', icon: 'Calendar' },
  },

  // ────────────────────────────────────────
  // 📸 CRIATIVO → "Contratar"
  // ────────────────────────────────────────
  {
    keywords: [
      'fotograf', 'photograph', 'photo', 'video', 'vídeo',
      'filmagem', 'filming', 'designer', 'design', 'branding',
    ],
    action: { pt: 'Contratar', en: 'Hire', icon: 'Handshake' },
  },

  // ────────────────────────────────────────
  // 💼 PROFISSIONAL → "Contratar"
  // ────────────────────────────────────────
  {
    keywords: [
      'advogado', 'lawyer', 'consult', 'contabil', 'account',
      'jurídic', 'juridic', 'legal', 'auditor', 'audit',
    ],
    action: { pt: 'Contratar', en: 'Hire', icon: 'Handshake' },
  },
];

// ============================================
// FALLBACK PADRO
// ============================================
export const DEFAULT_ACTION = { pt: 'Reservar', en: 'Book', icon: 'Calendar' };

// ============================================
// FUNÇO PRINCIPAL
// ============================================
/**
 * Retorna a ação correta para uma categoria
 * Usa deteção por palavra-chave (funciona em PT e EN)
 *
 * @param {string} category - categoria (ex: 'Restaurante', 'hotel', 'Comida')
 * @param {string} language - 'pt' | 'en'
 * @returns {{ label: string, icon: string }}
 */
export function getServiceAction(category, language = 'pt') {
  const key = String(category || '').toLowerCase().trim();

  if (!key) {
    return {
      label: language === 'en' ? DEFAULT_ACTION.en : DEFAULT_ACTION.pt,
      icon: DEFAULT_ACTION.icon,
    };
  }

  // Procurar por palavra-chave (substring match)
  for (const entry of KEYWORD_MAP) {
    const matched = entry.keywords.some((kw) => key.includes(kw));
    if (matched) {
      return {
        label: language === 'en' ? entry.action.en : entry.action.pt,
        icon: entry.action.icon,
      };
    }
  }

  // Fallback
  return {
    label: language === 'en' ? DEFAULT_ACTION.en : DEFAULT_ACTION.pt,
    icon: DEFAULT_ACTION.icon,
  };
}

// ============================================
// HELPERS
// ============================================
/**
 * Verifica se é uma categoria de comida
 */
export function isFoodCategory(category) {
  const key = String(category || '').toLowerCase().trim();
  const foodKeywords = [
    'restaur', 'food', 'comida', 'alimenta', 'cozinha', 'lanche',
    'pizza', 'burger', 'sushi', 'padaria', 'bakery', 'pastelaria',
    'bebida', 'drink', 'café', 'cafe',
  ];
  return foodKeywords.some((kw) => key.includes(kw));
}

/**
 * Verifica se é um serviço de agendamento (Marcar)
 */
export function isScheduleCategory(category) {
  const key = String(category || '').toLowerCase().trim();
  const scheduleKeywords = [
    'spa', 'massag', 'terapia', 'therapy', 'saúde', 'saude', 'health',
    'clínica', 'clinica', 'estética', 'estetica', 'beauty', 'beleza',
    'cabeleireiro', 'barbeiro', 'manicure',
  ];
  return scheduleKeywords.some((kw) => key.includes(kw));
}

/**
 * Verifica se é um serviço de evento (Comprar bilhete)
 */
export function isEventCategory(category) {
  const key = String(category || '').toLowerCase().trim();
  const eventKeywords = [
    'evento', 'event', 'show', 'concerto', 'concert', 'festival',
    'espetáculo', 'espetaculo', 'teatro', 'cinema', 'festa',
  ];
  return eventKeywords.some((kw) => key.includes(kw));
}