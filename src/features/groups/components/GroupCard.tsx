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
          <Ionicons name="people" size={24} color="#007AFF" />
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
            <Ionicons name="create-outline" size={22} color="#666" />
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    color: "#1a1a1a",
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 2,
  },
  programName: {
    fontSize: 12,
    color: "#999",
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
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  membersInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  membersText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
});
