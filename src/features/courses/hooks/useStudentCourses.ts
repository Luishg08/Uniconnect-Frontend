import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseService } from "../services/courses.service";
import { Alert } from "react-native";

export const useStudentCourses = () => {
  const queryClient = useQueryClient();

  const addCourseMutation = useMutation({
    mutationFn: (data: { id_course: string; status: string }) =>
      courseService.addCourseToStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      Alert.alert("Éxito", "Curso agregado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al agregar curso:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudo agregar el curso"
      );
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ courseId, state }: { courseId: number; state: string }) =>
      courseService.updateCourseState(courseId, state),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      Alert.alert("Éxito", "Estado del curso actualizado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al actualizar curso:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudo actualizar el curso"
      );
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId: number) => {
      return courseService.deleteCourseFromStudent(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      Alert.alert("Éxito", "Curso eliminado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al eliminar curso:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudo eliminar el curso"
      );
    },
  });

  return {
    addCourse: addCourseMutation.mutate,
    isAddingCourse: addCourseMutation.isPending,
    deleteCourse: deleteCourseMutation.mutate,
    isDeletingCourse: deleteCourseMutation.isPending,
    updateCourse: updateCourseMutation.mutate,
    isUpdatingCourse: updateCourseMutation.isPending,
  };
};