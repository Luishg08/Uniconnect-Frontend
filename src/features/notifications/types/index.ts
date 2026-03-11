export type PushTokenPayload = {
  token: string;
  device_type: string;
  device_name: string;
};

export type NotificationType =
  | 'group_invitation'
  | 'invitation_accepted'
  | 'new_member'
  | 'new_message'
  | 'connection_request'
  | 'connection_accepted';

export type Notification = {
  id_notification: number;
  id_user: number;
  message: string;
  is_read: boolean;
  created_at: string;
  related_entity_id?: number;
  notification_type: NotificationType;
  push_sent?: boolean;
};

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationCount {
  count: number;
}