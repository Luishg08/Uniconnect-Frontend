export const EVENTS_ENDPOINTS = {
  GET_EVENTS: '/events',
  CREATE_EVENT: '/events', // ⭐ NUEVO: POST /events
  GET_EVENT_BY_ID: (id: string) => `/events/${id}`,
  UPDATE_EVENT: (id: string) => `/events/${id}`,
  DELETE_EVENT: (id: string) => `/events/${id}`,
};
