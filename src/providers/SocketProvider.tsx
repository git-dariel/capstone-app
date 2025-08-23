import React, { createContext, useState } from "react";
import { socketService } from "@/services";

interface SocketContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
});

export { SocketContext };

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    socketService.connect({
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
      onError: (error) => {
        console.error("Socket error:", error);
        setIsConnected(false);
      },
    });
  };

  const disconnect = () => {
    socketService.disconnect();
    setIsConnected(false);
  };

  const value = {
    isConnected,
    connect,
    disconnect,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
