import { useAuthStore } from "@/src/features/auth";
import { useResponsive } from "@/src/hooks/useResponsive";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { authService } from '../../src/features/auth/services/auth.service';

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useProfile } from "@/src/features/students/hooks/useProfile";

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { isDesktop, isTablet } = useResponsive();

  const { profile, isLoading, isError, updateProfile } = useProfile();

  const [phone, setPhone] = useState(profile?.phone || "");
  const [program, setProgram] = useState(profile?.program || "");
  const [semester, setSemester] = useState(profile?.current_semester || "");
  const [profileImage, setProfileImage] = useState(profile?.picture || "");
  const [courses, setCourses] = useState(profile?.courses || []);

  useEffect(() => {
    if (profile) {
      console.log("Perfil cargado:", profile);
      setPhone(profile.phone || "");
      setProgram(profile.program || "");
      setSemester(profile.current_semester?.toString() || "");
      setProfileImage(profile.picture || "");
      setCourses(profile.courses || []);
    }
  }, [profile]);

  const handleAddCourse = () => {
    console.log("Agregar curso");
  };

  const handleEditCourse = (courseId: number) => {
    console.log("Editar curso:", courseId);
  };

  const handleSaveChanges = () => {
    updateProfile({
      phone,
      current_semester: semester ? semester : "0",
      image: profileImage,
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos permisos para acceder a tus fotos",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, 
    });

    if (!result.canceled && result.assets[0].base64) {
      try {
        const base64WithPrefix = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setProfileImage(base64WithPrefix);
        console.log("Imagen seleccionada y convertida a base64");
      } catch (error) {
        console.error("Error al convertir imagen:", error);
        Alert.alert("Error", "No se pudo procesar la imagen");
      }
    }
  };


  if (isLoading) {
    return (
      <View
        style={[
          styles.wrapper,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#4169e1" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Cargando perfil...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.wrapper,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={60} color="#ff4d4d" />
        <Text style={{ color: "#fff", marginTop: 10, textAlign: "center" }}>
          Error al cargar el perfil
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Fondo superior */}
      <View style={styles.topBackground} />
      {/* Fondo inferior */}
      <View style={styles.bottomBackground} />

      <ScrollView style={styles.container}>
        <View
          style={[
            styles.headerCard,
            { width: isDesktop ? "40%" : isTablet ? "40%" : "80%" },
          ]}
        >
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            {profileImage ? (
              <Image
                source={{ uri: authService.getImageUri(profileImage) }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={50} color="#666" />
              </View>
            )}

            {/* Ícono de subir imagen */}
            <View style={styles.uploadIconContainer}>
              <Ionicons name="cloud-upload" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>
            {profile?.full_name || "Nombre no disponible"}
          </Text>
          <Text style={styles.role}>{profile?.roleName || "N/A"}</Text>
        </View>

        {/* About You */}
        <View
          style={[
            styles.section,
            { width: isDesktop ? "40%" : isTablet ? "40%" : "80%" },
          ]}
        >
          <Text style={styles.sectionTitle}>Sobre ti</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#fff" />
            <Text style={styles.infoText}>{user?.email || ""}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#fff" />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.infoInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Ingresa tu teléfono"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color="#fff" />
            <Text style={styles.infoText}>
              {program || "Sin programa asignado"}
            </Text>
          </View>
        </View>

        {/* Academic Status */}
        <View
          style={[
            styles.section,
            { width: isDesktop ? "40%" : isTablet ? "40%" : "80%" },
          ]}
        >
          <Text style={styles.sectionTitle}>Estado Académico</Text>
          <View style={styles.spaceBetween}>
            <Text style={styles.sectionSemiTitle}>Progreso actual</Text>
            <Text style={[styles.sectionSemiTitle, { fontWeight: "bold" }]}>
              {profile?.progress || 0}%
            </Text>
          </View>

          {/* Contenedor de la barra */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${profile?.progress || 0}%` },
                ]}
              />
            </View>
          </View>

          <View style={[styles.spaceBetween, { marginTop: 20 }]}>
            <Text style={styles.sectionSemiTitle}>Semestre actual</Text>
            <View style={styles.semesterInputContainer}>
              <TextInput
                style={styles.semesterInput}
                value={semester}
                onChangeText={setSemester}
                placeholder="Semestre"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/*My Courses*/}
          <View style={[styles.section, { width: "100%" }]}>
            <View style={[styles.spaceBetween]}>
              <Text style={styles.sectionTitle}>Mis Cursos</Text>
              <TouchableOpacity
                onPress={handleAddCourse}
                style={{ marginBottom: 10 }}
              >
                <Ionicons name="add-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Lista de cursos */}
            {courses && courses.length > 0 ? (
              courses.map((course) => (
                <View style={styles.courseItem} key={course.id_course}>
                  <View style={styles.courseInfo}>
                    <View style={styles.courseDot} />
                    <View style={styles.courseTextContainer}>
                      <Text style={styles.courseName}>{course.name}</Text>
                      <Text style={styles.courseState}>{course.state}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleEditCourse(course.id_course)}
                  >
                    <Ionicons name="create-outline" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text
                style={{ color: "#aaa", textAlign: "center", marginTop: 10 }}
              >
                No tienes cursos registrados
              </Text>
            )}
          </View>
        </View>

        {/* Botón Guardar Cambios */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { width: isDesktop ? "40%" : isTablet ? "40%" : "80%" },
          ]}
          onPress={handleSaveChanges}
        >
          <Text style={styles.saveButtonText}>Guardar cambios</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  topBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "35%",
    backgroundColor: "#181835",
  },
  bottomBackground: {
    position: "absolute",
    top: "35%",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#192331",
  },
  container: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: "rgba(16, 16, 35, 0.4)",
    marginTop: 75,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 30,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 30,
    alignItems: "center",
    alignSelf: "center",
  },
  avatarContainer: {
    position: "absolute",
    top: -50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#101023",
  },
  avatarPlaceholder: {
    backgroundColor: "#2a2a4a",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#101023",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#101023",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
  },
  role: {
    fontSize: 16,
    color: "#aaa",
  },
  section: {
    backgroundColor: "rgba(16, 16, 35, 0.4)",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 20,
    padding: 20,
    alignSelf: "center",
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  sectionSemiTitle: {
    fontSize: 15,
    color: "#fff",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
    marginLeft: 12,
  },
  inputContainer: {
    marginLeft: 10,
    backgroundColor: "#1e2230",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e2230",
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  infoInput: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
    padding: 0,
  },
  semesterInputContainer: {
    backgroundColor: "#1e2230",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e2230",
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: "center",
    marginBottom: 10,
  },
  semesterInput: {
    fontSize: 14,
    color: "#fff",
    padding: 0,
    textAlign: "center",
  },
  spaceBetween: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBarContainer: {
    marginTop: 5,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4169e1",
    borderRadius: 4,
  },
  courseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  courseInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  courseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#aaa",
    marginRight: 12,
  },
  courseTextContainer: {
    flex: 1,
  },
  courseName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 4,
  },
  courseState: {
    fontSize: 12,
    color: "#aaa",
  },
  saveButton: {
    backgroundColor: "#4169e1",
    marginHorizontal: 15,
    marginBottom: 30,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: "center",
    alignSelf: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
