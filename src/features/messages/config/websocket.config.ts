/**
 * Configuración del sistema de WebSocket
 */

// URL del servidor WebSocket
// Cambiar según el entorno
export const WS_CONFIG = {
  // URL para desarrollo local
  DEV_SERVER_URL: 'http://localhost:3000',
  
  // URL para producción (cambiar según tu deployment)
  PROD_SERVER_URL: 'https://api-uniconnect.com',
  
  // Configuración de reconexión
  RECONNECTION_DELAY: 1000, // 1 segundo
  MAX_RECONNECTION_ATTEMPTS: 5,
  
  // Timeout para el indicador de typing
  TYPING_TIMEOUT: 3000, // 3 segundos
  
  // Configuración de paginación
  DEFAULT_MESSAGE_LIMIT: 50,
  HISTORY_PAGE_SIZE: 20,
} as const;

/**
 * Obtener URL del servidor según el entorno
 */
export const getServerUrl = (): string => {
  // Detectar si estamos en desarrollo o producción
  const isDevelopment = process.env.NODE_ENV === 'development' || __DEV__;
  
  return isDevelopment ? WS_CONFIG.DEV_SERVER_URL : WS_CONFIG.PROD_SERVER_URL;
};

/**
 * Tipos de notificaciones del sistema
 */
export enum NotificationType {
  GROUP_INVITATION = 'group_invitation',
  NEW_MESSAGE = 'new_message',
  INVITATION_ACCEPTED = 'invitation_accepted',
  NEW_MEMBER = 'new_member',
}

/**
 * Estados de conexión WebSocket
 */
export enum ConnectionState {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * Límites y validaciones de negocio
 */
export const BUSINESS_RULES = {
  MAX_GROUPS_PER_COURSE: 3,
  MAX_MESSAGE_LENGTH: 1000,
  MIN_GROUP_NAME_LENGTH: 3,
  MAX_GROUP_NAME_LENGTH: 50,
  MAX_GROUP_DESCRIPTION_LENGTH: 200,
} as const;
