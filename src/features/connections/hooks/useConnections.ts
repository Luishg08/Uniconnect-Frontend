import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionService } from '../services/connections.service';
import { Alert } from 'react-native';
import { showToast } from '@/src/lib/toast';

export const useConnections = () => {
  const queryClient = useQueryClient();

  // Obtener solicitudes pendientes
  const { data: pendingRequests, isLoading, isError } = useQuery({
    queryKey: ['pending-connections'],
    queryFn: connectionService.getPendingRequests,
  });

  // Enviar solicitud de conexión
  const sendRequestMutation = useMutation({
    mutationFn: connectionService.sendConnectionRequest,
    onSuccess: () => {
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
    sendConnectionRequest: sendRequestMutation.mutate,
    acceptConnectionRequest: acceptRequestMutation.mutate,
    rejectConnectionRequest: rejectRequestMutation.mutate,
    isSendingRequest: sendRequestMutation.isPending,
    isAccepting: acceptRequestMutation.isPending,
    isRejecting: rejectRequestMutation.isPending,
  };
};