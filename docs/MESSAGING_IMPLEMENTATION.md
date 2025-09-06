# Messaging System Implementation

This document describes the messaging system implementation in the capstone app, including real-time socket.io integration.

## Architecture Overview

The messaging system follows the Atomic Design pattern and includes:

### 🎯 **Core Features**

- Real-time messaging with Socket.io
- Message composition and sending
- Conversation management
- Message read status
- Unread message count
- Mobile-responsive design
- Security measures (authentication, input validation)

### 🔧 **Technical Stack**

- **Frontend**: React + TypeScript + Tailwind CSS
- **Real-time**: Socket.io client
- **State Management**: React hooks (useMessages)
- **Architecture**: Atomic Design (atoms → molecules → organisms → pages)

## Components Structure

### 🧩 **Atom Level Components**

#### `MessageBubble.tsx`

- Individual message display
- Shows sender, content, timestamp
- Read/unread status indicators
- Responsive design for mobile/desktop

#### `ConversationItem.tsx`

- Conversation list item
- Shows user avatar, name, last message
- Unread message count badge
- Active conversation highlighting

#### `MessageInput.tsx`

- Message composition input
- Auto-expanding textarea
- Send button with loading states
- Keyboard shortcuts (Enter to send)

#### `NotificationIcon.tsx`

- Generic notification icon component
- Badge with count display
- Configurable for different notification types

### 🧩 **Molecule Level Components**

#### `ConversationList.tsx`

- List of all conversations
- Search functionality
- "Compose New" button
- Loading and empty states

#### `MessageThread.tsx`

- Main conversation view
- Message history display
- Message input integration
- Load more messages functionality
- Mobile navigation (back button)

#### `ComposeMessageModal.tsx`

- New message composition
- Recipient selection
- Subject and content fields
- Form validation

### 🏗️ **Organism Level Components**

#### `MessagesContent.tsx`

- Main messaging interface
- Manages conversation/thread switching
- Handles mobile responsive layout
- Error handling and connection status
- Socket integration

### 📄 **Page Level**

#### `MessagesPage.tsx`

- Full page wrapper
- Uses MainLayout
- Route: `/messages`

## Hooks and Services

### 📦 **useMessages Hook**

```typescript
const {
  messages, // Current conversation messages
  conversations, // List of conversations
  unreadCount, // Total unread count
  socketConnected, // Socket connection status
  loadConversation, // Load specific conversation
  sendMessage, // Send new message
  // ... more methods
} = useMessages();
```

**Key Features**:

- Automatic socket connection management
- Real-time message updates
- Pagination support
- Error handling
- Optimistic updates

### 📦 **MessageService**

```typescript
// Get conversations
await MessageService.getAll({ conversationWith: userId });

// Send message
await MessageService.create({
  title: "Message Subject",
  content: "Message content",
  receiverId: "user-id",
});

// Mark as read
await MessageService.markAsRead(messageId);
```

### 📦 **SocketService**

```typescript
// Connect to real-time messaging
socketService.connect({
  onNewMessage: (data) => {
    /* handle new message */
  },
  onMessageRead: (data) => {
    /* handle read status */
  },
  onConnect: () => {
    /* connection established */
  },
});
```

**Socket Events**:

- `new_message` - Incoming message
- `message_sent` - Message sent confirmation
- `message_read` - Read status update
- `message_updated` - Message edited
- `message_deleted` - Message deleted

## Usage Guide

### 1. **Navigation**

- Access via sidebar: "Messages"
- Or top navigation message icon
- Route: `/messages`

### 2. **Sending Messages**

- Click "Compose Message" button
- Fill in recipient, subject, content
- Click "Send Message"

### 3. **Reading Messages**

- Click conversation from sidebar
- Messages auto-mark as read when opened
- Real-time updates appear instantly

### 4. **Mobile Experience**

- Responsive design switches between list/conversation view
- Touch-friendly interface
- Back navigation for conversations

## Security Features

### 🔒 **Authentication**

- Requires user authentication
- JWT token validation
- User context verification

### 🔒 **Input Validation**

- Message content sanitization
- Required field validation
- Recipient ID verification
- Prevents self-messaging

### 🔒 **API Security**

- Authorization headers
- User-scoped queries
- Soft delete for messages
- Rate limiting ready

## API Integration

### **Backend Requirements**

The frontend expects these API endpoints from your backend:

```typescript
GET    /api/messages                    // Get messages list
GET    /api/messages/:id               // Get specific message
POST   /api/messages                   // Create new message
PATCH  /api/messages/:id              // Update message
DELETE /api/messages/:id              // Delete message (soft)
```

### **Socket.io Events**

Backend should emit these events:

- `new_message` - When message received
- `message_read` - When message marked as read
- `message_updated` - When message edited
- `message_deleted` - When message deleted

## Customization

### **Styling**

- Uses Tailwind CSS classes
- Primary color: `primary-600`
- Consistent with app design system
- Easily customizable via CSS variables

### **Configuration**

```typescript
// Customize message hook behavior
const messages = useMessages({
  autoConnect: true, // Auto-connect socket
  initialLimit: 20, // Messages per page
});
```

## Future Enhancements

### 🚀 **Planned Features**

- File attachments
- Message search
- Message forwarding
- Group messaging
- Voice/video calls
- Message reactions
- Typing indicators
- Message encryption

### 🚀 **Performance Optimizations**

- Virtual scrolling for large message lists
- Message caching
- Optimistic UI updates
- Connection retry logic
- Lazy loading conversations

## Troubleshooting

### **Common Issues**

1. **Socket Connection Failed**

   - Check network connectivity
   - Verify backend socket server is running
   - Check authentication token validity

2. **Messages Not Loading**

   - Verify API endpoints are accessible
   - Check user authentication
   - Review browser console for errors

3. **Real-time Updates Not Working**
   - Ensure socket.io server is running
   - Check browser console for socket errors
   - Verify user is properly authenticated

### **Debug Mode**

Enable debug logging:

```typescript
// In browser console
localStorage.setItem("debug", "socket.io-client:*");
```

---

The messaging system is now fully integrated into your capstone application with modern real-time capabilities and a responsive design that follows your existing architecture patterns.
