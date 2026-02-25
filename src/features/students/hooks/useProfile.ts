import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../auth";
import { studentService } from "../services/student.service";
import { UpdateProfileData } from "../types";
import FlashMessage, { showMessage } from "react-native-flash-message";


export function useProfile() {
  const token = useAuthStore((state) => state.token);
  const updateUserPicture = useAuthStore((state) => state.updateUserPicture);
  const queryClient = useQueryClient();

  // Query para obtener perfil
  const profileQuery = useQuery({
    queryKey: ['profile', token],
    queryFn: () => studentService.getProfile(token!),
    enabled: !!token,
  });

  // Query para obtener cursos
  const coursesQuery = useQuery({
    queryKey: ['courses', token],
    queryFn: () => studentService.getCourses(),
    enabled: !!token,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => studentService.updateProfile(data, token!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (data.picture) {
        updateUserPicture(data.picture);
      }
      console.log("Perfil actualizado exitosamente");
    },
    onError: (error) => {
      console.error("Error al actualizar perfil:", error);
    },
  });

  return {
    profile: profileQuery.data,
    courses: coursesQuery.data,
    isLoading: profileQuery.isLoading || coursesQuery.isLoading,
    isError: profileQuery.isError || coursesQuery.isError,
    updateProfile: updateProfileMutation.mutate,
  };
}