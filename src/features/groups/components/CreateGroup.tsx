import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/src/features/courses/services/courses.service";
import { Course } from "@/src/features/courses/types";
import { useAuthStore } from "@/src/features/auth";

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (groupData: {
    name: string;
    description: string;
    id_course: number;
    owner_id: number;
  }) => void;
}

export const CreateGroupModal = ({
  visible,
  onClose,
  onSave,
}: CreateGroupModalProps) => {
  const { user } = useAuthStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  // Obtener cursos disponibles
  const { data: courses, isLoading: loadingCourses } = useQuery<Course[]>({
    queryKey: ["courses-by-student"],
    queryFn: courseService.getByStudent,
    enabled: visible,
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre del grupo es obligatorio");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "La descripción del grupo es obligatoria");
      return;
    }

    if (!selectedCourseId) {
      Alert.alert("Error", "Debes seleccionar un curso");
      return;
    }

    if (!user?.id_user) {
      Alert.alert("Error", "No se pudo identificar al usuario");
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      id_course: selectedCourseId,
      owner_id: user.id_user,
    });

    handleClose();
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setSelectedCourseId(null);
    setShowCourseDropdown(false);
    onClose();
  };

  const selectCourse = (courseId: number) => {
    setSelectedCourseId(courseId);
    setShowCourseDropdown(false);
  };

  const selectedCourse = courses?.find((c: Course) => c.id_course === selectedCourseId);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Crear Grupo de Estudio</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Nombre del grupo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del grupo *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Grupo de Cálculo"
                placeholderTextColor="#999"
              />
            </View>

            {/* Descripción */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe el propósito del grupo..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Selector de curso */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Curso *</Text>
              {loadingCourses ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.loadingText}>Cargando cursos...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowCourseDropdown(!showCourseDropdown)}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !selectedCourse && styles.placeholder,
                      ]}
                    >
                      {selectedCourse?.name || "Selecciona un curso"}
                    </Text>
                    <Ionicons
                      name={showCourseDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>

                  {showCourseDropdown && (
                    <View style={styles.dropdownList}>
                      <ScrollView style={styles.dropdownScroll}>
                        {courses && courses.length > 0 ? (
                          courses.map((course: Course) => (
                            <TouchableOpacity
                              key={course.id_course}
                              style={styles.dropdownItem}
                              onPress={() => selectCourse(course.id_course)}
                            >
                              <Text style={styles.dropdownItemText}>
                                {course.name}
                              </Text>
                              {selectedCourseId === course.id_course && (
                                <Ionicons
                                  name="checkmark"
                                  size={20}
                                  color="#007AFF"
                                />
                              )}
                            </TouchableOpacity>
                          ))
                        ) : (
                          <Text style={styles.emptyText}>
                            No hay cursos disponibles
                          </Text>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Crear Grupo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 500,
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  body: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  placeholder: {
    color: "#999",
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    maxHeight: 200,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    padding: 20,
    textAlign: "center",
    color: "#999",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});