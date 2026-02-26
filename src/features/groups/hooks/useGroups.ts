import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from '../services/groups.service';
import { Alert } from 'react-native';
import { CreateGroupData, UpdateGroupData } from '../types';
import { showToast } from '@/src/lib/toast';

export const useGroups = () => {
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: groupService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateGroupData) => groupService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      showToast.success('Éxito', 'Grupo creado correctamente');
    },
    onError: (error: any) => {
      showToast.error('Error', error.response?.data?.message || 'No se pudo crear el grupo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGroupData }) =>
      groupService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      showToast.success('Éxito', 'Grupo actualizado correctamente');
    },
    onError: (error: any) => {
      showToast.error('Error', error.response?.data?.message || 'No se pudo actualizar el grupo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => groupService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      showToast.success('Éxito', 'Grupo eliminado correctamente');
    },
    onError: (error: any) => {
      showToast.error('Error', error.response?.data?.message || 'No se pudo eliminar el grupo');
    },
  });

  return {
    groups: groupsQuery.data,
    isLoading: groupsQuery.isLoading,
    isError: groupsQuery.isError,
    createGroup: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateGroup: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteGroup: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};