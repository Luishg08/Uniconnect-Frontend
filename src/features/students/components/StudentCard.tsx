import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Student } from '../types';
import { authService } from '../../auth/services/auth.service';

interface StudentCardProps {
  student: Student;
}


export const StudentCard = ({ student }: StudentCardProps) => {
  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: authService.getImageUri(student.picture) || 'https://via.placeholder.com/50' }} 
        style={styles.avatar} 
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{student.full_name}</Text>
        
        {/* Programa Académico */}
        <Text style={styles.program}>
          {student.program?.name || 'Programa no asignado'}
        </Text>

        {/* Listado de Materias (Enrollments) */}
        <View style={styles.badgeContainer}>
          {student.enrollments?.length > 0 ? (
            student.enrollments.map((enroll) => (
              <View key={enroll.id_enrollment} style={styles.badge}>
                <Text style={styles.badgeText}>{enroll.course.name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noCourses}>Sin materias inscritas</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    marginHorizontal: 15,
    // Sombra para iOS y Android
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  program: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#E3F2FD', 
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  badgeText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '600',
  },
  noCourses: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
});