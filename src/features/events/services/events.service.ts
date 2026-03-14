import { api } from '@/src/constants/api';
import { EVENTS_ENDPOINTS } from '../api/endpoints';
import {
  Event,
  EventFilters,
  PaginationParams,
  FENResponse,
  ErrorDetails,
  CreateEventPayload, // ⭐ NUEVO
} from '../types/event.types';

/**
 * EventsService - BFF (Backend for Frontend) layer
 * Handles HTTP communication with the backend API using Axios
 * Validates FEN response format and handles errors
 */
export class EventsService {
  /**
   * Get events with optional filters and pagination
   * @param filters - Optional filters (date, type, startDate, endDate)
   * @param pagination - Pagination parameters (page, pageSize)
   * @returns Promise with FEN formatted response containing events array
   */
  async getEvents(
    filters: EventFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 20 }
  ): Promise<FENResponse<Event[]>> {
    try {
      // Build query parameters
      const params = this.buildQueryParams(filters, pagination);

      // Make HTTP GET request
      const response = await api.get(EVENTS_ENDPOINTS.GET_EVENTS, { params });

      // Validate FEN response format
      const validatedResponse = this.validateFENResponse<Event[]>(response.data);

      return validatedResponse;
    } catch (error: any) {
      // Log error with context
      this.logError(error, 'getEvents', { filters, pagination });

      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Error de conexión. La solicitud ha excedido el tiempo de espera.');
      }

      if (!error.response) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }

      // Handle HTTP errors with FEN format
      if (error.response?.data) {
        const errorResponse = error.response.data;

        // If backend returns FEN format error, validate and return it
        if (this.isFENFormat(errorResponse)) {
          return this.validateFENResponse<Event[]>(errorResponse);
        }

        // Otherwise, transform to FEN format
        throw new Error(
          errorResponse.message || 
          errorResponse.error?.message || 
          'Error al obtener eventos'
        );
      }

      throw new Error('Error inesperado al obtener eventos');
    }
  }

  /**
   * ⭐ NUEVO: Create a new event
   * @param payload - Event data (without id_program, extracted from JWT)
   * @returns Promise with FEN formatted response containing created event
   */
  async createEvent(payload: CreateEventPayload): Promise<FENResponse<Event>> {
    try {
      // Make HTTP POST request
      const response = await api.post(EVENTS_ENDPOINTS.CREATE_EVENT, payload);

      // Validate FEN response format
      const validatedResponse = this.validateFENResponse<Event>(response.data);

      return validatedResponse;
    } catch (error: any) {
      // Log error with context
      this.logError(error, 'createEvent', { payload });

      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Error de conexión. La solicitud ha excedido el tiempo de espera.');
      }

      if (!error.response) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }

      // Handle HTTP errors with FEN format
      if (error.response?.data) {
        const errorResponse = error.response.data;

        // If backend returns FEN format error, validate and return it
        if (this.isFENFormat(errorResponse)) {
          return this.validateFENResponse<Event>(errorResponse);
        }

        // Otherwise, extract error message
        throw new Error(
          errorResponse.message || 
          errorResponse.error?.message || 
          'Error al crear el evento'
        );
      }

      throw new Error('Error inesperado al crear el evento');
    }
  }

  /**
   * Build query parameters from filters and pagination
   * @private
   */
  private buildQueryParams(
    filters: EventFilters,
    pagination: PaginationParams
  ): Record<string, string | number> {
    const params: Record<string, string | number> = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };

    if (filters.date) {
      params.date = filters.date;
    }

    if (filters.type) {
      params.type = filters.type;
    }

    if (filters.startDate) {
      params.startDate = filters.startDate;
    }

    if (filters.endDate) {
      params.endDate = filters.endDate;
    }

    return params;
  }

  /**
   * Validate that response follows FEN format
   * @private
   */
  private validateFENResponse<T>(response: any): FENResponse<T> {
    try {
      // Check if response has FEN structure
      if (!this.isFENFormat(response)) {
        throw new Error('Respuesta del servidor en formato inválido');
      }

      // Validate success field
      if (typeof response.success !== 'boolean') {
        throw new Error('Respuesta del servidor en formato inválido: campo success inválido');
      }

      // Validate metadata
      if (!response.metadata || typeof response.metadata !== 'object') {
        throw new Error('Respuesta del servidor en formato inválido: metadata faltante');
      }

      const metadata = response.metadata;
      if (
        typeof metadata.total !== 'number' ||
        typeof metadata.page !== 'number' ||
        typeof metadata.pageSize !== 'number' ||
        typeof metadata.hasNextPage !== 'boolean' ||
        typeof metadata.hasPreviousPage !== 'boolean'
      ) {
        throw new Error('Respuesta del servidor en formato inválido: metadata incompleta');
      }

      // If success is true, validate data
      if (response.success) {
        // For array responses
        if (Array.isArray(response.data)) {
          // Validate each event has required fields
          response.data.forEach((event: any, index: number) => {
            const requiredFields = ['id', 'title', 'description', 'date', 'time', 'location', 'type', 'createdAt', 'updatedAt'];
            for (const field of requiredFields) {
              if (!(field in event)) {
                throw new Error(
                  `Respuesta del servidor en formato inválido: evento ${index} falta campo ${field}`
                );
              }
            }
          });
        }
        // For single object responses (create, update)
        else if (response.data && typeof response.data === 'object') {
          const requiredFields = ['id', 'title', 'description', 'date', 'time', 'location', 'type', 'createdAt', 'updatedAt'];
          for (const field of requiredFields) {
            if (!(field in response.data)) {
              throw new Error(
                `Respuesta del servidor en formato inválido: falta campo ${field}`
              );
            }
          }
        }

        if (response.error !== null) {
          throw new Error('Respuesta del servidor en formato inválido: error debe ser null cuando success es true');
        }
      } else {
        // If success is false, validate error
        if (!response.error || typeof response.error !== 'object') {
          throw new Error('Respuesta del servidor en formato inválido: error faltante');
        }

        if (!response.error.code || !response.error.message) {
          throw new Error('Respuesta del servidor en formato inválido: error incompleto');
        }

        if (response.data !== null) {
          throw new Error('Respuesta del servidor en formato inválido: data debe ser null cuando success es false');
        }
      }

      return response as FENResponse<T>;
    } catch (error: any) {
      // Log validation errors
      this.logError(error, 'validateFENResponse', { response });
      throw error;
    }
  }

  /**
   * Check if response has basic FEN structure
   * @private
   */
  private isFENFormat(response: any): boolean {
    return (
      response &&
      typeof response === 'object' &&
      'success' in response &&
      'data' in response &&
      'error' in response &&
      'metadata' in response
    );
  }

  /**
   * Log error with context information
   * @private
   */
  private logError(error: any, method: string, context: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const errorType = error.name || error.constructor?.name || 'Error';
    const errorMessage = error.message || 'Unknown error';
    
    console.error('[EventsService Error]', {
      timestamp,
      method,
      errorType,
      message: errorMessage,
      context,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      } : undefined,
    });
  }
}

// Export singleton instance
export const eventsService = new EventsService();
