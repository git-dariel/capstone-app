import { useState, useEffect, useCallback, useRef } from "react";
import { MessageService } from "@/services/message.service";
import { socketService } from "@/services/socket.service";
import { useAuth } from "./useAuth";
import type {
  Message,
  CreateMessageRequest,
  UpdateMessageRequest,
  MessageQueryParams,
  ConversationUser,
  SocketMessage,
  MessageReadEvent,
  MessageUpdatedEvent,
  MessageDeletedEvent,
  MessageSentEvent,
} from "@/types/message";

interface MessagesState {
  messages: Message[];
  conversations: ConversationUser[];
  currentConversation: string | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
  };
  unreadCount: number;
  socketConnected: boolean;
}

interface UseMessagesOptions {
  autoConnect?: boolean;
  initialLimit?: number;
}

export const useMessages = (options: UseMessagesOptions = {}) => {
  const { autoConnect = true, initialLimit = 20 } = options;
  const { user } = useAuth();
  // Ensure we only connect once per mount/session when the user id becomes available
  const hasConnectedRef = useRef(false);
  // Track if this hook instance initiated the socket connection
  const didConnectRef = useRef(false);

  const [messagesState, setMessagesState] = useState<MessagesState>({
    messages: [],
    conversations: [],
    currentConversation: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      totalPages: 1,
      total: 0,
      hasNextPage: false,
    },
    unreadCount: 0,
    socketConnected: false,
  });

  // (moved below after declaring initializeSocket and loaders)

  // Only disconnect on unmount of this hook/consumer
  useEffect(() => {
    return () => {
      if (didConnectRef.current) {
        socketService.disconnect();
      }
    };
  }, []);

  // Initialize socket with event handlers
  const initializeSocket = useCallback(() => {
    if (!user) return;

    socketService.connect({
      onConnect: () => {
        console.log("Socket connected for messaging");
        setMessagesState((prev) => ({ ...prev, socketConnected: true }));
      },
      onDisconnect: () => {
        console.log("Socket disconnected");
        setMessagesState((prev) => ({ ...prev, socketConnected: false }));
      },
      onNewMessage: handleNewMessage,
      onMessageSent: handleMessageSent,
      onMessageRead: handleMessageRead,
      onMessageUpdated: handleMessageUpdated,
      onMessageDeleted: handleMessageDeleted,
      onError: (error) => {
        console.error("Socket error in useMessages:", error);
        setMessagesState((prev) => ({
          ...prev,
          error: "Real-time connection error",
          socketConnected: false,
        }));
      },
    });
    didConnectRef.current = true;
  }, [user]);

  // (moved below after declaring callbacks)

  // Socket event handlers
  const handleNewMessage = useCallback(
    (data: SocketMessage) => {
      const { message } = data;

      console.log("Received new message in useMessages:", message);

      // Add message to current conversation if it matches
      setMessagesState((prev) => {
        const isFromCurrentConversation =
          message.senderId === prev.currentConversation ||
          message.receiverId === prev.currentConversation;

        let updatedMessages = prev.messages;
        if (prev.currentConversation && isFromCurrentConversation) {
          // Add message to current conversation
          updatedMessages = [message, ...prev.messages];
        }

        // Update unread count if message is for current user
        let updatedUnreadCount = prev.unreadCount;
        if (message.receiverId === user?.id) {
          updatedUnreadCount = prev.unreadCount + 1;
        }

        return {
          ...prev,
          messages: updatedMessages,
          unreadCount: updatedUnreadCount,
        };
      });

      // Update conversations list when receiving a new message
      // We'll trigger this separately to avoid dependency issues
      setTimeout(() => {
        // Reload conversations after a short delay
        MessageService.getRecentConversations()
          .then((conversations) => {
            setMessagesState((prev) => ({ ...prev, conversations }));
          })
          .catch((error) => {
            console.error("Error updating conversations:", error);
          });
      }, 100);
    },
    [user?.id]
  );

  const handleMessageSent = useCallback((data: MessageSentEvent) => {
    // Message was sent successfully - it should already be in the messages array from the API response
    console.log("Message sent successfully:", data);
  }, []);

  const handleMessageRead = useCallback(
    (data: MessageReadEvent) => {
      console.log("Message read event:", data);

      // Update message read status in current messages
      setMessagesState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === data.messageId ? { ...msg, read: true } : msg
        ),
        // Update unread count if it's our message being read
        unreadCount:
          data.readBy === user?.id ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
      }));
    },
    [user?.id]
  );

  const handleMessageUpdated = useCallback((data: MessageUpdatedEvent) => {
    console.log("Message updated event:", data);

    setMessagesState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === data.messageId ? { ...msg, ...data.message } : msg
      ),
    }));
  }, []);

  const handleMessageDeleted = useCallback((data: MessageDeletedEvent) => {
    console.log("Message deleted event:", data);

    setMessagesState((prev) => ({
      ...prev,
      messages: prev.messages.filter((msg) => msg.id !== data.messageId),
    }));
  }, []);

  // (moved below after declaring loaders)

  // Load recent conversations
  const loadRecentConversations = useCallback(async () => {
    try {
      const conversations = await MessageService.getRecentConversations();
      setMessagesState((prev) => ({ ...prev, conversations }));
    } catch (error: any) {
      console.error("Error loading conversations:", error);
    }
  }, []);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const { count } = await MessageService.getUnreadCount();
      setMessagesState((prev) => ({ ...prev, unreadCount: count }));
    } catch (error: any) {
      console.error("Error loading unread count:", error);
    }
  }, []);

  // Connect once when the authenticated user id is available; do not auto-disconnect on re-renders
  useEffect(() => {
    if (!autoConnect) return;
    if (!user?.id) return;
    if (hasConnectedRef.current) return;

    hasConnectedRef.current = true;
    initializeSocket();

    // Load initial conversations and unread count
    loadRecentConversations();
    loadUnreadCount();
  }, [autoConnect, user?.id, initializeSocket, loadRecentConversations, loadUnreadCount]);

  // Load messages for a conversation
  const loadConversation = useCallback(
    async (userId: string, params: Omit<MessageQueryParams, "conversationWith"> = {}) => {
      setMessagesState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await MessageService.getConversationWith(userId, {
          limit: initialLimit,
          ...params,
        });

        setMessagesState((prev) => ({
          ...prev,
          messages: response.messages,
          currentConversation: userId,
          pagination: {
            page: response.page,
            totalPages: response.totalPages,
            total: response.total,
            hasNextPage: response.page < response.totalPages,
          },
          loading: false,
        }));

        // Mark messages as read if they're to the current user
        const unreadMessages = response.messages.filter(
          (msg) => msg.receiverId === user?.id && !msg.read
        );

        for (const message of unreadMessages) {
          try {
            await MessageService.markAsRead(message.id);
          } catch (error) {
            console.error("Error marking message as read:", error);
          }
        }
      } catch (error: any) {
        setMessagesState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to load conversation",
        }));
      }
    },
    [initialLimit, user?.id]
  );

  // Load more messages for current conversation
  const loadMoreMessages = useCallback(async () => {
    if (
      !messagesState.currentConversation ||
      messagesState.loading ||
      !messagesState.pagination.hasNextPage
    ) {
      return;
    }

    setMessagesState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await MessageService.getConversationWith(messagesState.currentConversation, {
        page: messagesState.pagination.page + 1,
        limit: initialLimit,
      });

      setMessagesState((prev) => ({
        ...prev,
        messages: [...prev.messages, ...response.messages],
        pagination: {
          page: response.page,
          totalPages: response.totalPages,
          total: response.total,
          hasNextPage: response.page < response.totalPages,
        },
        loading: false,
      }));
    } catch (error: any) {
      setMessagesState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to load more messages",
      }));
    }
  }, [
    messagesState.currentConversation,
    messagesState.loading,
    messagesState.pagination,
    initialLimit,
  ]);

  // Send a new message
  const sendMessage = useCallback(
    async (messageData: CreateMessageRequest): Promise<Message | null> => {
      try {
        console.log("Sending message:", messageData);
        const newMessage = await MessageService.create(messageData);
        console.log("Message sent successfully:", newMessage);

        // Add to current conversation if it matches using functional update
        setMessagesState((prev) => {
          let updatedMessages = prev.messages;
          if (prev.currentConversation === messageData.receiverId) {
            updatedMessages = [newMessage, ...prev.messages];
          }
          return {
            ...prev,
            messages: updatedMessages,
          };
        });

        // Update conversations after a short delay to ensure the API has processed everything
        setTimeout(() => {
          MessageService.getRecentConversations()
            .then((conversations) => {
              setMessagesState((prev) => ({ ...prev, conversations }));
            })
            .catch((error) => {
              console.error("Error updating conversations after send:", error);
            });
        }, 200);

        return newMessage;
      } catch (error: any) {
        console.error("Error sending message:", error);
        setMessagesState((prev) => ({
          ...prev,
          error: error.message || "Failed to send message",
        }));
        return null;
      }
    },
    []
  );

  // Update a message
  const updateMessage = useCallback(
    async (id: string, updateData: UpdateMessageRequest): Promise<Message | null> => {
      try {
        const updatedMessage = await MessageService.update(id, updateData);

        setMessagesState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) => (msg.id === id ? updatedMessage : msg)),
        }));

        return updatedMessage;
      } catch (error: any) {
        setMessagesState((prev) => ({
          ...prev,
          error: error.message || "Failed to update message",
        }));
        return null;
      }
    },
    []
  );

  // Delete a message
  const deleteMessage = useCallback(async (id: string): Promise<boolean> => {
    try {
      await MessageService.delete(id);

      setMessagesState((prev) => ({
        ...prev,
        messages: prev.messages.filter((msg) => msg.id !== id),
      }));

      return true;
    } catch (error: any) {
      setMessagesState((prev) => ({
        ...prev,
        error: error.message || "Failed to delete message",
      }));
      return false;
    }
  }, []);

  // Keep event callbacks fresh without tearing down the connection
  useEffect(() => {
    if (!socketService.isConnected()) return;
    socketService.updateCallbacks({
      onNewMessage: handleNewMessage,
      onMessageSent: handleMessageSent,
      onMessageRead: handleMessageRead,
      onMessageUpdated: handleMessageUpdated,
      onMessageDeleted: handleMessageDeleted,
    });
  }, [
    handleNewMessage,
    handleMessageSent,
    handleMessageRead,
    handleMessageUpdated,
    handleMessageDeleted,
  ]);

  // Clear error
  const clearError = useCallback(() => {
    setMessagesState((prev) => ({ ...prev, error: null }));
  }, []);

  // Clear current conversation
  const clearConversation = useCallback(() => {
    setMessagesState((prev) => ({
      ...prev,
      messages: [],
      currentConversation: null,
      pagination: {
        page: 1,
        totalPages: 1,
        total: 0,
        hasNextPage: false,
      },
    }));
  }, []);

  // Connect to socket manually
  const connectSocket = useCallback(() => {
    if (!socketService.isConnected()) {
      initializeSocket();
    }
  }, [initializeSocket]);

  // Disconnect from socket manually
  const disconnectSocket = useCallback(() => {
    socketService.disconnect();
    setMessagesState((prev) => ({ ...prev, socketConnected: false }));
  }, []);

  return {
    // State
    messages: messagesState.messages,
    conversations: messagesState.conversations,
    currentConversation: messagesState.currentConversation,
    loading: messagesState.loading,
    error: messagesState.error,
    pagination: messagesState.pagination,
    unreadCount: messagesState.unreadCount,
    socketConnected: messagesState.socketConnected,

    // Actions
    loadConversation,
    loadMoreMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    clearError,
    clearConversation,
    loadRecentConversations,
    loadUnreadCount,

    // Socket controls
    connectSocket,
    disconnectSocket,
  };
};
