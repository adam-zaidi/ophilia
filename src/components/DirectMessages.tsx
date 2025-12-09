import { useState, useEffect } from 'react';
import { useMessages, Conversation, Message } from '../hooks/useMessages';
import { supabase } from '../lib/supabase';

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
}

export function DirectMessages({ isAuthenticated, onLoginRequired, onUnreadChange, openConversationWith, onConversationClosed }: DirectMessagesProps) {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  
  // Open conversation when openConversationWith changes
  useEffect(() => {
    if (openConversationWith && conversations.length > 0) {
      const conversation = conversations.find(c => c.participant === openConversationWith);
      if (conversation) {
        setSelectedConversation(conversation);
      } else {
        // Find user by username and create conversation
        findUserAndCreateConversation(openConversationWith);
      }
    }
  }, [openConversationWith, conversations]);

  const findUserAndCreateConversation = async (username: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username)
        .single();

      if (profile) {
        const conversationId = await getOrCreateConversation(profile.user_id);
        await refetch();
        const newConv = conversations.find(c => c.id === conversationId);
        if (newConv) {
          setSelectedConversation(newConv);
        }
      }
    } catch (error) {
      console.error('Error finding user:', error);
    }
  };
  
  // Calculate unread count and notify parent
  const hasUnread = conversations.some(c => c.unread);
  
  useEffect(() => {
    if (onUnreadChange) {
      onUnreadChange(hasUnread);
    }
  }, [hasUnread, onUnreadChange]);

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
    try {
      await sendMessage(selectedConversation.id, messageText.trim());
      setMessageText('');
      await refetch();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (selectedConversation) {
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-0.5 mb-2">
          {selectedConversation.messages.map((message) => (
            <div
              key={message.id}
              className={`bg-[var(--color-aged-paper)] border border-[var(--color-ink)] p-1.5 ${
                message.from === 'You' ? 'ml-4' : 'mr-4'
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
              <p className="text-sm text-[var(--color-ink)]">
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

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-xs text-[var(--color-faded-ink)] italic">Loading...</p>
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
              onClick={() => setSelectedConversation(conversation)}
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

