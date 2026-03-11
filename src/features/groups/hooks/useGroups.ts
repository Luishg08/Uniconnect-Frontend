import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsService } from '../services/groups.service';
import { GroupCreateRequest } from '../types';
import { showToast } from '@/src/lib/toast';
import { authStore } from '@/src/features/auth';

export const useGroups = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: GroupCreateRequest) => {
      const token = authStore.accessToken || '';
      return groupsService.createGroup(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
      queryClient.invalidateQueries({ queryKey: ['discoverGroups'] });
      showToast.success('Éxito', 'Grupo creado correctamente');
    },
    onError: (error: any) => {
      showToast.error('Error', error.response?.data?.message || 'No se pudo crear el grupo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      const token = authStore.accessToken || '';
      return groupsService.createGroup(data, token); // TODO: Implementar updateGroup en el servicio
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
      queryClient.invalidateQueries({ queryKey: ['discoverGroups'] });
      showToast.success('Éxito', 'Grupo actualizado correctamente');
    },
    onError: (error: any) => {
      showToast.error('Error', error.response?.data?.message || 'No se pudo actualizar el grupo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      const token = authStore.accessToken || '';
      return groupsService.deleteGroup(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
      queryClient.invalidateQueries({ queryKey: ['discoverGroups'] });
      showToast.success('Éxito', 'Grupo eliminado correctamente');
    },
    onError: (error: any) => {
      showToast.error('Error', error.response?.data?.message || 'No se pudo eliminar el grupo');
    },
  });

  return {
    createGroup: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateGroup: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteGroup: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};