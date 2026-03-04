export const NOTIFICATIONS_ENDPOINTS = {
    REGISTER_EXPO_PUSH_TOKEN: '/notifications/expo-push-token',
    REMOVE_EXPO_PUSH_TOKEN: (token: string) => `/notifications/expo-push-token/${token}`,
    GET_MY_NOTIFICATIONS: '/notifications',
    MARK_AS_READ: (id: number) => `/notifications/${id}/read`,
    MARK_ALL_AS_READ: '/notifications/read-all',
} as const;