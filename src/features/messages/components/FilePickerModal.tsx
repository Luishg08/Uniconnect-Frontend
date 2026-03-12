import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { filesService } from '../services/files.service';

interface FilePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onFilesSelected: (files: File[]) => void;
  loading?: boolean;
}

export const FilePickerModal: React.FC<FilePickerModalProps> = ({
  visible,
  onClose,
  onFilesSelected,
  loading = false,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handlePickImages = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        base64: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const files = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
        } as any)) as File[];

        const validation = filesService.validateFiles(files);
        if (!validation.valid) {
          Alert.alert('Error', validation.error);
          return;
        }

        setSelectedFiles([...selectedFiles, ...files]);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Error al seleccionar imágenes');
      console.error(error);
    }
  };

  const handlePickDocuments = async () => {
    Alert.alert(
      'Próximamente',
      'La opción de compartir documentos estará disponible pronto. Por ahora solo puedes compartir fotos.'
    );
  };

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles(selectedFiles.filter((f) => f.name !== fileName));
  };

  const handleSend = () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un archivo');
      return;
    }

    onFilesSelected(selectedFiles);
    setSelectedFiles([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Adjuntar archivos</Text>
          <TouchableOpacity onPress={handleCancel}>
            <Ionicons name="close" size={24} color="#D9B97E" />
          </TouchableOpacity>
        </View>

        {/* Botones de selección */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePickImages}
          >
            <Ionicons name="images-outline" size={24} color="#D9B97E" />
            <Text style={styles.actionButtonText}>Fotos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePickDocuments}
          >
            <Ionicons name="document-outline" size={24} color="#D9B97E" />
            <Text style={styles.actionButtonText}>Documentos</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de archivos seleccionados */}
        <ScrollView style={styles.filesList}>
          {selectedFiles.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="image-outline" size={48} color="#6B7280" />
              <Text style={styles.emptyText}>No hay fotos seleccionadas</Text>
            </View>
          ) : (
            <View style={styles.photoGrid}>
              {selectedFiles.map((file, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image
                    source={{ uri: (file as any).uri }}
                    style={styles.photoThumbnail}
                  />
                  <TouchableOpacity 
                    onPress={() => handleRemoveFile(file.name)}
                    style={styles.removePhotoButton}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Footer con botones */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={selectedFiles.length === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#1a1a1a" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#1a1a1a" />
                <Text style={styles.sendButtonText}>Enviar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D9B97E',
  },
  filesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 12,
  },
  photoContainer: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#1a1a1a80',
    borderRadius: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: '#D9B97E',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
