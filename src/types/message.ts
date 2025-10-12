export interface Message {
  id: string;
  title: string;
  content: string;
  attachments?: string[] | null;
  read: boolean;
  isDeleted: boolean;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender?: {
    id: string;
    userName: string;
    avatar?: string;
    person: {
      firstName: string;
      lastName: string;
    };
  };
  receiver?: {
    id: string;
    userName: string;
    avatar?: string;
    person: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface MessagePaginatedResponse {
  messages: Message[];
  total: number;
  page: number;
  totalPages: number;
  conversationWith: string | null;
}

export interface CreateMessageRequest {
  title: string;
  content: string;
  attachments?: string[];
  receiverId: string;
}

export interface UpdateMessageRequest {
  title?: string;
  content?: string;
  attachments?: string[];
  read?: boolean;
}

export interface MessageQueryParams {
  page?: number;
  limit?: number;
  fields?: string;
  query?: string;
  order?: "asc" | "desc";
  sort?: string;
  conversationWith?: string;
}

// Socket.io event interfaces
export interface SocketMessage {
  message: Message;
  from: string;
  timestamp: Date;
}

export interface MessageReadEvent {
  messageId: string;
  readBy: string;
  readAt: Date;
}

export interface MessageUpdatedEvent {
  messageId: string;
  updatedFields: string[];
  message: Message;
  timestamp: Date;
}

export interface MessageDeletedEvent {
  messageId: string;
  timestamp: Date;
}

export interface MessageSentEvent {
  message: Message;
  to: string;
  timestamp: Date;
}

export interface ConversationUser {
  id: string;
  userName: string;
  avatar?: string;
  person: {
    firstName: string;
    lastName: string;
  };
  lastMessage?: Message;
  unreadCount?: number;
}
