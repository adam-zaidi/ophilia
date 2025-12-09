import { useState, useEffect } from 'react';
import { useMessages, Conversation } from '../hooks/useMessages';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// Helper to format timestamp
const formatTimestamp = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit' 
  });
};

interface DirectMessagesProps {
  isAuthenticated: boolean;
  onLoginRequired: () => void;
  onUnreadChange?: (hasUnread: boolean) => void;
  openConversationWith?: string | null;
  onConversationClosed?: () => void;
  respondingToPost?: { author: string; content: string; catalogNumber: string } | null;
}

export function DirectMessages({ isAuthenticated, onLoginRequired, onUnreadChange, openConversationWith, onConversationClosed, respondingToPost }: DirectMessagesProps) {
  const { conversations, loading, getOrCreateConversation, sendMessage, markConversationAsRead, refetch } = useMessages();
  const { user, profile } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  
  // Open conversation when openConversationWith changes
  useEffect(() => {
    if (openConversationWith && !loading) {
      const conversation = conversations.find(c => c.participant === openConversationWith);
      if (conversation) {
        setSelectedConversation(conversation);
        // Mark as read when opening
        if (conversation.unread) {
          markConversationAsRead(conversation.id);
        }
      } else if (user && profile) {
        // Create a new conversation if it doesn't exist
        findUserAndCreateConversation(openConversationWith);
      }
    } else if (!openConversationWith && !selectedConversation) {
      // Only clear if we don't have a selected conversation
      // This prevents clearing when we're just refetching
      setSelectedConversation(null);
    }
  }, [openConversationWith, conversations, loading, user?.id]);

  // Keep selected conversation updated when conversations refetch (e.g., after sending a message)
  useEffect(() => {
    if (selectedConversation && conversations.length > 0) {
      const updatedConv = conversations.find(c => c.id === selectedConversation.id);
      if (updatedConv) {
        // Always update to get the latest unread status
        setSelectedConversation(updatedConv);
      } else {
        // If conversation not found, it might have been deleted or there's an issue
        // Don't clear it automatically - let user navigate away manually
      }
    }
  }, [conversations, selectedConversation?.id]);

  // Calculate unread count and notify parent
  const hasUnread = conversations.some(c => c.unread);
  
  useEffect(() => {
    if (onUnreadChange) {
      onUnreadChange(hasUnread);
    }
  }, [hasUnread, onUnreadChange]);

  // Function to find user and create conversation
  const findUserAndCreateConversation = async (usernameToFind: string) => {
    if (!user || !profile) {
      onLoginRequired();
      return;
    }
    if (usernameToFind === profile.username) {
      // Cannot message self
      console.warn("Cannot open conversation with self.");
      return;
    }

    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('username', usernameToFind)
      .single();

    if (profileError || !targetProfile) {
      console.error('Error finding user or user not found:', profileError?.message);
      return;
    }

    try {
      await getOrCreateConversation(targetProfile.user_id);
      // Refetch conversations to get the new one
      await refetch();
      // The useEffect will automatically pick up the new conversation when conversations state updates
    } catch (err) {
      console.error('Error creating conversation:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16 border border-dashed border-[var(--color-faded-ink)] bg-[var(--color-overlay)] p-2">
        <p className="text-xs text-[var(--color-faded-ink)] italic mb-2">
          You must be logged in to view direct messages.
        </p>
        <button
          onClick={onLoginRequired}
          className="text-xs text-[var(--color-ink)] hover:underline"
        >
          login
        </button>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || sending) return;
    
    setSending(true);
    const conversationId = selectedConversation.id;
    const messageContent = messageText.trim();
    setMessageText(''); // Clear input immediately for better UX
    
    try {
      // Optimistically add the message to the UI
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user?.id || '',
        content: messageContent,
        created_at: new Date().toISOString(),
        read: false,
        from: 'You',
      };
      
      const optimisticConversation = {
        ...selectedConversation,
        messages: [...selectedConversation.messages, optimisticMessage],
      };
      setSelectedConversation(optimisticConversation);
      
      // Send the message
      await sendMessage(conversationId, messageContent);
      
      // Refetch to get the real message with proper ID and timestamp
      await refetch();
      
      // The useEffect will update the conversation with the real data
    } catch (error) {
      console.error('Error sending message:', error);
      // Revert optimistic update on error
      setSelectedConversation(selectedConversation);
      setMessageText(messageContent); // Restore message text
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-xs text-[var(--color-faded-ink)] italic">Loading messages...</p>
      </div>
    );
  }

  if (selectedConversation) {
    // Check if this is a new conversation started from a post response
    const isNewConversationFromPost = respondingToPost && 
      respondingToPost.author === selectedConversation.participant && 
      selectedConversation.messages.length === 0;

    return (
      <div className="flex flex-col h-[calc(100vh-200px)]">
        {/* Conversation header */}
        <div className="mb-2 bg-[var(--color-aged-paper)] border border-[var(--color-ink)] p-1.5 flex items-center justify-between">
          <div>
            <button
              onClick={() => {
                setSelectedConversation(null);
                if (onConversationClosed) {
                  onConversationClosed();
                }
              }}
              className="text-xs text-[var(--color-faded-ink)] hover:text-[var(--color-ink)] hover:underline mr-2"
            >
              ← back
            </button>
            <span className="text-xs text-[var(--color-ink)]">
              {selectedConversation.participant}
            </span>
          </div>
        </div>

        {/* Show post content if responding to a post */}
        {isNewConversationFromPost && respondingToPost && (
          <div className="mb-2 bg-[var(--color-parchment)] border border-[var(--color-faded-ink)] p-2">
            <div className="mb-1">
              <span className="text-xs text-[var(--color-burgundy)] tracking-wider">
                {respondingToPost.catalogNumber}
              </span>
            </div>
            <p className="text-xs text-[var(--color-ink)] italic leading-relaxed">
              "{respondingToPost.content}"
            </p>
            <p className="text-xs text-[var(--color-faded-ink)] mt-1">
              Responding to post by {respondingToPost.author}
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-0.5 mb-2">
          {selectedConversation.messages.length === 0 && (
            <div className="text-center py-4 text-[var(--color-faded-ink)] italic text-xs">
              No messages yet. Start the conversation!
            </div>
          )}
          {selectedConversation.messages.map((message) => (
            <div
              key={message.id}
              className={`bg-[var(--color-aged-paper)] border border-[var(--color-ink)] p-1.5 w-fit max-w-[60%] break-words ${
                message.sender_id === user?.id ? 'ml-auto' : 'mr-auto'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-[var(--color-faded-ink)]">
                  {message.from}
                </span>
                <time className="text-xs text-[var(--color-faded-ink)]">
                  {formatTimestamp(message.created_at)}
                </time>
              </div>
              <p className="text-sm text-[var(--color-ink)] break-words">
                {message.content}
              </p>
            </div>
          ))}
        </div>

        {/* Message input */}
        <form onSubmit={handleSendMessage} className="border border-[var(--color-ink)] bg-[var(--color-aged-paper)] p-1.5">
          <div className="flex gap-1">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                // Send message on Enter (without Shift)
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (messageText.trim() && !sending && selectedConversation) {
                    handleSendMessage(e as any);
                  }
                }
                // Shift+Enter allows new line (default behavior)
              }}
              placeholder="Type your message..."
              className="flex-1 min-h-[60px] p-1.5 bg-[var(--color-parchment)] border border-[var(--color-faded-ink)] focus:border-[var(--color-ink)] focus:outline-none resize-none text-sm"
              required
            />
            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className="px-2 py-1 border border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-parchment)] hover:bg-[var(--color-burgundy)] hover:border-[var(--color-burgundy)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              {sending ? 'sending...' : 'send'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      {conversations.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--color-faded-ink)] bg-[var(--color-overlay)] p-2">
          <p className="text-xs text-[var(--color-faded-ink)] italic">
            No direct messages. Your inbox is empty.
          </p>
        </div>
      ) : (
            <div className="space-y-0.5">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    // Mark as read when opening
                    if (conversation.unread) {
                      markConversationAsRead(conversation.id);
                    }
                  }}
                  className={`w-full text-left bg-[var(--color-aged-paper)] border border-[var(--color-ink)] p-1.5 hover:bg-[var(--color-overlay)] transition-colors ${
                    conversation.unread ? 'border-[var(--color-burgundy)]' : ''
                  }`}
                >
              <div className="flex items-start justify-between mb-0.5">
                <span className="text-xs text-[var(--color-ink)] font-medium">
                  {conversation.participant}
                  {conversation.unread && (
                    <span className="ml-1 text-[var(--color-burgundy)]">•</span>
                  )}
                </span>
                <time className="text-xs text-[var(--color-faded-ink)]">
                  {formatTimestamp(conversation.timestamp)}
                </time>
              </div>
              <p className="text-xs text-[var(--color-faded-ink)] line-clamp-1">
                {conversation.lastMessage}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
