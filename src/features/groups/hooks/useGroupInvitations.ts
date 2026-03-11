import { useState, useEffect, useCallback } from 'react';
import { groupsService } from '../services/groups.service';
import { GroupInvitation, GroupInvitationRequest } from '../types';

export const useGroupInvitations = (userId: number, token: string) => {
  const [pendingInvitations, setPendingInvitations] = useState<GroupInvitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar invitaciones pendientes
  const loadPendingInvitations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await groupsService.getPendingInvitations(userId, token);
      setPendingInvitations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar invitaciones pendientes');
      console.error('Error al cargar invitaciones pendientes:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  // Cargar invitaciones enviadas
  const loadSentInvitations = useCallback(async () => {
    try {
      const data = await groupsService.getSentInvitations(userId, token);
      setSentInvitations(data);
    } catch (err: any) {
      console.error('Error al cargar invitaciones enviadas:', err);
    }
  }, [userId, token]);

  // Enviar invitación
  const sendInvitation = useCallback(async (invitationData: GroupInvitationRequest) => {
    try {
      const newInvitation = await groupsService.sendInvitation(invitationData, token);
      setSentInvitations((prev) => [...prev, newInvitation]);
      return newInvitation;
    } catch (err: any) {
      console.error('Error al enviar invitación:', err);
      throw err;
    }
  }, [token]);

  // Responder a invitación
  const respondToInvitation = useCallback(async (
    invitationId: number,
    response: 'accepted' | 'rejected'
  ) => {
    try {
      const result = await groupsService.respondToInvitation(invitationId, response, token);
      
      // Remover de pendientes
      setPendingInvitations((prev) => prev.filter((inv) => inv.id_invitation !== invitationId));
      
      return result;
    } catch (err: any) {
      console.error('Error al responder invitación:', err);
      throw err;
    }
  }, [token]);

  // Cancelar invitación
  const cancelInvitation = useCallback(async (invitationId: number) => {
    try {
      await groupsService.cancelInvitation(invitationId, token);
      
      // Remover de enviadas
      setSentInvitations((prev) => prev.filter((inv) => inv.id_invitation !== invitationId));
    } catch (err: any) {
      console.error('Error al cancelar invitación:', err);
      throw err;
    }
  }, [token]);

  useEffect(() => {
    loadPendingInvitations();
    loadSentInvitations();
  }, [loadPendingInvitations, loadSentInvitations]);

  return {
    pendingInvitations,
    sentInvitations,
    loading,
    error,
    sendInvitation,
    respondToInvitation,
    cancelInvitation,
    reloadInvitations: loadPendingInvitations,
  };
};
