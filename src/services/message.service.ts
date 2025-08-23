import { HttpClient } from "./api.config";
import type { QueryParams } from "./api.config";
import { AuthService } from "./auth.service";
import type {
  Message,
  MessagePaginatedResponse,
  CreateMessageRequest,
  UpdateMessageRequest,
  MessageQueryParams,
  ConversationUser,
} from "@/types/message";

export class MessageService {
  private static readonly BASE_PATH = "/message";

  // Get a message by ID
  static async getById(id: string, fields?: string): Promise<Message> {
    try {
      const params: QueryParams = {};
      if (fields) params.fields = fields;

      const response = await HttpClient.get<Message>(`${this.BASE_PATH}/${id}`, params);
      return response as Message;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch message");
    }
  }

  // Get all messages (with pagination and conversation filtering)
  static async getAll(params?: MessageQueryParams): Promise<MessagePaginatedResponse> {
    try {
      const queryParams: QueryParams = {
        page: params?.page || 1,
        limit: params?.limit || 10,
        order: params?.order || "desc",
        ...(params?.fields && { fields: params.fields }),
        ...(params?.query && { query: params.query }),
        ...(params?.sort && { sort: params.sort }),
        ...(params?.conversationWith && { conversationWith: params.conversationWith }),
      };

      const response = await HttpClient.get<MessagePaginatedResponse>(this.BASE_PATH, queryParams);
      return response as MessagePaginatedResponse;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch messages");
    }
  }

  // Get conversation with a specific user
  static async getConversationWith(
    userId: string,
    params?: Omit<MessageQueryParams, "conversationWith">
  ): Promise<MessagePaginatedResponse> {
    try {
      return await this.getAll({
        ...params,
        conversationWith: userId,
      });
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch conversation");
    }
  }

  // Create a new message
  static async create(messageData: CreateMessageRequest): Promise<Message> {
    try {
      // Validate required fields
      if (!messageData.title?.trim()) {
        throw new Error("Title is required");
      }
      if (!messageData.content?.trim()) {
        throw new Error("Content is required");
      }
      if (!messageData.receiverId?.trim()) {
        throw new Error("Receiver ID is required");
      }

      const response = await HttpClient.post<Message>(this.BASE_PATH, {
        title: messageData.title.trim(),
        content: messageData.content.trim(),
        receiverId: messageData.receiverId,
        attachments: messageData.attachments || [],
      });
      return response as Message;
    } catch (error: any) {
      throw new Error(error.message || "Failed to create message");
    }
  }

  // Update a message
  static async update(id: string, messageData: UpdateMessageRequest): Promise<Message> {
    try {
      if (!id) {
        throw new Error("Message ID is required");
      }

      // Validate fields if provided
      if (messageData.title !== undefined && !messageData.title.trim()) {
        throw new Error("Title cannot be empty");
      }
      if (messageData.content !== undefined && !messageData.content.trim()) {
        throw new Error("Content cannot be empty");
      }

      const updateData: UpdateMessageRequest = {};
      if (messageData.title !== undefined) updateData.title = messageData.title.trim();
      if (messageData.content !== undefined) updateData.content = messageData.content.trim();
      if (messageData.attachments !== undefined) updateData.attachments = messageData.attachments;
      if (messageData.read !== undefined) updateData.read = messageData.read;

      const response = await HttpClient.patch<Message>(`${this.BASE_PATH}/${id}`, updateData);
      return response as Message;
    } catch (error: any) {
      throw new Error(error.message || "Failed to update message");
    }
  }

  // Mark message as read
  static async markAsRead(id: string): Promise<Message> {
    try {
      return await this.update(id, { read: true });
    } catch (error: any) {
      throw new Error(error.message || "Failed to mark message as read");
    }
  }

  // Delete a message (soft delete)
  static async delete(id: string): Promise<{ message: string }> {
    try {
      if (!id) {
        throw new Error("Message ID is required");
      }

      const response = await HttpClient.put<{ message: string }>(`${this.BASE_PATH}/${id}`, {});
      return response as { message: string };
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete message");
    }
  }

  // Get unread messages count
  static async getUnreadCount(): Promise<{ count: number }> {
    try {
      // Get messages to count unread ones - this could be optimized with a dedicated endpoint
      const unreadResponse = await HttpClient.get<MessagePaginatedResponse>(`${this.BASE_PATH}`, {
        fields: "id,read",
        limit: 1000, // Get enough to count unread
      });

      const unreadCount = (unreadResponse as MessagePaginatedResponse).messages.filter(
        (msg) => !msg.read
      ).length;

      return { count: unreadCount };
    } catch (error: any) {
      throw new Error(error.message || "Failed to get unread messages count");
    }
  }

  // Get recent conversations (unique users with last message)
  static async getRecentConversations(limit: number = 10): Promise<ConversationUser[]> {
    try {
      const response = await this.getAll({
        limit: 500, // Get more messages to group by conversation
        fields:
          "id,title,content,createdAt,read,senderId,receiverId,sender.id,sender.userName,sender.person.firstName,sender.person.lastName,receiver.id,receiver.userName,receiver.person.firstName,receiver.person.lastName",
      });

      const messages = (response as MessagePaginatedResponse).messages;
      const conversationMap = new Map<string, ConversationUser>();

      // Get current user from auth service
      const currentUser = AuthService.getCurrentUser();
      const currentUserId = currentUser?.id;

      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      // Group messages by conversation partner
      messages.forEach((message) => {
        // Determine the conversation partner (the other user, not the current user)
        let partner:
          | { id: string; userName: string; person: { firstName: string; lastName: string } }
          | undefined;
        let partnerId: string | undefined;

        // Determine who is the conversation partner based on current user
        if (message.sender && message.receiver) {
          if (message.senderId === currentUserId) {
            // Current user sent this message, so partner is the receiver
            partner = message.receiver;
            partnerId = message.receiverId;
          } else if (message.receiverId === currentUserId) {
            // Current user received this message, so partner is the sender
            partner = message.sender;
            partnerId = message.senderId;
          }
        }

        if (partner && partnerId && partnerId !== currentUserId) {
          const existing = conversationMap.get(partnerId);
          if (
            !existing ||
            new Date(message.createdAt) > new Date(existing.lastMessage?.createdAt || 0)
          ) {
            // Calculate unread count for this conversation (messages from partner that are unread)
            const unreadCount = messages.filter(
              (msg) => msg.senderId === partnerId && msg.receiverId === currentUserId && !msg.read
            ).length;

            conversationMap.set(partnerId, {
              id: partner.id,
              userName: partner.userName,
              person: partner.person,
              lastMessage: message,
              unreadCount,
            });
          }
        }
      });

      return Array.from(conversationMap.values())
        .sort((a, b) => {
          const dateA = new Date(a.lastMessage?.createdAt || 0);
          const dateB = new Date(b.lastMessage?.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit);
    } catch (error: any) {
      throw new Error(error.message || "Failed to get recent conversations");
    }
  }
}

// Export types
export type {
  Message,
  MessagePaginatedResponse,
  CreateMessageRequest,
  UpdateMessageRequest,
  MessageQueryParams,
  ConversationUser,
} from "@/types/message";
