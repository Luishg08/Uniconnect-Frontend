import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ⭐ CORRECCIÓN: Usar safe-area-context
import { observer } from 'mobx-react-lite';
import { eventsStore } from '@/src/features/events/store/events.store';
import { authStore } from '@/src/features/auth/store/AuthStore';
import {
  EventFilters,
  EventList,
  LoadingIndicator,
  ErrorMessage,
  EmptyState,
  CreateEventModal,
} from '@/src/features/events/components';
import { CreateEventPayload } from '@/src/features/events/types/event.types';

/**
 * EventsScreen - Main screen for academic events query
 * Uses MobX observer to make component reactive
 * Follows MVC pattern with complete decoupling from business logic
 * 
 * ⭐ HU-09: Implements role-based event creation
 * - Only admin and superadmin can see "Create Event" button
 * - Students cannot create events (button not rendered)
 * - Automatic refresh after event creation
 * - Uses react-native-safe-area-context for SafeAreaView
 * 
 * Validates: Requirements 1.1, 1.3, 1.4, 1.5, 4.4, 4.5, 5.1, 5.4, 7.1, 7.3, 7.4
 */
const EventsScreen: React.FC = observer(() => {
  // ⭐ NUEVO: Modal state
  const [modalVisible, setModalVisible] = useState(false);

  // Load events on component mount
  useEffect(() => {
    console.log('🚀 EventsScreen mounted');
    eventsStore.loadEvents();
  }, []);

  // ⭐ Computed - Check if user can create events
  // Only admin and superadmin can create events
  // ⭐ FIX: Use null-safe access with fallback to roleName from JWT
  const canCreateEvents = React.useMemo(() => {
    const userRole = authStore.user?.role?.name || authStore.user?.roleName;
    console.log('🔍 DEBUG - User role:', userRole);
    return userRole ? ['admin', 'superadmin'].includes(userRole) : false;
  }, [authStore.user?.role?.name, authStore.user?.roleName]);

  console.log('🎨 Rendering EventsScreen - canCreateEvents:', canCreateEvents);

  /**
   * ⭐ NUEVO: Handle event creation
   * Calls store action and handles success/error
   */
  const handleCreateEvent = async (payload: CreateEventPayload) => {
    // ⭐ DIAGNOSTIC: Log auth state before creating event
    console.log('🔍 [CreateEvent] Auth state:', {
      isAuthenticated: authStore.isAuthenticated,
      hasToken: !!authStore.accessToken,
      tokenPreview: authStore.accessToken ? authStore.accessToken.substring(0, 20) + '...' : 'none',
      userId: authStore.user?.id_user,
      userRole: authStore.user?.role?.name || authStore.user?.roleName,
      canCreateEvents,
    });

    const success = await eventsStore.createEvent(payload);

    if (success) {
      // Success - close modal and show success message
      setModalVisible(false);
      Alert.alert('Éxito', 'Evento creado correctamente');
    } else {
      // Error - show error message (modal stays open)
      Alert.alert(
        'Error',
        eventsStore.createError || 'No se pudo crear el evento. Intenta nuevamente.'
      );
    }
  };

  // Rendering logic based on store state
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* ⭐ NUEVO: Header with Create Button (conditional) */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Eventos Académicos</Text>
          
          {/* Render button ONLY if user can create events */}
          {canCreateEvents && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.createButtonText}>+ Nuevo Evento</Text>
            </TouchableOpacity>
          )}
        </View>

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

      {/* ⭐ NUEVO: Create Event Modal */}
      <CreateEventModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          eventsStore.clearCreateError();
        }}
        onSubmit={handleCreateEvent}
        isSubmitting={eventsStore.isCreating}
      />
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
  // ⭐ NUEVO: Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EventsScreen;
