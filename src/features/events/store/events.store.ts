import { makeObservable, observable, action, runInAction } from 'mobx';
import { eventsService, EventsService } from '../services/events.service';
import {
  Event,
  EventFilters,
  Metadata,
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
}

// Export singleton instance
export const eventsStore = new EventsStore();
