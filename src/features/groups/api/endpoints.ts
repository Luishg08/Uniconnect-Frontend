import { API_BASE_URL } from '@/src/constants/api';

export const groupsEndpoints = {
  // Crear nuevo grupo
  createGroup: () =>
    `${API_BASE_URL}/groups`,
  
  // Obtener grupos creados por el usuario
  getCreatedGroups: (userId: number) =>
    `${API_BASE_URL}/groups/created-by/${userId}`,
  
  // Obtener grupos donde el usuario es miembro
  getMemberGroups: (userId: number) =>
    `${API_BASE_URL}/groups/member-of/${userId}`,
  
  // Descubrir grupos disponibles
  discoverGroups: (userId: number) =>
    `${API_BASE_URL}/groups/discover/${userId}`,
  
  // Obtener grupos por materia
  getGroupsByCourse: (courseId: number) =>
    `${API_BASE_URL}/groups/by-course/${courseId}`,
  
  // Obtener detalle de un grupo
  getGroupDetail: (groupId: number) =>
    `${API_BASE_URL}/groups/${groupId}`,
  
  // Eliminar grupo
  deleteGroup: (groupId: number) =>
    `${API_BASE_URL}/groups/${groupId}`,
};

export const groupInvitationsEndpoints = {
  // Enviar invitación
  sendInvitation: () =>
    `${API_BASE_URL}/group-invitations`,
  
  // Obtener invitaciones pendientes
  getPendingInvitations: (userId: number) =>
    `${API_BASE_URL}/group-invitations/pending/${userId}`,
  
  // Obtener invitaciones enviadas
  getSentInvitations: (userId: number) =>
    `${API_BASE_URL}/group-invitations/sent/${userId}`,
  
  // Responder a invitación
  respondToInvitation: (invitationId: number) =>
    `${API_BASE_URL}/group-invitations/${invitationId}/respond`,
  
  // Cancelar invitación
  cancelInvitation: (invitationId: number) =>
    `${API_BASE_URL}/group-invitations/${invitationId}`,
};