import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGroups } from "@/src/features/groups/hooks/useGroups";
import { GroupCard } from "@/src/features/groups/components/GroupCard";
import { CreateGroupModal } from "@/src/features/groups/components/CreateGroup";
import { EditGroupModal } from "@/src/features/groups/components/EditGroup";
import { Group } from "@/src/features/groups/types";

export default function GroupsScreen() {
  const router = useRouter();
  const {
    groups,
    isLoading,
    isError,
    deleteGroup,
    createGroup,
    updateGroup,
    isUpdating,
    isDeleting,
  } = useGroups();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const handleGroupPress = (groupId: number) => {
    router.push(`/groups/${groupId}` as any);
  };

  const handleCreateGroup = () => {
    setCreateModalVisible(true);
  };

  const handleSaveNewGroup = (groupData: any) => {
    createGroup(groupData, {
      onSuccess: () => {
        setCreateModalVisible(false);
      },
    });
  };

  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    setEditModalVisible(true);
  };

  const handleUpdateGroup = (groupData: any) => {
    updateGroup(
      { id: groupData.id_group, data: groupData },
      {
        onSuccess: () => {
          setEditModalVisible(false);
          setSelectedGroup(null);
        },
      },
    );
  };

  const handleDelete = (group: Group) => {
    deleteGroup(group.id_group);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando grupos...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#ff4d4d" />
        <Text style={styles.errorText}>Error al cargar los grupos</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Grupos de Estudio</Text>
          <Text style={styles.subtitle}>
            {groups?.length || 0} {groups?.length === 1 ? "grupo" : "grupos"}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateGroup}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {groups && groups.length > 0 ? (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id_group.toString()}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onPress={() => handleGroupPress(item.id_group)}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
              isDeleting={isDeleting}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No hay grupos creados</Text>
          <Text style={styles.emptySubtext}>
            Crea tu primer grupo de estudio para comenzar
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateGroup}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Crear Grupo</Text>
          </TouchableOpacity>
        </View>
      )}

      <CreateGroupModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSave={handleSaveNewGroup}
      />

      <EditGroupModal
        visible={editModalVisible}
        group={selectedGroup}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedGroup(null);
        }}
        onSave={handleUpdateGroup}
        isLoading={isUpdating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  listContent: {
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#ff4d4d",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
