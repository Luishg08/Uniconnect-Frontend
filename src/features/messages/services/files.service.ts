import axios from 'axios';
import { API_BASE_URL } from '@/src/constants/api';

class FilesService {
  /**
   * Subir archivos a S3 a través del backend
   */
  async uploadFiles(
    files: any[],
    groupId: number,
    token: string,
    messageId?: number
  ): Promise<any[]> {
    try {
      const formData = new FormData();
      
      // Agregar archivos
      files.forEach((file, index) => {
        formData.append('files', file);
      });

      // Agregar parámetros
      formData.append('id_group', groupId.toString());
      if (messageId) {
        formData.append('id_message', messageId.toString());
      }

      console.log(`[FilesService] Subiendo ${files.length} archivo(s) al grupo ${groupId}...`);
      
      const response = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(`[FilesService] ✅ Archivos subidos exitosamente:`, response.data);
      return response.data.data || [];
    } catch (error: any) {
      console.error(`[FilesService] ❌ Error al subir archivos:`, error);
      console.error(`[FilesService] Status: ${error.response?.status}`);
      console.error(`[FilesService] Data: ${JSON.stringify(error.response?.data)}`);
      throw error;
    }
  }

  /**
   * Validar que los archivos cumplan con los requisitos
   */
  validateFiles(files: File[]): { valid: boolean; error?: string } {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_FILES = 5;
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (files.length === 0) {
      return { valid: false, error: 'Selecciona al menos un archivo' };
    }

    if (files.length > MAX_FILES) {
      return { valid: false, error: `Máximo ${MAX_FILES} archivos permitidos` };
    }

    for (const file of files) {
      // Validar tamaño si está disponible
      if (file.size && file.size > MAX_FILE_SIZE) {
        return { valid: false, error: `${file.name} es muy grande (máx 10MB)` };
      }

      // Validar tipo
      if (file.type && !ALLOWED_TYPES.includes(file.type)) {
        console.warn(`Tipo de archivo potencialmente no permitido: ${file.type}`);
        // No bloqueamos, solo advertimos
      }
    }

    return { valid: true };
  }

  /**
   * Obtener el icono para un tipo de archivo
   */
  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image-outline';
    if (ext === 'pdf') return 'document-outline';
    if (['doc', 'docx'].includes(ext)) return 'document-text-outline';
    if (['xls', 'xlsx'].includes(ext)) return 'grid-outline';
    if (ext === 'txt') return 'document-outline';
    
    return 'attach-outline';
  }

  /**
   * Obtener tamaño legible del archivo
   */
  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export const filesService = new FilesService();
