export interface Group {
  id_group: number;
  name: string;
  description: string;
  id_course: number;
  owner_id: number;
  created_at: string;
  course: Course;
  owner?: {
    id_user: number;
    full_name: string;
    picture?: string;
  };
  _count?: {
    memberships: number;
  };
  member_count?: number;
  members_count?: number;
  last_message?: {
    text_content: string;
    send_at: string;
  };
}

export interface Course {
  id_course?: number;
  name: string;
  code?: string;
  program: Program;
}

export interface Program {
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

export interface GroupMembership {
  id_membership: number;
  id_group: number;
  id_user: number;
  role: 'admin' | 'member';
  joined_at: string;
  user?: {
    id_user: number;
    full_name: string;
    email: string;
    picture?: string;
  };
  group?: Group;
}

export interface GroupInvitation {
  id_invitation: number;
  id_group: number;
  inviter_id: number;
  invitee_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  group?: {
    id_group: number;
    name: string;
    description?: string;
    course: {
      id_course: number;
      name: string;
      code: string;
    };
  };
  inviter?: {
    id_user: number;
    full_name: string;
    picture?: string;
  };
}

export interface SendInvitationDto {
  id_group: number;
  inviter_id: number;
  invitee_id: number;
}

export interface RespondInvitationDto {
  response: 'accepted' | 'rejected';
}

// Tipos adicionales para servicios

export interface GroupCreateRequest {
  name: string;
  description: string;
  id_course: number;
  owner_id: number;
}

export interface GroupInvitationRequest {
  id_group: number;
  inviter_id: number;
  invitee_id: number;
}

export interface GroupInvitationResponse {
  message: string;
  invitation?: GroupInvitation;
  membership?: GroupMembership;
}