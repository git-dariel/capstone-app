import React, { useState, useEffect } from "react";
import { ConversationList, MessageThread, ComposeMessageModal } from "@/components/molecules";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui";
import { MessageSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateMessageRequest } from "@/types/message";

export const MessagesContent: React.FC = () => {
  const { user } = useAuth();
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  const {
    messages,
    conversations,
    currentConversation,
    loading,
    error,
    pagination,
    unreadCount,
    socketConnected,
    loadConversation,
    loadMoreMessages,
    sendMessage,
    clearError,
    loadRecentConversations,
  } = useMessages();

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadRecentConversations();
  }, [loadRecentConversations]);

  const handleConversationSelect = (userId: string) => {
    setSelectedConversationId(userId);
    loadConversation(userId);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId || !user) return;

    // Create simple message for chat interface
    const messageRequest: CreateMessageRequest = {
      title: "Chat Message", // Simple title for chat messages
      content,
      receiverId: selectedConversationId,
    };

    const sentMessage = await sendMessage(messageRequest);
    if (sentMessage) {
      // Message was sent successfully
      loadRecentConversations(); // Refresh conversations
    }
  };

  const handleComposeMessage = async (messageData: CreateMessageRequest) => {
    const sentMessage = await sendMessage(messageData);
    if (sentMessage) {
      // Open conversation with the recipient
      setSelectedConversationId(messageData.receiverId);
      loadConversation(messageData.receiverId);
      loadRecentConversations();
    }
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  const handleLoadMoreMessages = () => {
    if (pagination.hasNextPage && !loading) {
      loadMoreMessages();
    }
  };

  // Mobile: show conversation or list
  const showConversationView = selectedConversationId && currentConversation;
  const showListView = !selectedConversationId || !isMobileView;

  return (
    <div className="h-full flex flex-col bg-gray-50 lg:bg-white">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 mx-2 sm:mx-0 mt-2 sm:mt-0 rounded-r-lg sm:rounded-none">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex-shrink-0">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
            <div className="w-full sm:w-auto sm:ml-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-700 hover:bg-red-100 w-full sm:w-auto text-xs sm:text-sm"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Conversations List - Desktop: always visible, Mobile: hidden when conversation is selected */}
        {showListView && (
          <div
            className={cn(
              "w-full lg:w-80 lg:flex-shrink-0 bg-white lg:bg-transparent",
              isMobileView && showConversationView && "hidden",
              "border-r border-gray-200 lg:border-r-0"
            )}
          >
            <ConversationList
              conversations={conversations}
              activeConversationId={selectedConversationId || undefined}
              onConversationSelect={handleConversationSelect}
              onComposeNew={() => setShowComposeModal(true)}
              loading={loading}
            />
          </div>
        )}

        {/* Message Thread - Desktop: visible when conversation selected, Mobile: replaces list */}
        {showConversationView ? (
          <div
            className={cn(
              "flex-1 bg-white",
              isMobileView ? "w-full absolute inset-0 z-10" : "border-l border-gray-200"
            )}
          >
            <MessageThread
              messages={messages}
              onSendMessage={handleSendMessage}
              onLoadMore={handleLoadMoreMessages}
              onBack={isMobileView ? handleBackToList : undefined}
              hasMoreMessages={pagination.hasNextPage}
              loading={loading}
            />
          </div>
        ) : (
          // Welcome screen when no conversation is selected (desktop only)
          !isMobileView && (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center p-6 sm:p-8 max-w-md mx-auto">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Messages
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Select a conversation from the sidebar to start messaging, or compose a new
                  message.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setShowComposeModal(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Compose Message
                  </Button>
                </div>

                {/* Stats */}
                <div className="mt-6 sm:mt-8 flex justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-gray-500">
                  <div className="text-center">
                    <div className="font-semibold text-base sm:text-lg text-gray-900">
                      {conversations.length}
                    </div>
                    <div className="mt-1">Conversations</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-base sm:text-lg text-gray-900">
                      {unreadCount}
                    </div>
                    <div className="mt-1">Unread</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={cn(
                        "font-semibold text-base sm:text-lg",
                        socketConnected ? "text-green-600" : "text-yellow-600"
                      )}
                    >
                      {socketConnected ? "Connected" : "Offline"}
                    </div>
                    <div className="mt-1">Status</div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Compose Message Modal */}
      <ComposeMessageModal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        onSend={handleComposeMessage}
      />
    </div>
  );
};
