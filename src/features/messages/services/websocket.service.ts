import { io, Socket } from 'socket.io-client';
import { 
  Message, 
  MessageSendData, 
  MessageEditData, 
  MessageDeleteData,
  TypingData,
  MessagesHistoryData,
  MessageHistoryResponse,
  SearchMessagesData,
  MessageSearchResponse,
  SessionStatsResponse,
  AuthenticateData
} from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private currentUserId: number | null = null;
  private currentMembershipId: number | null = null;
  private currentGroupId: number | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  /**
   * Conectar al servidor WebSocket
   */
  connect(serverUrl: string = 'http://localhost:3000') {
    if (this.socket?.connected) {
      console.log('Ya conectado al WebSocket');
      return;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  /**
   * Configurar listeners de eventos del WebSocket
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🟢 Conectado al WebSocket');
      this.reconnectAttempts = 0;
      
      // Re-autenticar si teníamos una sesión previa
      if (this.currentUserId && this.currentMembershipId && this.currentGroupId) {
        this.authenticate({
          id_user: this.currentUserId,
          id_membership: this.currentMembershipId,
          id_group: this.currentGroupId,
        });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔴 Desconectado del WebSocket:', reason);
      this.reconnectAttempts++;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Máximo de intentos de reconexión alcanzado');
        this.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconectado después de ${attemptNumber} intentos`);
      this.reconnectAttempts = 0;
    });
  }

  /**
   * Autenticar usuario en el WebSocket
   */
  authenticate(data: AuthenticateData) {
    if (!this.socket?.connected) {
      console.error('❌ Socket no conectado');
      return;
    }

    this.currentUserId = data.id_user;
    this.currentMembershipId = data.id_membership;
    this.currentGroupId = data.id_group;

    this.socket.emit('authenticate', data);
  }

  /**
   * Enviar mensaje al grupo
   */
  sendMessage(data: MessageSendData) {
    if (!this.socket?.connected) {
      console.error('❌ Socket no conectado');
      return;
    }

    this.socket.emit('message:send', data);
  }

  /**
   * Editar mensaje existente
   */
  editMessage(data: MessageEditData) {
    if (!this.socket?.connected) {
      console.error('❌ Socket no conectado');
      return;
    }

    this.socket.emit('message:edit', data);
  }

  /**
   * Eliminar mensaje
   */
  deleteMessage(data: MessageDeleteData) {
    if (!this.socket?.connected) {
      console.error('❌ Socket no conectado');
      return;
    }

    this.socket.emit('message:delete', data);
  }

  /**
   * Emitir evento de "usuario escribiendo"
   */
  emitTyping(data: TypingData) {
    if (!this.socket?.connected) {
      console.error('❌ Socket no conectado');
      return;
    }

    this.socket.emit('user:typing', data);
  }

  /**
   * Cargar historial de mensajes con paginación
   */
  loadHistory(data: MessagesHistoryData) {
    if (!this.socket?.connected) {
      console.error('❌ Socket no conectado');
      return;
    }

    this.socket.emit('messages:history', data);
  }

  /**
   * Buscar mensajes en el grupo
   */
  searchMessages(data: SearchMessagesData) {
    if (!this.socket?.connected) {
      console.error('❌ Socket no conectado');
      return;
    }

    this.socket.emit('messages:search', data);
  }

  /**
   * Salir del grupo actual
   */
  leaveRoom() {
    if (!this.socket?.connected) {
      console.error('❌ Socket no conectado');
      return;
    }

    this.socket.emit('room:leave');
    this.currentGroupId = null;
    this.currentMembershipId = null;
  }

  /**
   * Obtener estadísticas de la sesión
   */
  getSessionStats() {
    if (!this.socket?.connected) {
      console.error('❌ Socket no conectado');
      return;
    }

    this.socket.emit('session:stats');
  }

  /**
   * Escuchar conexión del usuario
   */
  onUserConnected(callback: (data: any) => void) {
    this.socket?.on('user:connected', callback);
  }

  /**
   * Escuchar nuevo mensaje
   */
  onNewMessage(callback: (message: Message) => void) {
    this.socket?.on('message:new', callback);
  }

  /**
   * Escuchar edición de mensaje
   */
  onMessageEdited(callback: (data: { id_message: number; text_content: string; is_edited: boolean; edited_at: string }) => void) {
    this.socket?.on('message:edited', callback);
  }

  /**
   * Escuchar eliminación de mensaje
   */
  onMessageDeleted(callback: (data: { id_message: number }) => void) {
    this.socket?.on('message:deleted', callback);
  }

  /**
   * Escuchar cuando un usuario está escribiendo
   */
  onUserTyping(callback: (data: TypingData) => void) {
    this.socket?.on('user:typing', callback);
  }

  /**
   * Escuchar respuesta de historial
   */
  onHistoryReceived(callback: (data: MessageHistoryResponse) => void) {
    this.socket?.on('messages:history', callback);
  }

  /**
   * Escuchar resultados de búsqueda
   */
  onSearchResults(callback: (data: MessageSearchResponse) => void) {
    this.socket?.on('messages:search', callback);
  }

  /**
   * Escuchar confirmación de salida de sala
   */
  onRoomLeft(callback: () => void) {
    this.socket?.on('room:left', callback);
  }

  /**
   * Escuchar estadísticas de sesión
   */
  onSessionStats(callback: (stats: SessionStatsResponse) => void) {
    this.socket?.on('session:stats', callback);
  }

  /**
   * Remover listener de evento específico
   */
  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  /**
   * Desconectar del WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentUserId = null;
      this.currentMembershipId = null;
      this.currentGroupId = null;
      console.log('🔴 Desconectado del WebSocket');
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Obtener ID de grupo actual
   */
  getCurrentGroupId(): number | null {
    return this.currentGroupId;
  }

  /**
   * Obtener ID de usuario actual
   */
  getCurrentUserId(): number | null {
    return this.currentUserId;
  }
}

// Exportar instancia singleton
export const websocketService = new WebSocketService();
export default WebSocketService;
