import axios from 'axios';
import { groupsEndpoints, groupInvitationsEndpoints } from '../api/endpoints';
import { 
  Group, 
  GroupCreateRequest, 
  GroupInvitation, 
  GroupInvitationRequest,
  GroupInvitationResponse 
} from '../types';

class GroupsService {
  /**
   * Crear nuevo grupo de estudio
   */
  async createGroup(data: GroupCreateRequest, token: string): Promise<Group> {
    try {
      const response = await axios.post(groupsEndpoints.createGroup(), data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear grupo:', error);
      throw error;
    }
  }

  /**
   * Obtener grupos creados por el usuario (donde es owner/admin)
   */
  async getCreatedGroups(userId: number, token: string): Promise<Group[]> {
    try {
      const response = await axios.get(groupsEndpoints.getCreatedGroups(userId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener grupos creados:', error);
      throw error;
    }
  }

  /**
   * Obtener grupos donde el usuario es miembro
   */
  async getMemberGroups(userId: number, token: string): Promise<Group[]> {
    try {
      const response = await axios.get(groupsEndpoints.getMemberGroups(userId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener grupos como miembro:', error);
      throw error;
    }
  }

  /**
   * Descubrir grupos disponibles según las materias inscritas del usuario
   */
  async discoverGroups(userId: number, token: string): Promise<Group[]> {
    try {
      const response = await axios.get(groupsEndpoints.discoverGroups(userId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al descubrir grupos:', error);
      throw error;
    }
  }

  /**
   * Obtener grupos de una materia específica
   */
  async getGroupsByCourse(courseId: number, token: string): Promise<Group[]> {
    try {
      const response = await axios.get(groupsEndpoints.getGroupsByCourse(courseId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener grupos por materia:', error);
      throw error;
    }
  }

  /**
   * Obtener detalle de un grupo específico
   */
  async getGroupDetail(groupId: number, token: string): Promise<Group> {
    try {
      const response = await axios.get(groupsEndpoints.getGroupDetail(groupId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalle del grupo:', error);
      throw error;
    }
  }

  /**
   * Eliminar grupo (solo owner)
   */
  async deleteGroup(groupId: number, token: string): Promise<void> {
    try {
      await axios.delete(groupsEndpoints.deleteGroup(groupId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      throw error;
    }
  }

  // ==================== INVITACIONES ====================

  /**
   * Enviar invitación a un grupo (solo admin)
   */
  async sendInvitation(data: GroupInvitationRequest, token: string): Promise<GroupInvitation> {
    try {
      const response = await axios.post(groupInvitationsEndpoints.sendInvitation(), data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al enviar invitación:', error);
      throw error;
    }
  }

  /**
   * Obtener invitaciones pendientes del usuario
   */
  async getPendingInvitations(userId: number, token: string): Promise<GroupInvitation[]> {
    try {
      const response = await axios.get(groupInvitationsEndpoints.getPendingInvitations(userId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener invitaciones pendientes:', error);
      throw error;
    }
  }

  /**
   * Obtener invitaciones enviadas por el usuario
   */
  async getSentInvitations(userId: number, token: string): Promise<GroupInvitation[]> {
    try {
      const response = await axios.get(groupInvitationsEndpoints.getSentInvitations(userId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener invitaciones enviadas:', error);
      throw error;
    }
  }

  /**
   * Responder a una invitación (aceptar o rechazar)
   */
  async respondToInvitation(
    invitationId: number, 
    response: 'accepted' | 'rejected', 
    token: string
  ): Promise<GroupInvitationResponse> {
    try {
      const res = await axios.patch(
        groupInvitationsEndpoints.respondToInvitation(invitationId),
        { response },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error('Error al responder invitación:', error);
      throw error;
    }
  }

  /**
   * Cancelar invitación (solo quien la envió)
   */
  async cancelInvitation(invitationId: number, token: string): Promise<void> {
    try {
      await axios.delete(groupInvitationsEndpoints.cancelInvitation(invitationId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error al cancelar invitación:', error);
      throw error;
    }
  }
}

export const groupsService = new GroupsService();
export default GroupsService;