import { api } from '@/src/constants/api';
import { GROUPS_ENDPOINTS } from '../api/endpoints';
import { CreateGroupData, UpdateGroupData } from '../types';
import { authStore } from '../../auth';

export const groupService = {
  getAll: async () => {
    const user = authStore.user;
    const { data } = await api.get(`${GROUPS_ENDPOINTS.GET_BY_STUDENT}/${user?.id_user}`);
    return data;
  },

  create: async (groupData: CreateGroupData) => {
    const { data } = await api.post(`${GROUPS_ENDPOINTS.CREATE_GROUP}`, groupData);
    return data;
  },

  update: async (id: number, groupData: UpdateGroupData) => {
    const { data } = await api.patch(`${GROUPS_ENDPOINTS.UPDATE_GROUP}/${id}`, {
      name: groupData.name,
      description: groupData.description,
      id_course: groupData.id_course,
      owner_id: groupData.owner_id,
    });
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete(`${GROUPS_ENDPOINTS.DELETE_GROUP}/${id}`);
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get(`${GROUPS_ENDPOINTS.GET_BY_ID}/${id}`);
    return data;
  },
};