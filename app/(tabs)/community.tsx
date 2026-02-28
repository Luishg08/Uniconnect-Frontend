import React, { useState } from 'react';
import { View, TextInput, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useStudents } from '@/src/features/students/hooks/useStudents';
import { StudentCard } from '@/src/features/students/components/StudentCard';
import { useRouter } from 'expo-router'; 

export default function CommunityScreen() {
  const [search, setSearch] = useState('');
  const router = useRouter(); 
  const { data: students, isLoading } = useStudents(search);

  return (
    <View style={styles.content}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.backText}>← Volver al Inicio</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar compañeros o materias..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={students || []}
          keyExtractor={(item) => item.id_user.toString()}
          renderItem={({ item }) => <StudentCard student={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron estudiantes</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, backgroundColor: '#363636' },
  backButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
  },
  backText: {
    color: '#D9B97E',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: { 
    padding: 15, 
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 185, 126, 0.3)',
  },
  searchInput: { 
    backgroundColor: '#2a2a2a', 
    padding: 12, 
    borderRadius: 10,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#D9B97E',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 20 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#aaa' }
});