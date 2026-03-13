import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event, EventType } from '../types/event.types';

export interface EventCardProps {
  event: Event;
}

/**
 * EventCard - Pure component for displaying a single event
 * Receives event object as prop
 * No business logic or network calls
 */
export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEventTypeLabel = (type: EventType): string => {
    const labels: Record<EventType, string> = {
      [EventType.CONFERENCIA]: 'Conferencia',
      [EventType.TALLER]: 'Taller',
      [EventType.SEMINARIO]: 'Seminario',
      [EventType.COMPETENCIA]: 'Competencia',
      [EventType.CULTURAL]: 'Cultural',
      [EventType.DEPORTIVO]: 'Deportivo',
    };
    return labels[type];
  };

  const getEventTypeColor = (type: EventType): string => {
    const colors: Record<EventType, string> = {
      [EventType.CONFERENCIA]: '#0056b3',
      [EventType.TALLER]: '#28a745',
      [EventType.SEMINARIO]: '#6f42c1',
      [EventType.COMPETENCIA]: '#fd7e14',
      [EventType.CULTURAL]: '#e83e8c',
      [EventType.DEPORTIVO]: '#20c997',
    };
    return colors[type];
  };

  return (
    <View style={styles.card}>
      {/* Event Type Badge */}
      <View style={[styles.typeBadge, { backgroundColor: getEventTypeColor(event.type) }]}>
        <Text style={styles.typeText}>{getEventTypeLabel(event.type)}</Text>
      </View>

      {/* Event Title */}
      <Text style={styles.title}>{event.title}</Text>

      {/* Event Description */}
      <Text style={styles.description} numberOfLines={2}>
        {event.description}
      </Text>

      {/* Event Details */}
      <View style={styles.detailsContainer}>
        {/* Date */}
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{formatDate(event.date)}</Text>
        </View>

        {/* Time */}
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{event.time}</Text>
        </View>

        {/* Location */}
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{event.location}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  typeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
});
