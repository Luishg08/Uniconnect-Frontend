import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useAuthStore } from '@/src/features/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../hooks/useResponsive';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const { isMobile } = useResponsive();

  const navigateTo = (path: any) => {
    setMenuVisible(false);
    router.push(path);
  };

  const getImageUri = (
      image: string | null | undefined,
    ): string | undefined => {
      if (!image) return undefined;

      if (image.startsWith("data:image")) {
        return image;
      }

      if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
      }

      return `data:image/jpeg;base64,${image}`;
    };

  return (
    <View style={styles.navbar}>
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: getImageUri(user?.picture) || 'https://via.placeholder.com/40' }} 
            style={styles.avatar} 
          />
          <Text style={styles.userName}>{user?.full_name?.split(' ')[0]}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
      </TouchableOpacity>

      {/* MODAL DEL MENÚ LATERAL */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuContent, {width: isMobile ? '60%' : '25%'}]}>
            <Text style={styles.menuTitle}>UniConnect</Text>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/(tabs)')}>
              <Ionicons name="home-outline" size={22} color="#007AFF" />
              <Text style={styles.menuText}>Inicio</Text>
            </TouchableOpacity>

             <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/(tabs)/profile')}>
              <Ionicons name="person-circle-outline" size={22} color="#007AFF" />
              <Text style={styles.menuText}>Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/(tabs)/community')}>
              <Ionicons name="people-outline" size={22} color="#007AFF" />
              <Text style={styles.menuText}>Comunidad</Text>
            </TouchableOpacity>

            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.menuItem} onPress={logout}>
              <Ionicons name="exit-outline" size={22} color="#ff4d4d" />
              <Text style={[styles.menuText, {color: '#ff4d4d'}]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftSection: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  menuButton: { 
    marginRight: 15 
  },
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  avatar: { 
    width: 35, 
    height: 35, 
    borderRadius: 18, 
    marginRight: 8,
    backgroundColor: '#ddd' 
  },
  userName: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#333'
  },
  logoutButton: { 
    backgroundColor: '#ff4d4d', 
    padding: 8, 
    borderRadius: 8 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  menuContent: { 
    backgroundColor: '#fff', 
    width: '25%', 
    height: '100%', 
    padding: 20, 
    paddingTop: 50 
  },
  menuTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    color: '#007AFF' 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0' 
  },
  menuText: { 
    fontSize: 18, 
    marginLeft: 15, 
    color: '#333' 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#eee', 
    marginVertical: 20 
  },
});