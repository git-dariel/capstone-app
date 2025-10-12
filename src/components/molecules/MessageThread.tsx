import { MessageBubble, MessageInput, Avatar } from "@/components/atoms";
import { VideoCallButton } from "@/components/molecules";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import { ArrowLeft, MessageCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface MessageThreadProps {
  messages: Message[];
  currentUserId?: string;
  currentUserName?: string;
  onSendMessage: (content: string) => void | Promise<void>;
  onLoadMore?: () => void;
  onBack?: () => void;
  hasMoreMessages?: boolean;
  loading?: boolean;
  className?: string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserId,
  currentUserName,
  onSendMessage,
  onLoadMore,
  onBack,
  hasMoreMessages = false,
  loading = false,
  className,
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const currentUser = user?.id || currentUserId;
  const conversationPartner =
    messages.length > 0
      ? messages.find((msg) => msg.senderId !== currentUser)?.sender ||
        messages.find((msg) => msg.receiverId !== currentUser)?.receiver
      : null;

  const partnerName = conversationPartner
    ? `${conversationPartner.person.firstName} ${conversationPartner.person.lastName}`
    : currentUserName || "Unknown User";
    
  const partnerAvatar = conversationPartner?.avatar;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle scroll to load more messages
  const handleScroll = () => {
    if (!messagesContainerRef.current || !hasMoreMessages || loading) return;

    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop === 0) {
      onLoadMore?.();
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      await onSendMessage(content);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCallInitiated = async (meetLink: string) => {
    // Send the meet link as a message
    const callMessage = `📹 Video call started: ${meetLink}\n\nClick the link to join the call!`;
    await handleSendMessage(callMessage);
  };

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="lg:hidden p-2 touch-manipulation flex-shrink-0"
              title="Back to conversations"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}

          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Avatar 
              src={partnerAvatar} 
              fallback={partnerName.charAt(0)} 
              className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {partnerName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <VideoCallButton
            recipientName={partnerName}
            onCallInitiated={handleCallInitiated}
            className="touch-manipulation"
          />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4"
        onScroll={handleScroll}
      >
        {/* Load more indicator */}
        {hasMoreMessages && (
          <div className="flex justify-center py-2 sm:py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              loading={loading}
              loadingText="Loading..."
              className="text-primary-600 border-primary-200 hover:bg-primary-50 text-xs sm:text-sm py-2 px-3 sm:px-4 touch-manipulation"
            >
              Load older messages
            </Button>
          </div>
        )}

        {/* Message list */}
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2 text-sm sm:text-base">No messages yet</p>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Start the conversation by sending a message!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages
              .slice()
              .reverse() // Display messages in chronological order (oldest first)
              .map((message) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  timestamp={message.createdAt}
                  isOwnMessage={message.senderId === currentUser}
                  senderName={
                    message.senderId === currentUser
                      ? user?.person?.firstName || "You"
                      : `${message.sender?.person.firstName} ${message.sender?.person.lastName}`
                  }
                  senderAvatar={
                    message.senderId === currentUser
                      ? user?.avatar
                      : message.sender?.avatar
                  }
                  read={message.read}
                />
              ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 p-2 sm:p-4 bg-white space-y-3">
        {/* Video call section */}
        {showVideoCall && (
          <VideoCallButton
            recipientName={partnerName}
            onCallInitiated={handleCallInitiated}
            className="w-full"
          />
        )}
        
        <div className="flex gap-2">
          <div className="flex-1">
            <MessageInput onSend={handleSendMessage} placeholder={`Message ${partnerName}...`} />
          </div>
          {!showVideoCall && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVideoCall(true)}
              className="px-3 py-2 flex-shrink-0"
              title="Start video call"
            >
              📹
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
