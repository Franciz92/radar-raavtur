// src/utils/permissions.js

export const ROLES = {
  ADMIN: 'admin',
  COMPANY: 'company',
  USER: 'user'
}

export const BLOG_PERMISSIONS = {
  // Apenas admin pode criar, editar, excluir
  CREATE: [ROLES.ADMIN],
  EDIT: [ROLES.ADMIN],
  DELETE: [ROLES.ADMIN],
  // Todos podem ver e baixar
  VIEW: [ROLES.ADMIN, ROLES.COMPANY, ROLES.USER],
  DOWNLOAD: [ROLES.ADMIN, ROLES.COMPANY, ROLES.USER]
}

export const hasPermission = (userRole, action) => {
  if (!userRole) return false
  const allowedRoles = BLOG_PERMISSIONS[action] || []
  return allowedRoles.includes(userRole)
}