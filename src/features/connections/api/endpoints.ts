export const CONNECTION_ENDPOINTS = {
  PENDING_REQUESTS: '/connections/pending',      // Obtener solicitudes pendientes
  MY_CONNECTIONS: '/connections',                // Obtener conexiones aceptadas
  SEND_REQUEST: '/connections/request',          // Enviar nueva solicitud
  ACCEPT_REQUEST: '/connections/:id/accept',    // Aceptar solicitud
  REJECT_REQUEST: '/connections/:id/reject',    // Rechazar solicitud
  CANCEL_REQUEST: '/connections/:id/cancel',    // Cancelar solicitud enviada
  DELETE_CONNECTION: '/connections/:id',        // Eliminar conexión existente
} as const;