import { api } from '@/src/constants/api';
import { STUDENT_ENDPOINTS } from '../api/endpoints';
import { OtherUserProfile, Student, UpdateProfileData, UserProfile } from '../types';
import { useAuthStore } from '../../auth';

export const studentService = {

  getStudents: async (filters: { 
    search?: string; 
    id_program?: number; 
    id_course?: number 
  }): Promise<Student[]> => {
    const { data } = await api.get(STUDENT_ENDPOINTS.GET_ALL, { params: filters });
    return data;
  },


  getCourses: async () => {
    const { data } = await api.get(STUDENT_ENDPOINTS.GET_COURSES);
    return data;
  },

  getProfile: async (token: string): Promise<UserProfile> => {
    const response = await api.get(`${STUDENT_ENDPOINTS.GET_PROFILE}`);
    return response.data;
  },

   updateProfile: async (data: UpdateProfileData, token: string): Promise<UserProfile> => {
    const response = await api.patch(`${STUDENT_ENDPOINTS.UPDATE_PROFILE}`, data);
    return response.data;
  },

  getStudentProfile: async (userId: number): Promise<OtherUserProfile> => {
    const response = await api.get(`${STUDENT_ENDPOINTS.GET_STUDENT_PROFILE}/${userId}`);
    return response.data;
  }


};