import { makeObservable, observable, action, runInAction, computed } from 'mobx';
import { eventsService, EventsService } from '../services/events.service';
import {
  Event,
  EventFilters,
  Metadata,
  CreateEventPayload, // ⭐ NUEVO
} from '../types/event.types';

/**
 * EventsStore - Model layer using MobX
 * Manages state for events, filters, loading, and errors
 * Follows MVC pattern with complete decoupling from View layer
 */
export class EventsStore {
  // Observable state
  @observable events: Event[] = [];
  @observable loading: boolean = false;
  @observable error: string | null = null;
  @observable filters: EventFilters = {
    date: null,
    type: null,
    startDate: null,
    endDate: null,
  };
  @observable metadata: Metadata | null = null;
  
  // ⭐ NUEVO: Estado para creación de eventos
  @observable isCreating: boolean = false;
  @observable createError: string | null = null;

  // Service dependency
  private eventsService: EventsService;

  constructor(service: EventsService = eventsService) {
    this.eventsService = service;

    // Make properties observable
    makeObservable(this);
  }

  /**
   * Load events from API with current filters
   * Sets loading state, handles errors, and updates events
   */
  @action
  async loadEvents(): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      const response = await this.eventsService.getEvents(this.filters);

      runInAction(() => {
        if (response.success && response.data) {
          this.setEvents(response.data);
          this.setMetadata(response.metadata);
        } else if (response.error) {
          this.setError(response.error.message);
        }
      });
    } catch (error: any) {
      runInAction(() => {
        this.setError(error.message || 'Error al cargar eventos');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  /**
   * ⭐ NUEVO: Create a new event
   * @param payload - Event data (without id_program, extracted from JWT)
   * @returns Promise<boolean> - true if successful, false otherwise
   */
  @action
  async createEvent(payload: CreateEventPayload): Promise<boolean> {
    this.setIsCreating(true);
    this.setCreateError(null);

    // ⭐ DIAGNOSTIC: Log payload before sending
    console.log('🔍 [EventsStore] Creating event with payload:', payload);

    try {
      const response = await this.eventsService.createEvent(payload);

      // ⭐ DIAGNOSTIC: Log response
      console.log('🔍 [EventsStore] Create event response:', {
        success: response.success,
        hasData: !!response.data,
        error: response.error,
      });

      runInAction(() => {
        if (response.success && response.data) {
          // Evento creado exitosamente
          this.setIsCreating(false);
          
          // Re-fetch automático para actualizar la lista
          this.loadEvents();
          
          return true;
        } else if (response.error) {
          this.setCreateError(response.error.message);
          this.setIsCreating(false);
          return false;
        }
      });

      return true;
    } catch (error: any) {
      // ⭐ DIAGNOSTIC: Log error details
      console.error('❌ [EventsStore] Create event error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      runInAction(() => {
        this.setCreateError(error.message || 'Error al crear el evento');
        this.setIsCreating(false);
      });
      return false;
    }
  }

  /**
   * Set a specific filter and reload events
   * @param filterType - Type of filter (date, type, startDate, endDate)
   * @param value - Filter value
   */
  @action
  setFilter(filterType: keyof EventFilters, value: any): void {
    this.filters[filterType] = value;
    this.loadEvents();
  }

  /**
   * Clear all filters and reload events
   */
  @action
  clearFilters(): void {
    this.filters = {
      date: null,
      type: null,
      startDate: null,
      endDate: null,
    };
    this.loadEvents();
  }

  /**
   * ⭐ NUEVO: Clear create error
   */
  @action
  clearCreateError(): void {
    this.createError = null;
  }

  /**
   * Update events array
   * @private
   */
  @action
  private setEvents(events: Event[]): void {
    this.events = events;
  }

  /**
   * Update loading state
   * @private
   */
  @action
  private setLoading(loading: boolean): void {
    this.loading = loading;
  }

  /**
   * Update error state
   * @private
   */
  @action
  private setError(error: string | null): void {
    this.error = error;
  }

  /**
   * Update metadata
   * @private
   */
  @action
  private setMetadata(metadata: Metadata): void {
    this.metadata = metadata;
  }

  /**
   * ⭐ NUEVO: Update isCreating state
   * @private
   */
  @action
  private setIsCreating(isCreating: boolean): void {
    this.isCreating = isCreating;
  }

  /**
   * ⭐ NUEVO: Update createError state
   * @private
   */
  @action
  private setCreateError(error: string | null): void {
    this.createError = error;
  }

  /**
   * ⭐ NUEVO: Computed - Get upcoming events (future events only)
   */
  @computed
  get upcomingEvents(): Event[] {
    const now = new Date();
    return this.events.filter(event => new Date(event.date) >= now);
  }
}

// Export singleton instance
export const eventsStore = new EventsStore();
