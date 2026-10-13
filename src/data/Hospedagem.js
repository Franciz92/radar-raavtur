export const mockHotels = [
  {
    id: 1,
    name: 'Hotel Baía Azul',
    type: 'Hotel de Luxo',
    description: 'Hotel de luxo localizado na marginal de Luanda com vista para o mar. Oferecemos acomodações de primeira classe, restaurante gourmet, spa e serviços premium.',
    mainImage: 'https://via.placeholder.com/800x500/059669/ffffff?text=Hotel+Baia+Azul',
    images: [
      'https://via.placeholder.com/800x500/059669/ffffff?text=Hotel+Baia+Azul+1',
      'https://via.placeholder.com/800x500/059669/ffffff?text=Hotel+Baia+Azul+2',
      'https://via.placeholder.com/800x500/059669/ffffff?text=Hotel+Baia+Azul+3',
      'https://via.placeholder.com/800x500/059669/ffffff?text=Hotel+Baia+Azul+4'
    ],
    rating: 4.6,
    reviewCount: 289,
    verified: true,
    priceRange: {
      min: 85000,
      max: 300000
    },
    location: {
      address: 'Marginal de Luanda, 456',
      city: 'Luanda',
      province: 'Luanda',
      coordinates: { lat: -8.8083, lng: 13.2244 }
    },
    phone: '+244 922 123 456',
    email: 'reservas@hotelbaiaazul.ao',
    website: 'www.hotelbaiaazul.ao',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    amenities: [
      'Piscina',
      'Restaurante',
      'Bar',
      'Spa',
      'Academia',
      'Estacionamento',
      'Wi-Fi Gratuito',
      'Serviço de Quarto',
      'Ar Condicionado',
      'Vista para o Mar',
      'Room Service 24h',
      'Transfer do Aeroporto'
    ],
    policies: [
      {
        title: 'Política de Cancelamento',
        description: 'Cancelamento gratuito até 48 horas antes do check-in. Após esse período, será cobrada uma noite.'
      },
      {
        title: 'Política de Crianças',
        description: 'Crianças até 5 anos não pagam. Crianças de 6 a 12 anos pagam 50% do valor da diária.'
      },
      {
        title: 'Política de Animais',
        description: 'Animais de estimação não são permitidos.'
      }
    ]
  },
  {
    id: 2,
    name: 'Hotel Diamante',
    type: 'Hotel 5 Estrelas',
    description: 'Hotel 5 estrelas no coração de Luanda. Oferece acomodações luxuosas, centro de convenções, restaurante internacional e serviços exclusivos.',
    mainImage: 'https://via.placeholder.com/800x500/7c3aed/ffffff?text=Hotel+Diamante',
    images: [
      'https://via.placeholder.com/800x500/7c3aed/ffffff?text=Hotel+Diamante+1',
      'https://via.placeholder.com/800x500/7c3aed/ffffff?text=Hotel+Diamante+2',
      'https://via.placeholder.com/800x500/7c3aed/ffffff?text=Hotel+Diamante+3'
    ],
    rating: 4.8,
    reviewCount: 342,
    verified: true,
    priceRange: {
      min: 120000,
      max: 450000
    },
    location: {
      address: 'Rua Rainha Ginga, 120',
      city: 'Luanda',
      province: 'Luanda',
      coordinates: { lat: -8.8183, lng: 13.2344 }
    },
    phone: '+244 923 456 789',
    email: 'info@hoteldiamante.ao',
    website: 'www.hoteldiamante.ao',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    amenities: [
      'Piscina Infinita',
      'Restaurante Gourmet',
      'Bar no Rooftop',
      'Spa & Wellness',
      'Academia Premium',
      'Estacionamento VIP',
      'Wi-Fi Alta Velocidade',
      'Serviço de Quarto',
      'Business Center',
      'Salão de Eventos',
      'Concierge',
      'Limousine Service'
    ],
    policies: [
      {
        title: 'Política de Cancelamento',
        description: 'Cancelamento gratuito até 72 horas antes do check-in.'
      },
      {
        title: 'Política de Crianças',
        description: 'Crianças até 6 anos não pagam.'
      },
      {
        title: 'Política de Animais',
        description: 'Animais de estimação pequenos são permitidos com taxa adicional.'
      }
    ]
  },
  {
    id: 3,
    name: 'Hotel Miramar',
    type: 'Hotel Boutique',
    description: 'Hotel boutique charmoso no bairro do Miramar. Decoração elegante, atendimento personalizado e ambiente acolhedor.',
    mainImage: 'https://via.placeholder.com/800x500/dc2626/ffffff?text=Hotel+Miramar',
    images: [
      'https://via.placeholder.com/800x500/dc2626/ffffff?text=Hotel+Miramar+1',
      'https://via.placeholder.com/800x500/dc2626/ffffff?text=Hotel+Miramar+2'
    ],
    rating: 4.4,
    reviewCount: 156,
    verified: true,
    priceRange: {
      min: 65000,
      max: 180000
    },
    location: {
      address: 'Rua do Miramar, 45',
      city: 'Luanda',
      province: 'Luanda',
      coordinates: { lat: -8.8283, lng: 13.2444 }
    },
    phone: '+244 924 789 123',
    email: 'contato@hotelmiramar.ao',
    website: 'www.hotelmiramar.ao',
    checkInTime: '13:00',
    checkOutTime: '11:00',
    amenities: [
      'Café da Manhã',
      'Restaurante',
      'Wi-Fi Gratuito',
      'Ar Condicionado',
      'Serviço de Quarto',
      'Lavandaria',
      'Estacionamento',
      'Terraço'
    ],
    policies: [
      {
        title: 'Política de Cancelamento',
        description: 'Cancelamento gratuito até 24 horas antes do check-in.'
      },
      {
        title: 'Política de Crianças',
        description: 'Crianças de todas as idades são bem-vindas.'
      }
    ]
  },
  {
    id: 4,
    name: 'Hotel Benguela Praia',
    type: 'Hotel de Praia',
    description: 'Hotel localizado na praia da Benguela. Perfeito para quem busca descanso e contato com a natureza.',
    mainImage: 'https://via.placeholder.com/800x500/ea580c/ffffff?text=Hotel+Benguela+Praia',
    images: [
      'https://via.placeholder.com/800x500/ea580c/ffffff?text=Hotel+Benguela+Praia+1',
      'https://via.placeholder.com/800x500/ea580c/ffffff?text=Hotel+Benguela+Praia+2',
      'https://via.placeholder.com/800x500/ea580c/ffffff?text=Hotel+Benguela+Praia+3'
    ],
    rating: 4.5,
    reviewCount: 198,
    verified: true,
    priceRange: {
      min: 70000,
      max: 200000
    },
    location: {
      address: 'Avenida da Praia, 789',
      city: 'Benguela',
      province: 'Benguela',
      coordinates: { lat: -12.5783, lng: 13.4072 }
    },
    phone: '+244 925 456 789',
    email: 'reservas@hotelbenguelapraia.ao',
    website: 'www.hotelbenguelapraia.ao',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    amenities: [
      'Acesso à Praia',
      'Piscina',
      'Restaurante',
      'Bar na Praia',
      'Wi-Fi Gratuito',
      'Ar Condicionado',
      'Estacionamento',
      'Atividades Aquáticas',
      'Passeios de Barco'
    ],
    policies: [
      {
        title: 'Política de Cancelamento',
        description: 'Cancelamento gratuito até 48 horas antes do check-in.'
      }
    ]
  },
  {
    id: 5,
    name: 'Hotel Huíla Vista',
    type: 'Hotel de Montanha',
    description: 'Hotel localizado nas montanhas da Huíla. Vista deslumbrante e clima agradável durante todo o ano.',
    mainImage: 'https://via.placeholder.com/800x500/2563eb/ffffff?text=Hotel+Huila+Vista',
    images: [
      'https://via.placeholder.com/800x500/2563eb/ffffff?text=Hotel+Huila+Vista+1',
      'https://via.placeholder.com/800x500/2563eb/ffffff?text=Hotel+Huila+Vista+2'
    ],
    rating: 4.3,
    reviewCount: 87,
    verified: true,
    priceRange: {
      min: 55000,
      max: 150000
    },
    location: {
      address: 'Estrada do Cristo Rei, 234',
      city: 'Lubango',
      province: 'Huíla',
      coordinates: { lat: -14.9167, lng: 13.4925 }
    },
    phone: '+244 926 123 456',
    email: 'info@hotelhuilavista.ao',
    website: null,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    amenities: [
      'Vista Panorâmica',
      'Restaurante',
      'Lareira',
      'Wi-Fi Gratuito',
      'Estacionamento',
      'Trilhas',
      'Jardim',
      'Sala de Jogos'
    ],
    policies: [
      {
        title: 'Política de Cancelamento',
        description: 'Cancelamento gratuito até 24 horas antes do check-in.'
      }
    ]
  }
]

