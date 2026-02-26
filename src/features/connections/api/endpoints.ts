export const CONNECTION_ENDPOINTS = {
    PENDING_REQUESTS: '/connections/pending',
    SEND_REQUEST: '/connections/request',
    ACCEPT_REQUEST: '/connections/:id/accept',
    REJECT_REQUEST: '/connections/:id/reject',
} as const;