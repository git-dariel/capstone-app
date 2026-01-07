import React, { useState, useEffect } from "react";
import { Modal } from "@/components/atoms";
import { Button } from "@/components/ui";
import { Send, Search, X, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks";
import type { CreateMessageRequest } from "@/types/message";
import { UserService, type User } from "@/services/user.service";

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: CreateMessageRequest) => Promise<void>;
  recipientId?: string;
  recipientName?: string;
}

interface SearchableUser {
  id: string;
  name: string;
  email?: string;
  studentNumber?: string;
  type: "student" | "counselor";
}

// Validation constants
const CHAR_LIMITS = {
  content: 2000,
};

// Helper function to validate special characters
const validateSpecialCharacters = (value: string): boolean => {
  const allowedPattern = /^[a-zA-Z0-9\s.,;:!?\-'"()[\]/\n\r\u00C0-\u017F]*$/;
  return allowedPattern.test(value);
};

// Helper function to sanitize input
const sanitizeInput = (value: string): string => {
  return value.replace(/[<>&]/g, "");
};

// Helper function to get remaining characters
const getRemainingChars = (value: string, limit: number): number => {
  return Math.max(0, limit - value.length);
};

export const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({
  isOpen,
  onClose,
  onSend,
  recipientId,
  recipientName,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    receiverId: recipientId || "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchableUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRecipient, setSelectedRecipient] =
    useState<SearchableUser | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    receiverId?: string;
    content?: string;
  }>({});
  const [guidanceCounselors, setGuidanceCounselors] = useState<
    SearchableUser[]
  >([]);
  const [isLoadingCounselors, setIsLoadingCounselors] = useState(false);

  // Fetch guidance counselors when modal opens (for students)
  useEffect(() => {
    const fetchGuidanceCounselors = async () => {
      if (
        user?.type === "student" &&
        isOpen &&
        guidanceCounselors.length === 0
      ) {
        setIsLoadingCounselors(true);
        try {
          const counselors = await UserService.getAllUsers({
            type: "guidance",
            limit: 100, // Get all guidance counselors
          });

          const mappedCounselors: SearchableUser[] = counselors.map(
            (counselor: User) => ({
              id: counselor.id,
              name: `${counselor.person.firstName} ${counselor.person.lastName}`,
              email: counselor.person.email,
              type: "counselor" as const,
            }),
          );

          setGuidanceCounselors(mappedCounselors);

          // Auto-select first counselor if no recipient is specified
          if (!recipientId && mappedCounselors.length > 0) {
            const firstCounselor = mappedCounselors[0];
            setFormData((prev) => ({
              ...prev,
              receiverId: firstCounselor.id,
            }));
            setSelectedRecipient(firstCounselor);
          }
        } catch (error) {
          console.error("Error fetching guidance counselors:", error);
        } finally {
          setIsLoadingCounselors(false);
        }
      }
    };

    fetchGuidanceCounselors();
  }, [user, isOpen, recipientId, guidanceCounselors.length]);

  // Auto-set recipient based on user type
  useEffect(() => {
    if (recipientId && recipientName) {
      // Use provided recipient ID
      setFormData((prev) => ({
        ...prev,
        receiverId: recipientId,
      }));
      setSelectedRecipient({
        id: recipientId,
        name: recipientName,
        type: "student", // Assume student for now
      });
    }
  }, [recipientId, recipientName]);

  // Search for users/students
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Search for users based on user type
        const searchType = user?.type === "student" ? "guidance" : "student";
        const usersResponse = await UserService.getAllUsers({
          limit: 10,
          type: searchType,
          query: searchQuery,
        });

        const users = usersResponse || [];
        const mappedUsers: SearchableUser[] = users.map((searchUser: User) => ({
          id: searchUser.id,
          name: `${searchUser.person.firstName} ${searchUser.person.lastName}`,
          email: searchUser.person.email,
          studentNumber: undefined, // User API doesn't have studentNumber directly
          type:
            searchType === "student"
              ? ("student" as const)
              : ("counselor" as const),
        }));

        setSearchResults(mappedUsers);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, user?.type]);

  const handleSelectRecipient = (recipient: SearchableUser) => {
    setSelectedRecipient(recipient);
    setFormData((prev) => ({
      ...prev,
      receiverId: recipient.id,
    }));
    setSearchQuery("");
    setShowDropdown(false);
    setValidationErrors((prev) => ({ ...prev, receiverId: undefined }));
  };

  const handleRemoveRecipient = () => {
    setSelectedRecipient(null);
    setFormData((prev) => ({
      ...prev,
      receiverId: "",
    }));
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors: { receiverId?: string; content?: string } = {};

    // Validate receiver
    if (!formData.receiverId.trim()) {
      errors.receiverId = "Please select a recipient";
    }

    // Validate content
    if (!formData.content.trim()) {
      errors.content = "Message content is required";
    } else if (formData.content.length > CHAR_LIMITS.content) {
      errors.content = `Message must be ${CHAR_LIMITS.content} characters or less`;
    } else if (!validateSpecialCharacters(formData.content)) {
      errors.content = "Message contains invalid characters";
    }

    // If there are validation errors, set them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clear validation errors
    setValidationErrors({});

    setIsSubmitting(true);
    try {
      await onSend({
        title: "Message", // Default title since it's optional but might be required by API
        content: sanitizeInput(formData.content.trim()),
        receiverId: formData.receiverId,
      });

      // Reset form and close modal
      setFormData({
        receiverId: recipientId || "",
        content: "",
      });
      setSelectedRecipient(
        recipientId && recipientName
          ? { id: recipientId, name: recipientName, type: "student" }
          : null,
      );
      setSearchQuery("");
      setValidationErrors({});
      onClose();
    } catch (error) {
      console.error("Error sending message:", error);
      setValidationErrors({
        content: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        receiverId: recipientId || "",
        content: "",
      });
      setSelectedRecipient(
        recipientId && recipientName
          ? { id: recipientId, name: recipientName, type: "student" }
          : user?.type === "student" && guidanceCounselors.length > 0
            ? guidanceCounselors[0]
            : null,
      );
      setSearchQuery("");
      setShowDropdown(false);
      setValidationErrors({});
      onClose();
    }
  };

  const isFormValid = formData.content.trim() && formData.receiverId;

  const getModalTitle = () => {
    return selectedRecipient
      ? `Send Message to ${selectedRecipient.name}`
      : "Compose Message";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getModalTitle()}
      size="lg"
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient (only show if not a student and no pre-filled recipient) */}
        {user?.type !== "student" && !recipientId && (
          <div className="space-y-2">
            <label
              htmlFor="receiverId"
              className="block text-sm font-medium text-gray-700"
            >
              To <span className="text-red-500">*</span>
            </label>

            {/* Selected Recipient Display */}
            {selectedRecipient ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRecipient.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedRecipient.studentNumber && (
                      <span className="text-xs text-blue-600">
                        ID: {selectedRecipient.studentNumber}
                      </span>
                    )}
                    {selectedRecipient.email && (
                      <span className="text-xs text-gray-500">
                        {selectedRecipient.email}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveRecipient}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove recipient"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowDropdown(true)}
                    placeholder="Search by name, student number, or email..."
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      validationErrors.receiverId
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50`}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => handleSelectRecipient(result)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {result.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {result.studentNumber && (
                            <span className="text-xs text-blue-600">
                              ID: {result.studentNumber}
                            </span>
                          )}
                          {result.email && (
                            <span className="text-xs text-gray-500">
                              {result.email}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results Message */}
                {showDropdown &&
                  !isSearching &&
                  searchQuery.length >= 2 &&
                  searchResults.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                      <p className="text-sm text-gray-500 text-center">
                        No students found matching "{searchQuery}"
                      </p>
                    </div>
                  )}
              </div>
            )}

            {validationErrors.receiverId && (
              <p className="text-xs text-red-600 flex items-center mt-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                {validationErrors.receiverId}
              </p>
            )}

            {!selectedRecipient && (
              <p className="text-xs text-gray-500 mt-1">
                Type at least 2 characters to search for students
              </p>
            )}
          </div>
        )}

        {/* Show recipient info for students or when recipient is pre-selected */}
        {(user?.type === "student" || recipientId) && selectedRecipient && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium text-blue-900">Sending to: </span>
                <span className="text-blue-700">{selectedRecipient.name}</span>
                {selectedRecipient.email && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({selectedRecipient.email})
                  </span>
                )}
              </div>
              {isLoadingCounselors && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        )}

        {/* Message content */}
        <div className="space-y-2">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, content: e.target.value }));
              setValidationErrors((prev) => ({ ...prev, content: undefined }));
            }}
            placeholder="Type your message here..."
            disabled={isSubmitting}
            rows={6}
            maxLength={CHAR_LIMITS.content}
            className={`w-full px-3 py-2 border ${
              validationErrors.content ? "border-red-300" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 resize-none`}
            required
          />
          <div className="flex justify-between items-center">
            {validationErrors.content && (
              <p className="text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {validationErrors.content}
              </p>
            )}
            <p
              className={`text-xs ${
                formData.content.length > CHAR_LIMITS.content * 0.9
                  ? "text-red-600 font-medium"
                  : "text-gray-500"
              } ml-auto`}
            >
              {getRemainingChars(formData.content, CHAR_LIMITS.content)}{" "}
              characters remaining
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </div>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
