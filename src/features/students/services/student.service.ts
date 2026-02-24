import { api } from '@/src/constants/api';
import { STUDENT_ENDPOINTS } from '../api/endpoints';
import { Student } from '../types';

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
};