export const COURSES_ENDPOINTS = {
  GET_PROGRAM_COURSES: '/courses/get-by-student',
  ADD_COURSE_TO_STUDENT: '/enrollments',
  DELETE_COURSE_FROM_STUDENT: '/enrollments',
  UPDATE_COURSE_STATE: '/enrollments',
} as const;