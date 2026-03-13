import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Event } from '../types/event.types';
import { EventCard } from './EventCard';

export interface EventListProps {
  events: Event[];
}

/**
 * EventList - Pure component for displaying a list of events
 * Receives events array as prop
 * No business logic or network calls
 */
export const EventList: React.FC<EventListProps> = ({ events }) => {
  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <EventCard event={item} />}
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
