import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionService } from '../services/connections.service';
import { showToast } from '@/src/lib/toast';

export const useConnections = () => {
  const queryClient = useQueryClient();

  // Obtener solicitudes pendientes — sin polling, se refresca tras cada acción
  const { data: pendingRequests, isLoading, isError, refetch } = useQuery({
    queryKey: ['pending-connections'],
    queryFn: connectionService.getPendingRequests,
    staleTime: 1000 * 60, // 1 minuto — no refetch automático
  });

  // Enviar solicitud de conexión
  const sendRequestMutation = useMutation({
    mutationFn: connectionService.sendConnectionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-connections'] });
      showToast.success('Éxito', 'Solicitud de conexión enviada');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al enviar solicitud';
      showToast.error('Error', message);
    },
  });

  // Aceptar solicitud
  const acceptRequestMutation = useMutation({
    mutationFn: connectionService.acceptConnectionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-status'] });
      showToast.success('Éxito', 'Solicitud aceptada');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al aceptar solicitud';
      showToast.error('Error', message);
    },
  });

  // Rechazar solicitud
  const rejectRequestMutation = useMutation({
    mutationFn: connectionService.rejectConnectionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-status'] });
      showToast.success('Éxito', 'Solicitud rechazada');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al rechazar solicitud';
      showToast.error('Error', message);
    },
  });

  return {
    pendingRequests: pendingRequests || [],
    isLoading,
    isError,
    refetch,
    sendConnectionRequest: sendRequestMutation.mutate,
    acceptConnectionRequest: acceptRequestMutation.mutate,
    rejectConnectionRequest: rejectRequestMutation.mutate,
    isSendingRequest: sendRequestMutation.isPending,
    isAccepting: acceptRequestMutation.isPending,
    isRejecting: rejectRequestMutation.isPending,
  };
};

// Hook for individual connection status (used in student profile screen)
export const useConnectionStatus = (userId: number) => {
  const queryClient = useQueryClient();

  const { data: connectionStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['connection-status', userId],
    queryFn: () => connectionService.getConnectionStatus(userId),
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minuto — no refetch automático
  });

  const sendRequestMutation = useMutation({
    mutationFn: connectionService.sendConnectionRequest,
    onMutate: async () => {
      // Actualización optimista: muestra "Solicitud pendiente" al instante
      await queryClient.cancelQueries({ queryKey: ['connection-status', userId] });
      const prev = queryClient.getQueryData(['connection-status', userId]);
      queryClient.setQueryData(['connection-status', userId], {
        status: 'pending',
        is_requester: true,
        id_connection: null,
      });
      return { prev };
    },
    onError: (error: any, _vars, context: any) => {
      // Revierte si falla
      queryClient.setQueryData(['connection-status', userId], context?.prev);
      const message = error.response?.data?.message || 'Error al enviar solicitud';
      showToast.error('Error', message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', userId] });
    },
    onSuccess: () => {
      showToast.success('Éxito', 'Solicitud de conexión enviada');
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: connectionService.acceptConnectionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', userId] });
      queryClient.invalidateQueries({ queryKey: ['pending-connections'] });
      showToast.success('Éxito', 'Solicitud aceptada');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al aceptar solicitud';
      showToast.error('Error', message);
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: connectionService.rejectConnectionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', userId] });
      queryClient.invalidateQueries({ queryKey: ['pending-connections'] });
      showToast.success('Éxito', 'Solicitud rechazada');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al rechazar solicitud';
      showToast.error('Error', message);
    },
  });

  return {
    connectionStatus,
    isLoadingStatus,
    sendConnectionRequest: sendRequestMutation.mutate,
    acceptConnectionRequest: acceptRequestMutation.mutate,
    rejectConnectionRequest: rejectRequestMutation.mutate,
    isSendingRequest: sendRequestMutation.isPending,
    isAccepting: acceptRequestMutation.isPending,
    isRejecting: rejectRequestMutation.isPending,
  };
};