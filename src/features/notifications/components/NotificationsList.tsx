import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { notificationsService } from '../services/notifications.service';
import { Notification } from '../types';
import { useAuthStore } from '@/src/features/auth';

export function NotificationsList() {
    const { token: authToken } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState<number | null>(null); // id de notificación que se está marcando

    // Cargar notificaciones al montar
    useEffect(() => {
        if (!authToken) return;

        async function loadNotifications() {
            setLoading(true);
            try {
                const data = await notificationsService.getMyNotifications();
                setNotifications(data);
            } catch (error) {
                console.error('Error cargando notificaciones', error);
            } finally {
                setLoading(false);
            }
        }

        loadNotifications();
    }, [authToken]);

    const handleMarkAsRead = async (id: number) => {
        setMarking(id);
        try {
            await notificationsService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id_notification === id ? { ...n, is_read: true } : n))
            );
        } catch (error) {
            console.error('Error marcando notificación como leída', error);
        } finally {
            setMarking(null);
        }
    };

    if (loading) {
        return (
            <View style= { styles.center } >
            <ActivityIndicator size="large" color = "#D9B97E" />
                </View>
    );
    }

    if (!notifications.length) {
        return (
            <View style= { styles.center } >
            <Text style={ styles.emptyText }> No tienes notificaciones.</Text>
                </View>
    );
    }

    return (
        <FlatList
      data= { notifications }
    keyExtractor = {(item) => item.id_notification.toString()
}
contentContainerStyle = {{ padding: 16 }}
renderItem = {({ item }) => (
    <TouchableOpacity
          style= { [styles.card, item.is_read && styles.readCard]}
onPress = {() => handleMarkAsRead(item.id_notification)}
activeOpacity = { 0.7}
disabled = { item.is_read || marking === item.id_notification }
    >
    <>
    <View style={ styles.cardHeader }>
        <Text style={ styles.message }> { item.message } </Text>
{
    marking === item.id_notification ? (
        <ActivityIndicator size= "small" color = "#D9B97E" />
              ) : null
}
</View>
{
    item.created_at && (
        <Text style={ styles.date }>
            { new Date(item.created_at).toLocaleString() }
            </Text>
            )
}
</>
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