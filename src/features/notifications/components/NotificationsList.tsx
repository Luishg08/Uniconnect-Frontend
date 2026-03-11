import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import axios from 'axios';
import { notificationsService } from '../services/notifications.service';
import { Notification } from '../types';
import { authStore } from '@/src/features/auth';
import { useNotificationsStore } from '../store/notifications.store';

export function NotificationsList() {
    const authToken = authStore.accessToken;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [marking, setMarking] = useState<number | null>(null);

    const setUnreadCount = useNotificationsStore(state => state.setUnreadCount);
    const decreaseUnread = useNotificationsStore(state => state.decreaseUnread);

    const loadNotifications = useCallback(async () => {
        if (!authToken) return;

        try {
            const data = await notificationsService.getMyNotifications();
            setNotifications(data);

            // Calcular no leídas y actualizar store global
            const unread = data.filter(n => !n.is_read).length;
            setUnreadCount(unread);

        } catch (error) {
            // Backend without notifications endpoint should not break the screen.
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setNotifications([]);
                setUnreadCount(0);
                return;
            }

            console.error('Error cargando notificaciones', error);
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [authToken, setUnreadCount]);

    useEffect(() => {
        async function init() {
            setLoading(true);
            await loadNotifications();
            setLoading(false);
        }

        init();
    }, [loadNotifications]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const handleMarkAsRead = async (id: number) => {
        setMarking(id);

        try {
            await notificationsService.markAsRead(id, authToken!);

            setNotifications((prev) =>
                prev.map((n) =>
                    n.id_notification === id ? { ...n, is_read: true } : n
                )
            );

            // Disminuir contador global
            decreaseUnread();

        } catch (error) {
            console.error('Error marcando notificación como leída', error);
        } finally {
            setMarking(null);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#D9B97E" />
            </View>
        );
    }

    if (!notifications.length) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyText}>
                    No tienes notificaciones.
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={notifications}
            keyExtractor={(item) => item.id_notification.toString()}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#D9B97E"
                />
            }
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={[
                        styles.card,
                        item.is_read && styles.readCard,
                    ]}
                    onPress={() => handleMarkAsRead(item.id_notification)}
                    activeOpacity={0.7}
                    disabled={item.is_read || marking === item.id_notification}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.message}>
                            {item.message}
                        </Text>

                        {marking === item.id_notification && (
                            <ActivityIndicator size="small" color="#D9B97E" />
                        )}
                    </View>

                    {item.created_at && (
                        <Text style={styles.date}>
                            {new Date(item.created_at).toLocaleString()}
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        />
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#aaa',
    },
    card: {
        backgroundColor: 'rgba(26,26,26,0.9)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(217,185,126,0.3)',
    },
    readCard: {
        backgroundColor: 'rgba(50,50,50,0.8)',
        opacity: 0.7,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        flex: 1,
    },
    date: {
        fontSize: 12,
        color: '#aaa',
    },
});