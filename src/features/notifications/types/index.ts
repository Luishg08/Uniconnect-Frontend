export type PushTokenPayload = {
  token: string;
  device_type: string;
  device_name: string;
};

export type Notification = {
  id_notification: number;
  id_user?: number;
  message?: string;
  is_read?: boolean;
  created_at?: string;
  related_entity_id?: number;
  notification_type?: string;
  push_sent?: boolean;
};