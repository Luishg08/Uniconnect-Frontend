import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { observer } from 'mobx-react-lite';
import { eventsStore } from '@/src/features/events/store/events.store';
import {
  EventFilters,
  EventList,
  LoadingIndicator,
  ErrorMessage,
  EmptyState,
} from '@/src/features/events/components';

/**
 * EventsScreen - Main screen for academic events query
 * Uses MobX observer to make component reactive
 * Follows MVC pattern with complete decoupling from business logic
 * 
 * Validates: Requirements 1.1, 1.3, 1.4, 1.5, 4.4, 4.5, 5.1, 5.4, 7.1, 7.3, 7.4
 */
const EventsScreen: React.FC = observer(() => {
  // Load events on component mount
  useEffect(() => {
    eventsStore.loadEvents();
  }, []);

  // Rendering logic based on store state
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Filters - Always visible */}
        <EventFilters
          filters={eventsStore.filters}
          onFilterChange={eventsStore.setFilter.bind(eventsStore)}
          onClearFilters={eventsStore.clearFilters.bind(eventsStore)}
        />

        {/* Conditional rendering based on state */}
        {eventsStore.loading && <LoadingIndicator />}
        
        {!eventsStore.loading && eventsStore.error && (
          <ErrorMessage
            message={eventsStore.error}
            onRetry={() => eventsStore.loadEvents()}
          />
        )}
        
        {!eventsStore.loading && !eventsStore.error && eventsStore.events.length === 0 && (
          <EmptyState />
        )}
        
        {!eventsStore.loading && !eventsStore.error && eventsStore.events.length > 0 && (
          <EventList events={eventsStore.events} />
        )}
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default EventsScreen;
