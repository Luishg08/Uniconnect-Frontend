import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../auth";
import { studentService } from "../services/student.service";
import { UpdateProfileData } from "../types";
import FlashMessage, { showMessage } from "react-native-flash-message";


export function useProfile() {
  const token = useAuthStore((state) => state.token);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showMessage({
        message: "¡Perfil actualizado!",
        description: "Tus cambios se guardaron con éxito",
        type: "success",
        icon: "success",
        });
    },
    onError: () => {
      showMessage({
        message: "Error al actualizar perfil",
        description: "No se pudieron guardar los cambios",
        type: "danger",
        icon: "danger",
        });
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