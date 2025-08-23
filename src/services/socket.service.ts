import { io, Socket } from "socket.io-client";
import { API_CONFIG, TokenManager } from "./api.config";
import type {
  SocketMessage,
  MessageReadEvent,
  MessageUpdatedEvent,
  MessageDeletedEvent,
  MessageSentEvent,
} from "@/types/message";

export interface SocketEventCallbacks {
  onNewMessage?: (data: SocketMessage) => void;
  onMessageSent?: (data: MessageSentEvent) => void;
  onMessageRead?: (data: MessageReadEvent) => void;
  onMessageUpdated?: (data: MessageUpdatedEvent) => void;
  onMessageDeleted?: (data: MessageDeletedEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private callbacks: SocketEventCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private pingInterval: NodeJS.Timeout | null = null;

  // Get socket URL from API config
  private getSocketUrl(): string {
    const baseUrl = API_CONFIG.baseURL;
    // Remove /api suffix if present
    const socketUrl = baseUrl.replace(/\/api$/, "");
    return socketUrl;
  }

  // Initialize socket connection
  connect(callbacks: SocketEventCallbacks = {}): void {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    this.callbacks = callbacks;
    const user = TokenManager.getUser();

    if (!user) {
      console.warn("No authenticated user found, cannot connect to socket");
      return;
    }

    try {
      const socketUrl = this.getSocketUrl();
      console.log("Connecting to socket:", socketUrl);

      this.socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error("Error creating socket connection:", error);
      this.callbacks.onError?.(error);
    }
  }

  // Setup socket event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);

      // Join user room immediately after connection
      const user = TokenManager.getUser();
      if (user?.id) {
        console.log("Joining user room:", `user_${user.id}`);
        this.socket?.emit("join_user_room", user.id);
      }

      this.reconnectAttempts = 0;
      this.callbacks.onConnect?.();

      // Start ping interval to keep connection alive
      this.startPingInterval();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.stopPingInterval();
      this.callbacks.onDisconnect?.();
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        this.disconnect();
      }

      this.callbacks.onError?.(error);
    });

    // Room joined confirmation
    this.socket.on("room_joined", (data: { room: string; userId: string }) => {
      console.log("Successfully joined room:", data.room, "for user:", data.userId);
    });

    // Keep alive
    this.socket.on("pong", () => {
      console.log("Pong received - connection alive");
    });

    // Message events
    this.socket.on("new_message", (data: SocketMessage) => {
      console.log("Received new message:", data);
      this.callbacks.onNewMessage?.(data);
    });

    this.socket.on("message_sent", (data: MessageSentEvent) => {
      console.log("Message sent confirmation:", data);
      this.callbacks.onMessageSent?.(data);
    });

    this.socket.on("message_read", (data: MessageReadEvent) => {
      console.log("Message read:", data);
      this.callbacks.onMessageRead?.(data);
    });

    this.socket.on("message_updated", (data: MessageUpdatedEvent) => {
      console.log("Message updated:", data);
      this.callbacks.onMessageUpdated?.(data);
    });

    this.socket.on("message_deleted", (data: MessageDeletedEvent) => {
      console.log("Message deleted:", data);
      this.callbacks.onMessageDeleted?.(data);
    });

    // Generic error handler
    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      this.callbacks.onError?.(error);
    });
  }

  // Disconnect from socket
  disconnect(): void {
    if (this.socket) {
      console.log("Disconnecting socket...");
      this.stopPingInterval();
      this.socket.disconnect();
      this.socket = null;
      this.callbacks = {};
      this.reconnectAttempts = 0;
    }
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Join a specific room (for targeted messaging)
  joinRoom(roomId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("join_room", roomId);
      console.log("Joined room:", roomId);
    } else {
      console.warn("Socket not connected, cannot join room");
    }
  }

  // Leave a specific room
  leaveRoom(roomId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("leave_room", roomId);
      console.log("Left room:", roomId);
    } else {
      console.warn("Socket not connected, cannot leave room");
    }
  }

  // Update callbacks
  updateCallbacks(newCallbacks: Partial<SocketEventCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...newCallbacks };
  }

  // Get current socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }

  // Emit custom event
  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Socket not connected, cannot emit event");
    }
  }

  // Manual reconnection attempt
  reconnect(): void {
    if (this.socket && !this.socket.connected) {
      console.log("Attempting manual reconnection...");
      this.socket.connect();
    }
  }

  // Start ping interval to keep connection alive
  private startPingInterval(): void {
    this.stopPingInterval(); // Clear any existing interval

    this.pingInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit("ping");
      }
    }, 30000); // Ping every 30 seconds
  }

  // Stop ping interval
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();

// Export class for testing or multiple instances if needed
export { SocketService };
