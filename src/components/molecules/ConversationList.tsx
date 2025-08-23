import React from "react";
import { ConversationItem } from "@/components/atoms";
import { Button } from "@/components/ui";
import { Plus, MessageCircle, Search } from "lucide-react";
import type { ConversationUser } from "@/types/message";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: ConversationUser[];
  activeConversationId?: string;
  onConversationSelect: (userId: string) => void;
  onComposeNew: () => void;
  onSearch?: (query: string) => void;
  loading?: boolean;
  className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onConversationSelect,
  onComposeNew,
  onSearch,
  loading = false,
  className,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const filteredConversations = conversations.filter((conversation) =>
    searchQuery
      ? `${conversation.person.firstName} ${conversation.person.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        conversation.userName.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-gray-200", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary-600" />
            Messages
          </h2>
          <Button
            onClick={onComposeNew}
            size="sm"
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2"
            title="Compose new message"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Start a conversation by composing a new message"}
            </p>
            {!searchQuery && (
              <Button
                onClick={onComposeNew}
                size="sm"
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Compose Message
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                userId={conversation.id}
                name={`${conversation.person.firstName} ${conversation.person.lastName}`}
                lastMessage={conversation.lastMessage?.content}
                timestamp={conversation.lastMessage?.createdAt}
                unreadCount={conversation.unreadCount}
                isActive={activeConversationId === conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className="mb-2"
              />
            ))}
          </div>
        )}
      </div>

      {/* Connection status indicator */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          Real-time messaging enabled
        </div>
      </div>
    </div>
  );
};
