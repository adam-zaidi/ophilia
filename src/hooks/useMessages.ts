import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  participant: string;
  participant_id: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  messages: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
  from: string;
}

export function useMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations(true);
    
    // Use polling instead of real-time subscriptions (for free tier)
    // Poll every 5 seconds for new messages (less frequent to reduce interruptions)
    const pollInterval = setInterval(() => {
      fetchConversations(false);
    }, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const fetchConversations = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setConversations([]);
        if (isInitialLoad) {
          setLoading(false);
        }
        return;
      }

      // Get conversations where user is participant
      const { data: convs, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      // Get messages and profiles for each conversation
      const conversationsWithMessages = await Promise.all(
        (convs || []).map(async (conv) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
          
          // Get other user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', otherUserId)
            .single();

          // Get messages
          const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true });

          // Fetch profiles for all unique sender_ids
          const senderIds = [...new Set((msgs || []).map((msg: any) => msg.sender_id))];
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, username')
            .in('user_id', senderIds);

          // Create a map of user_id to username
          const usernameMap = new Map(
            (profilesData || []).map((profile: any) => [profile.user_id, profile.username])
          );

          const transformedMessages: Message[] = (msgs || []).map((msg: any) => ({
            id: msg.id,
            conversation_id: msg.conversation_id,
            sender_id: msg.sender_id,
            content: msg.content,
            created_at: msg.created_at,
            read: msg.read,
            from: msg.sender_id === user.id ? 'You' : (usernameMap.get(msg.sender_id) || 'Unknown'),
          }));

          const lastMessage = transformedMessages[transformedMessages.length - 1];
          const unreadCount = transformedMessages.filter(
            m => m.sender_id !== user.id && !m.read
          ).length;

          return {
            id: conv.id,
            user1_id: conv.user1_id,
            user2_id: conv.user2_id,
            created_at: conv.created_at,
            participant: profile?.username || 'Unknown',
            participant_id: otherUserId,
            lastMessage: lastMessage?.content || '',
            timestamp: lastMessage?.created_at || conv.created_at,
            unread: unreadCount > 0,
            messages: transformedMessages,
          };
        })
      );

      // Only update if there are actual changes to avoid unnecessary re-renders
      setConversations(prevConversations => {
        // Check if conversations actually changed
        if (prevConversations.length === 0 && conversationsWithMessages.length > 0) {
          return conversationsWithMessages;
        }
        
        // Compare by checking if any conversation has new messages or changed unread status
        const hasChanges = conversationsWithMessages.some(newConv => {
          const oldConv = prevConversations.find(c => c.id === newConv.id);
          if (!oldConv) return true; // New conversation
          
          // Check if message count changed
          if (newConv.messages.length !== oldConv.messages.length) return true;
          
          // Check if unread status changed
          if (newConv.unread !== oldConv.unread) return true;
          
          // Check if last message timestamp changed
          if (newConv.timestamp !== oldConv.timestamp) return true;
          
          return false;
        });
        
        // Only update if there are changes (prevents unnecessary re-renders)
        return hasChanges ? conversationsWithMessages : prevConversations;
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  const getOrCreateConversation = async (otherUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .single();

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: otherUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return newConv.id;
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      throw error;
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
        });

      if (error) throw error;

      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      fetchConversations(false);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Immediately update the local state optimistically
      // This prevents the red dot from reappearing when switching tabs
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === conversationId) {
            // Update messages to mark them as read
            const updatedMessages = conv.messages.map(msg => 
              msg.sender_id !== user.id && !msg.read 
                ? { ...msg, read: true }
                : msg
            );
            // Recalculate unread status
            const unreadCount = updatedMessages.filter(
              m => m.sender_id !== user.id && !m.read
            ).length;
            return {
              ...conv,
              messages: updatedMessages,
              unread: unreadCount > 0,
            };
          }
          return conv;
        })
      );

      // Mark all unread messages in this conversation as read in the database
      // Only mark messages that were sent by others (not by the current user)
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('read', false)
        .neq('sender_id', user.id);

      if (error) {
        console.error('Error updating messages:', error);
        // Revert optimistic update on error
        fetchConversations(false);
        throw error;
      }

      // Small delay before refetch to ensure database consistency
      // The optimistic update already shows the correct state
      setTimeout(() => {
        fetchConversations(false);
      }, 500);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  return {
    conversations,
    loading,
    getOrCreateConversation,
    sendMessage,
    markConversationAsRead,
    refetch: () => fetchConversations(false),
  };
}

