import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Event } from '../types/event.types';
import { EventCard } from './EventCard';

export interface EventListProps {
  events: Event[] | undefined | null; // ⭐ FIX: Permitir undefined/null para manejar casos edge
  currentUser?: { id_user: number; role: string };
  onEdit?: (event: Event) => void;
}

/**
 * EventList - Pure component for displaying a list of events
 * Receives events array as prop
 * No business logic or network calls
 * 
 * ⭐ FIX CRÍTICO: Programación defensiva con Early Return
 */
export const EventList: React.FC<EventListProps> = ({ events, currentUser, onEdit }) => {
  // ⭐ FIX CRÍTICO: Early Return - Validación temprana para evitar crash
  // Si events es undefined, null, o no es un array, usar array vacío
  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <FlatList
      data={safeEvents} // ⭐ GARANTÍA: Siempre pasar array válido
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EventCard 
          event={item} 
          currentUser={currentUser}
          onEdit={onEdit}
        />
      )}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
});