export const mockRooms = [
  {
    id: 1,
    hotelId: 1,
    name: 'Quarto Standard',
    description: 'Quarto confortável com vista para a cidade. Inclui pequeno-almoço e acesso à piscina.',
    image: 'https://via.placeholder.com/600x400/059669/ffffff?text=Quarto+Standard',
    price: 85000,
    currency: 'Kz',
    capacity: 2,
    bedType: 'Cama Queen',
    size: 25,
    features: ['Ar Condicionado', 'Wi-Fi', 'TV', 'Frigobar', 'Banheiro Privado']
  },
  {
    id: 2,
    hotelId: 1,
    name: 'Quarto Deluxe',
    description: 'Quarto de luxo com vista para o mar, varanda privada e jacuzzi. Inclui pequeno-almoço premium.',
    image: 'https://via.placeholder.com/600x400/059669/ffffff?text=Quarto+Deluxe',
    price: 150000,
    currency: 'Kz',
    capacity: 2,
    bedType: 'Cama King',
    size: 40,
    features: ['Ar Condicionado', 'Wi-Fi Premium', 'TV Smart', 'Jacuzzi', 'Varanda', 'Vista Mar']
  },
  {
    id: 3,
    hotelId: 1,
    name: 'Suíte Presidencial',
    description: 'Suíte de luxo com sala de estar, escritório e vista panorâmica. Serviço de mordomo incluído.',
    image: 'https://via.placeholder.com/600x400/059669/ffffff?text=Suite+Presidencial',
    price: 300000,
    currency: 'Kz',
    capacity: 4,
    bedType: 'Cama King + Sofá-cama',
    size: 80,
    features: ['Ar Condicionado', 'Wi-Fi Premium', 'TV Smart', 'Sala de Estar', 'Escritório', 'Mordomo']
  },
  {
    id: 4,
    hotelId: 2,
    name: 'Quarto Executivo',
    description: 'Quarto executivo elegante com vista para a cidade. Perfeito para viajantes de negócios.',
    image: 'https://via.placeholder.com/600x400/7c3aed/ffffff?text=Quarto+Executivo',
    price: 120000,
    currency: 'Kz',
    capacity: 2,
    bedType: 'Cama Queen',
    size: 30,
    features: ['Ar Condicionado', 'Wi-Fi Alta Velocidade', 'TV Smart', 'Mesa de Trabalho']
  },
  {
    id: 5,
    hotelId: 2,
    name: 'Suíte Junior',
    description: 'Suíte espaçosa com sala de estar separada e banheira de hidromassagem.',
    image: 'https://via.placeholder.com/600x400/7c3aed/ffffff?text=Suite+Junior',
    price: 220000,
    currency: 'Kz',
    capacity: 3,
    bedType: 'Cama King + Sofá-cama',
    size: 55,
    features: ['Ar Condicionado', 'Wi-Fi Alta Velocidade', 'TV Smart', 'Hidromassagem', 'Sala de Estar']
  },
  {
    id: 6,
    hotelId: 2,
    name: 'Suíte Presidencial',
    description: 'A suíte mais luxuosa do hotel com vista panorâmica de 360° da cidade.',
    image: 'https://via.placeholder.com/600x400/7c3aed/ffffff?text=Suite+Presidencial',
    price: 450000,
    currency: 'Kz',
    capacity: 4,
    bedType: 'Cama King + 2 Sofá-camas',
    size: 100,
    features: ['Ar Condicionado', 'Wi-Fi Premium', 'TV 75"', 'Sala de Estar', 'Sala de Jantar', 'Mordomo']
  },
  {
    id: 7,
    hotelId: 3,
    name: 'Quarto Boutique',
    description: 'Quarto charmoso com decoração única e confortável.',
    image: 'https://via.placeholder.com/600x400/dc2626/ffffff?text=Quarto+Boutique',
    price: 65000,
    currency: 'Kz',
    capacity: 2,
    bedType: 'Cama Queen',
    size: 22,
    features: ['Ar Condicionado', 'Wi-Fi', 'TV', 'Decoração Exclusiva']
  },
  {
    id: 8,
    hotelId: 4,
    name: 'Quarto Vista Mar',
    description: 'Quarto com vista direta para o mar. Acorde com o som das ondas.',
    image: 'https://via.placeholder.com/600x400/ea580c/ffffff?text=Quarto+Vista+Mar',
    price: 70000,
    currency: 'Kz',
    capacity: 2,
    bedType: 'Cama Queen',
    size: 28,
    features: ['Ar Condicionado', 'Wi-Fi', 'TV', 'Varanda', 'Vista Mar']
  },
  {
    id: 9,
    hotelId: 5,
    name: 'Chalé Montanha',
    description: 'Chalé aconchegante com lareira e vista para as montanhas.',
    image: 'https://via.placeholder.com/600x400/2563eb/ffffff?text=Chale+Montanha',
    price: 55000,
    currency: 'Kz',
    capacity: 3,
    bedType: 'Cama Queen + Cama de Solteiro',
    size: 35,
    features: ['Lareira', 'Wi-Fi', 'TV', 'Vista Montanha', 'Aquecimento']
  }
]