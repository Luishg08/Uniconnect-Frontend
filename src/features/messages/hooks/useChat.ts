import { useState, useEffect, useCallback, useRef } from 'react';
import { messagesService } from '../services/messages.service';
import { websocketService } from '../services/websocket.service';
import { Message, MessageSendData, TypingData } from '../types';

interface UseChatOptions {
  groupId: number;
  userId: number;
  membershipId: number;
  token: string;
  serverUrl?: string;
}

export const useChat = ({ groupId, userId, membershipId, token, serverUrl }: UseChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingData[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar mensajes iniciales
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messagesService.getRecentMessages(groupId, 50, token);
      setMessages(data.reverse()); // Ordenar del más antiguo al más reciente
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar mensajes');
      console.error('Error al cargar mensajes:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId, token]);

  // Conectar al WebSocket
  useEffect(() => {
    if (!websocketService.isConnected()) {
      websocketService.connect(serverUrl);
    }

    // Autenticar
    websocketService.authenticate({
      id_user: userId,
      id_membership: membershipId,
      id_group: groupId,
    });

    // Escuchar conexión
    const handleUserConnected = (data: any) => {
      console.log('Usuario conectado:', data);
      setIsConnected(true);
    };

    // Escuchar nuevos mensajes
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    // Escuchar ediciones
    const handleMessageEdited = (data: { id_message: number; text_content: string; is_edited: boolean; edited_at: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id_message === data.id_message
            ? { ...msg, text_content: data.text_content, is_edited: data.is_edited, edited_at: data.edited_at }
            : msg
        )
      );
    };

    // Escuchar eliminaciones
    const handleMessageDeleted = (data: { id_message: number }) => {
      setMessages((prev) => prev.filter((msg) => msg.id_message !== data.id_message));
    };

    // Escuchar typing
    const handleUserTyping = (data: TypingData) => {
      if (data.id_user === userId) return; // No mostrar nuestro propio typing
      
      if (data.is_typing) {
        setTypingUsers((prev) => {
          const exists = prev.some((u) => u.id_user === data.id_user);
          return exists ? prev : [...prev, data];
        });
      } else {
        setTypingUsers((prev) => prev.filter((u) => u.id_user !== data.id_user));
      }
    };

    websocketService.onUserConnected(handleUserConnected);
    websocketService.onNewMessage(handleNewMessage);
    websocketService.onMessageEdited(handleMessageEdited);
    websocketService.onMessageDeleted(handleMessageDeleted);
    websocketService.onUserTyping(handleUserTyping);

    // Cargar mensajes iniciales
    loadMessages();

    // Cleanup
    return () => {
      websocketService.off('user:connected', handleUserConnected);
      websocketService.off('message:new', handleNewMessage);
      websocketService.off('message:edited', handleMessageEdited);
      websocketService.off('message:deleted', handleMessageDeleted);
      websocketService.off('user:typing', handleUserTyping);
    };
  }, [groupId, userId, membershipId, token, serverUrl, loadMessages]);

  // Enviar mensaje
  const sendMessage = useCallback((text: string, attachments: string = '') => {
    if (!text.trim()) return;

    const messageData: MessageSendData = {
      id_membership: membershipId,
      text_content: text.trim(),
      attachments,
    };

    websocketService.sendMessage(messageData);
  }, [membershipId]);

  // Editar mensaje
  const editMessage = useCallback((messageId: number, newText: string) => {
    if (!newText.trim()) return;

    websocketService.editMessage({
      id_message: messageId,
      text_content: newText.trim(),
    });
  }, []);

  // Eliminar mensaje
  const deleteMessage = useCallback((messageId: number) => {
    websocketService.deleteMessage({
      id_message: messageId,
    });
  }, []);

  // Emitir typing indicator con debounce
  const emitTyping = useCallback((isTyping: boolean, fullName: string) => {
    // Limpiar timeout previo
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    websocketService.emitTyping({
      id_user: userId,
      full_name: fullName,
      is_typing: isTyping,
    });

    // Si está escribiendo, programar el "dejó de escribir" después de 3 segundos
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        websocketService.emitTyping({
          id_user: userId,
          full_name: fullName,
          is_typing: false,
        });
      }, 3000);
    }
  }, [userId]);

  // Cargar más mensajes (scroll infinito)
  const loadMoreMessages = useCallback((page: number, limit: number = 20) => {
    websocketService.loadHistory({ page, limit });
  }, []);

  // Buscar mensajes
  const searchMessages = useCallback((query: string) => {
    websocketService.searchMessages({ query });
  }, []);

  return {
    messages,
    loading,
    error,
    isConnected,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    emitTyping,
    loadMoreMessages,
    searchMessages,
    reloadMessages: loadMessages,
  };
};
