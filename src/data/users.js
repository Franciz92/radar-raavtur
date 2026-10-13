export const mockUsers = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@email.com',
    password: '123456',
    phone: '+244 923 456 789',
    avatar: null,
    type: 'user',
    location: {
      province: 'Luanda',
      city: 'Luanda'
    },
    preferences: {
      language: 'pt',
      currency: 'Kz',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    },
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    password: '123456',
    phone: '+244 924 123 789',
    avatar: null,
    type: 'business',
    companyId: 1,
    location: {
      province: 'Luanda',
      city: 'Luanda'
    },
    preferences: {
      language: 'pt',
      currency: 'Kz',
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    },
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 3,
    name: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    password: '123456',
    phone: '+244 925 456 123',
    avatar: null,
    type: 'business',
    companyId: 2,
    location: {
      province: 'Luanda',
      city: 'Luanda'
    },
    preferences: {
      language: 'pt',
      currency: 'Kz',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    },
    status: 'active',
    createdAt: '2024-01-02T10:00:00Z'
  },
  {
    id: 4,
    name: 'Ana Pereira',
    email: 'ana.pereira@email.com',
    password: '123456',
    phone: '+244 926 789 456',
    avatar: null,
    type: 'business',
    companyId: 3,
    location: {
      province: 'Benguela',
      city: 'Benguela'
    },
    preferences: {
      language: 'pt',
      currency: 'Kz',
      notifications: {
        email: true,
        sms: true,
        push: false
      }
    },
    status: 'active',
    createdAt: '2024-01-02T10:00:00Z'
  },
  {
    id: 5,
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@email.com',
    password: '123456',
    phone: '+244 927 123 789',
    avatar: null,
    type: 'business',
    companyId: 4,
    location: {
      province: 'Luanda',
      city: 'Luanda'
    },
    preferences: {
      language: 'pt',
      currency: 'Kz',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    },
    status: 'active',
    createdAt: '2024-01-03T10:00:00Z'
  },
  {
    id: 6,
    name: 'Administrador',
    email: 'admin@radarravtur.ao',
    password: 'admin123',
    phone: '+244 900 000 000',
    avatar: null,
    type: 'admin',
    location: {
      province: 'Luanda',
      city: 'Luanda'
    },
    preferences: {
      language: 'pt',
      currency: 'Kz',
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    },
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z'
  }
]