import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { MessageCard } from './MessageCard';
import { DirectMessages } from './DirectMessages';
import { usePosts, Post } from '../hooks/usePosts';
import { useMessages } from '../hooks/useMessages';

interface MessageBoardProps {
  isAuthenticated: boolean;
  onLoginRequired: () => void;
  onNewMessage?: (senderName: string) => void;
  onRefReady?: (ref: { switchToMessages: () => void }) => void;
}

export function MessageBoard({ isAuthenticated, onLoginRequired, onNewMessage, onRefReady }: MessageBoardProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'messages'>('feed');
  const [filter, setFilter] = useState<'all' | 'seeking' | 'missed' | 'inquiry'>('all');
  const { posts, loading: postsLoading } = usePosts(filter);
  const { conversations } = useMessages();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [openConversationWith, setOpenConversationWith] = useState<string | null>(null);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [respondingToPost, setRespondingToPost] = useState<{ author: string; content: string; catalogNumber: string } | null>(null);

  // Format posts for MessageCard component
  const formattedMessages = posts.map((post: Post) => ({
    id: post.id,
    catalogNumber: post.catalog_number,
    author: post.author,
    timestamp: new Date(post.created_at).toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit' 
    }),
    content: post.content,
    category: post.category,
    responses: post.responses,
  }));

  const handleTabClick = (tab: 'feed' | 'messages') => {
    if (tab === 'messages' && !isAuthenticated) {
      onLoginRequired();
    } else {
      setActiveTab(tab);
      if (tab === 'feed') {
        setOpenConversationWith(null);
      }
    }
  };

  // Expose method to switch to messages tab (for notification)
  useEffect(() => {
    if (onRefReady) {
      onRefReady({
        switchToMessages: () => {
          if (isAuthenticated) {
            setActiveTab('messages');
          } else {
            onLoginRequired();
          }
        }
      });
    }
  }, [onRefReady, isAuthenticated]);

  const handleRespondToPost = (author: string, postContent: string, catalogNumber: string) => {
    setActiveTab('messages');
    setOpenConversationWith(author);
    setRespondingToPost({ author, content: postContent, catalogNumber });
  };

  // Update unread status when authentication or conversations change
  useEffect(() => {
    if (isAuthenticated) {
      const unreadConversations = conversations.filter((c: { unread: boolean }) => c.unread);
      const currentUnreadCount = unreadConversations.length;
      setHasUnreadMessages(currentUnreadCount > 0);
      
      // Check if we have new unread messages (count increased)
      // Only notify if user is not currently viewing messages
      if (currentUnreadCount > previousUnreadCount && activeTab !== 'messages' && onNewMessage && previousUnreadCount >= 0) {
        // Get the most recent unread conversation
        const newestUnread = unreadConversations.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        
        if (newestUnread) {
          onNewMessage(newestUnread.participant);
        }
      }
      
      // Update previous count after checking for new messages
      setPreviousUnreadCount(currentUnreadCount);
    } else {
      setHasUnreadMessages(false);
      setPreviousUnreadCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, conversations, activeTab]);

  return (
    <div>
      {/* Navigation bar */}
      <div className="mb-3 bg-[var(--color-aged-paper)] border-2 border-[var(--color-ink)] p-2">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabClick('feed')}
            className={`px-3 py-1.5 text-sm border-2 transition-all font-medium ${
              activeTab === 'feed'
                ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-parchment)]'
                : 'border-[var(--color-faded-ink)] bg-transparent text-[var(--color-faded-ink)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => handleTabClick('messages')}
            className={`px-3 py-1.5 text-sm border-2 transition-all font-medium relative flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-parchment)]'
                : 'border-[var(--color-faded-ink)] bg-transparent text-[var(--color-faded-ink)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]'
            }`}
          >
            {!isAuthenticated && <Lock className="w-3.5 h-3.5" />}
            Direct Messages
            {hasUnreadMessages && isAuthenticated && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[var(--color-ink)]"></span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'feed' ? (
        <>
          {/* Filter section */}
          <div className="mb-2 bg-[var(--color-aged-paper)] border border-[var(--color-ink)] p-1.5">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs text-[var(--color-ink)] uppercase tracking-wide">Filter:</span>
            </div>
            
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-1.5 py-0.5 text-xs border transition-all ${
                  filter === 'all'
                    ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-parchment)]'
                    : 'border-[var(--color-faded-ink)] bg-transparent text-[var(--color-faded-ink)] hover:text-[var(--color-ink)]'
                }`}
              >
                all
              </button>
              <button
                onClick={() => setFilter('seeking')}
                className={`px-1.5 py-0.5 text-xs border transition-all ${
                  filter === 'seeking'
                    ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-parchment)]'
                    : 'border-[var(--color-faded-ink)] bg-transparent text-[var(--color-faded-ink)] hover:text-[var(--color-ink)]'
                }`}
              >
                seeking
              </button>
              <button
                onClick={() => setFilter('missed')}
                className={`px-1.5 py-0.5 text-xs border transition-all ${
                  filter === 'missed'
                    ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-parchment)]'
                    : 'border-[var(--color-faded-ink)] bg-transparent text-[var(--color-faded-ink)] hover:text-[var(--color-ink)]'
                }`}
              >
                missed
              </button>
              <button
                onClick={() => setFilter('inquiry')}
                className={`px-1.5 py-0.5 text-xs border transition-all ${
                  filter === 'inquiry'
                    ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-parchment)]'
                    : 'border-[var(--color-faded-ink)] bg-transparent text-[var(--color-faded-ink)] hover:text-[var(--color-ink)]'
                }`}
              >
                inquiry
              </button>
            </div>
          </div>

          {/* Messages */}
          {postsLoading ? (
            <div className="text-center py-8">
              <p className="text-xs text-[var(--color-faded-ink)] italic">Loading...</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {formattedMessages.map((message) => (
                <MessageCard 
                  key={message.id} 
                  message={message}
                  isAuthenticated={isAuthenticated}
                  onLoginRequired={onLoginRequired}
                  onRespond={handleRespondToPost}
                />
              ))}
            </div>
          )}

          {!postsLoading && formattedMessages.length === 0 && (
            <div className="text-center py-8 border border-dashed border-[var(--color-faded-ink)] bg-[var(--color-overlay)] p-2">
              <p className="text-xs text-[var(--color-faded-ink)] italic">
                No entries found in this category. The archives remain silent.
              </p>
            </div>
          )}
        </>
          ) : (
            <DirectMessages 
              isAuthenticated={isAuthenticated}
              onLoginRequired={onLoginRequired}
              onUnreadChange={setHasUnreadMessages}
              openConversationWith={openConversationWith}
              onConversationClosed={() => {
                setOpenConversationWith(null);
                setRespondingToPost(null);
              }}
              respondingToPost={respondingToPost}
            />
          )}
    </div>
  );
}

