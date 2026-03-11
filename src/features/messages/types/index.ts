export interface Message {
  id_message: number;
  id_membership: number;
  text_content: string;
  send_at: string;
  attachments: string;
  is_edited: boolean;
  edited_at: string | null;
  membership?: {
    user: {
      id_user: number;
      full_name: string;
      picture?: string;
    };
    group: {
      id_group: number;
      name: string;
    };
  };
}

export interface SendMessageDto {
  id_membership: number;
  text_content: string;
  attachments?: string;
}

export interface EditMessageDto {
  id_message: number;
  text_content: string;
}

export interface MessageHistoryResponse {
  messages: Message[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MessageSearchResponse {
  results: Message[];
  count: number;
}

export interface TypingIndicator {
  id_user: number;
  full_name: string;
  is_typing: boolean;
}
