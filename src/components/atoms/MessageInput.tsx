import React, { useState } from "react";
import { Button } from "@/components/ui";
import { Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "Type a message...",
  className,
}) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled || isLoading) return;

    const messageContent = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      await onSend(messageContent);
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore message on error
      setMessage(messageContent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      {/* Message input */}
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className={cn(
            "w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
            "disabled:bg-gray-50 disabled:text-gray-400",
            "placeholder:text-gray-400",
            "max-h-32 min-h-[48px]"
          )}
          style={{
            height: "auto",
            minHeight: "48px",
            maxHeight: "128px",
            overflowY: "auto",
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
          }}
        />

        {/* Attachment button (placeholder for future implementation) */}
        <button
          type="button"
          disabled={disabled || isLoading}
          className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2",
            "p-1 rounded-full hover:bg-gray-100 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          title="Attach file (coming soon)"
        >
          <Paperclip className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Send button */}
      <Button
        type="submit"
        disabled={!message.trim() || disabled || isLoading}
        size="sm"
        className={cn(
          "px-4 py-3 rounded-2xl flex-shrink-0",
          "bg-primary-600 hover:bg-primary-700 text-white",
          "disabled:bg-gray-300 disabled:cursor-not-allowed",
          "transition-all duration-200"
        )}
      >
        <Send className="w-5 h-5" />
      </Button>
    </form>
  );
};
