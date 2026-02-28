import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Group } from "../types";

interface GroupCardProps {
  group: Group;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export const GroupCard = ({ group, onPress, onEdit, onDelete, isDeleting = false }: GroupCardProps) => {
  const membersCount = group._count?.memberships || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="people" size={24} color="#D9B97E" />
          <View style={styles.headerInfo}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.courseName}>{group.course.name}</Text>
            <Text style={styles.programName}>{group.course.program.name}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            style={styles.actionButton}
            disabled={isDeleting}
          >
            <Ionicons name="create-outline" size={22} color="#D9B97E" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={styles.actionButton}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ff4d4d" />
            ) : (
              <Ionicons name="trash-outline" size={22} color="#ff4d4d" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {group.description && (
        <Text style={styles.description} numberOfLines={2}>
          {group.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.membersInfo}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.membersText}>
            {membersCount} {membersCount === 1 ? "miembro" : "miembros"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(26, 26, 26, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(217, 185, 126, 0.3)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: "#D9B97E",
    fontWeight: "600",
    marginBottom: 2,
  },
  programName: {
    fontSize: 12,
    color: "#aaa",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(217, 185, 126, 0.2)",
    paddingTop: 12,
  },
  membersInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  membersText: {
    fontSize: 13,
    color: "#aaa",
    fontWeight: "500",
  },
});
