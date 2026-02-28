import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Student } from "../types";
import { authService } from "../../auth/services/auth.service";

interface StudentCardProps {
  student: Student;
}

export const StudentCard = ({ student }: StudentCardProps) => {
  const router = useRouter();

  const handlePress = () => {
  router.push(`/(tabs)/student-profile?id=${student.id_user}`);
};

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri:
            authService.getImageUri(student.picture) ||
            "https://via.placeholder.com/50",
        }}
        style={styles.avatar}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{student.full_name}</Text>

        {/* Programa Académico */}
        <Text style={styles.program}>
          {student.program?.name || "Programa no asignado"}
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(26, 26, 26, 0.9)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    marginHorizontal: 15,
    // Sombra para iOS y Android
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderWidth: 1,
    borderColor: "rgba(217, 185, 126, 0.3)",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4a4a4a",
    borderWidth: 2,
    borderColor: "#D9B97E",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  program: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    backgroundColor: "rgba(217, 185, 126, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D9B97E",
  },
  badgeText: {
    fontSize: 11,
    color: "#D9B97E",
    fontWeight: "600",
  },
  noCourses: {
    fontSize: 11,
    color: "#888",
    fontStyle: "italic",
  },
});
