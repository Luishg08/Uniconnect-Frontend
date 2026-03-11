import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Message } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  isAdmin: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const showOptions = () => {
    const options = [];
    
    // Solo el autor puede editar
    if (isOwnMessage && onEdit) {
      options.push({
        text: 'Editar',
        onPress: onEdit,
      });
    }
    
    // El autor o admin pueden eliminar
    if ((isOwnMessage || isAdmin) && onDelete) {
      options.push({
        text: 'Eliminar',
        onPress: () => {
          Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar este mensaje?',
            [
              { text: 'Cancelar', style: 'cancel' as const },
              { text: 'Eliminar', onPress: onDelete, style: 'destructive' as const },
            ]
          );
        },
        style: 'destructive' as const,
      });
    }
    
    options.push({
      text: 'Cancelar',
      style: 'cancel' as const,
    });
    
    if (options.length > 1) {
      Alert.alert('Opciones', '', options);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
      onLongPress={showOptions}
      activeOpacity={0.7}
    >
      {!isOwnMessage && (
        <View style={styles.header}>
          {message.membership?.user?.picture ? (
            <Image
              source={{ uri: message.membership.user.picture }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          )}
          <Text style={styles.userName}>
            {message.membership?.user?.full_name || 'Usuario'}
          </Text>
        </View>
      )}
      
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          ]}
        >
          {message.text_content}
        </Text>
        
        <View style={styles.footer}>
          <Text style={[styles.time, isOwnMessage && styles.ownTime]}>
            {formatTime(message.send_at)}
          </Text>
          {message.is_edited && (
            <Text style={[styles.editedBadge, isOwnMessage && styles.ownTime]}>
              editado
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D9B97E',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#D9B97E',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#2a2a2a',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: '#1a1a1a',
  },
  otherMessageText: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF',
    marginRight: 4,
  },
  ownTime: {
    color: '#4a4a4a',
  },
  editedBadge: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#9CA3AF',
  },
});
