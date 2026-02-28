import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStudentProfile } from "@/src/features/students/hooks/useStudentProfile";
import { authService } from "@/src/features/auth/services/auth.service";
import { useResponsive } from "@/src/hooks/useResponsive";
import { useConnections } from "@/src/features/connections/hooks/useConnections";

export default function StudentProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDesktop, isTablet } = useResponsive();
  const { data: profile, isLoading, isError } = useStudentProfile(Number(id));
  const { sendConnectionRequest, isSendingRequest } = useConnections(); 


  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4169e1" />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={60} color="#ff4d4d" />
        <Text style={styles.errorText}>Error al cargar el perfil</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

   const handleSendConnectionRequest = () => {
    const status = String(profile.connection_status || 'none').toLowerCase().trim();
    if (status === 'none') {
      sendConnectionRequest({ addressee_id: profile.id });
    }
  };

  const getButtonConfig = () => {
    // Normalize the connection status to lowercase and trim
    const status = String(profile.connection_status || 'none').toLowerCase().trim();
    
    switch (status) {
      case 'connected':
      case 'accepted':
        return {
          text: 'Ya son compañeros',
          icon: 'checkmark-circle',
          disabled: true,
          textColor: '#1a1a1a',
          backgroundColor: '#D9B97E'
        };
      case 'pending_sent':
      case 'pendingsent':
        return {
          text: 'Solicitud enviada',
          icon: 'time-outline',
          disabled: true,
          textColor: '#1a1a1a',
          backgroundColor: '#D9B97E'
        };
      case 'pending_received':
      case 'pendingreceived':
        return {
          text: 'Solicitud recibida - Revisa Vínculos',
          icon: 'mail-unread-outline',
          disabled: true,
          textColor: '#1a1a1a',
          backgroundColor: '#D9B97E'
        };
      case 'none':
      default:
        return {
          text: 'Enviar Solicitud de Conexión',
          icon: 'people-outline',
          disabled: false,
          textColor: '#1a1a1a',
          backgroundColor: '#D9B97E'
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBackground} />
      <View style={styles.bottomBackground} />

      <ScrollView style={styles.container}>
        {/* Botón de volver */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Header Card */}
        <View style={[
          styles.headerCard,
          { width: isDesktop ? "40%" : isTablet ? "40%" : "80%" }
        ]}>
          <View style={styles.avatarContainer}>
            {profile.picture ? (
              <Image
                source={{ uri: authService.getImageUri(profile.picture) }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={50} color="#666" />
              </View>
            )}
          </View>

          <Text style={styles.name}>{profile.full_name}</Text>
          <Text style={styles.role}>{profile.roleName || "Estudiante"}</Text>
        </View>

        {/* Información del estudiante */}
        <View style={[
          styles.section,
          { width: isDesktop ? "40%" : isTablet ? "40%" : "80%" }
        ]}>
          <Text style={styles.sectionTitle}>Información</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#fff" />
            <Text style={styles.infoText}>{profile.email || "No disponible"}</Text>
          </View>

          {profile.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#fff" />
              <Text style={styles.infoText}>{profile.phone}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color="#fff" />
            <Text style={styles.infoText}>
              {profile.program || "Sin programa asignado"}
            </Text>
          </View>
        </View>

        {/* Materias en Común */}
        {profile.common_courses && profile.common_courses.length > 0 && (
          <View style={[
            styles.section,
            { width: isDesktop ? "40%" : isTablet ? "40%" : "80%" }
          ]}>
            <Text style={styles.sectionTitle}>Materias en Común</Text>
            <Text style={styles.subtitle}>
              {profile.common_courses.length} {profile.common_courses.length === 1 ? 'materia' : 'materias'} compartidas
            </Text>
            
            {profile.common_courses.map((course: any) => (
              <View style={styles.courseItem} key={course.id_course}>
                <View style={styles.courseDot} />
                <View style={styles.courseTextContainer}>
                  <Text style={styles.courseName}>{course.name}</Text>
                  {course.schedule && (
                    <Text style={styles.courseSchedule}>{course.schedule}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Botón de Enviar Solicitud de Conexión */}
        <TouchableOpacity 
          style={[
            styles.connectionButton,
            { 
              width: isDesktop ? "40%" : isTablet ? "40%" : "80%",
              backgroundColor: buttonConfig.backgroundColor
            },
            (isSendingRequest || buttonConfig.disabled) && styles.connectionButtonDisabled
          ]}
          onPress={handleSendConnectionRequest}
          activeOpacity={0.8}
          disabled={isSendingRequest || buttonConfig.disabled} 
        >
          {isSendingRequest ? ( 
            <ActivityIndicator size="small" color="#1a1a1a" />
          ) : (
            <>
              <Ionicons name={buttonConfig.icon as any} size={20} color={buttonConfig.textColor} style={styles.buttonIcon} />
              <Text style={[styles.connectionButtonText, { color: buttonConfig.textColor }]}>{buttonConfig.text}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  topBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "35%",
    backgroundColor: "#1a1a1a",
  },
  bottomBackground: {
    position: "absolute",
    top: "35%",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#363636",
  },
  container: { flex: 1 },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 8,
  },
  headerCard: {
    backgroundColor: "rgba(26, 26, 26, 0.8)",
    marginTop: 75,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 30,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 30,
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#D9B97E",
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
    borderColor: "#D9B97E",
  },
  avatarPlaceholder: {
    backgroundColor: "#4a4a4a",
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "rgba(26, 26, 26, 0.9)",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 20,
    padding: 20,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "rgba(217, 185, 126, 0.3)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
    marginLeft: 12,
  },
  courseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  courseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D9B97E",
    marginRight: 12,
  },
  courseTextContainer: { flex: 1 },
  courseName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 2,
  },
  courseSchedule: {
    fontSize: 12,
    color: "#aaa",
  },
  connectionButton: {
    backgroundColor: "#D9B97E",
    marginHorizontal: 15,
    marginBottom: 30,
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  connectionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#363636",
  },
  errorText: {
    color: "#fff",
    marginTop: 10,
  },
  backLink: {
    color: "#D9B97E",
    marginTop: 10,
    fontSize: 16,
  },
   connectionButtonDisabled: {
    opacity: 0.6,
  },
});