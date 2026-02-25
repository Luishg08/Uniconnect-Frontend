export interface Group {
  id_group: number;
  name: string;
  description: string;
  id_course: number;
  owner_id: number;
  course: Course;
  _count:{
    memberships: number;
  }
}

export interface Course{
  name: string;
  program: Program;
}

export interface Program{
  name: string;
}

export interface CreateGroupData {
  name: string;
  description: string;
  id_course: number;
  owner_id: number;
}

export interface UpdateGroupData {
  name: string;
  description: string;
  id_course: number;
  owner_id: number;
}