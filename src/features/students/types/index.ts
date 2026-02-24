export interface Course {
  id_course: number;
  name: string;
}

export interface Enrollment {
  id_enrollment: number;
  course: Course;
}

export interface Student {
  id_user: number;
  full_name: string;
  email: string;
  picture?: string;
  id_program?: number;
  program?: { name: string };
  enrollments: Enrollment[];
}