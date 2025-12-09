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
    fetchConversations();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setConversations([]);
        setLoading(false);
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
            .select('*, profiles(username)')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true });

          const transformedMessages: Message[] = (msgs || []).map((msg: any) => ({
            id: msg.id,
            conversation_id: msg.conversation_id,
            sender_id: msg.sender_id,
            content: msg.content,
            created_at: msg.created_at,
            read: msg.read,
            from: msg.sender_id === user.id ? 'You' : (msg.profiles?.username || 'Unknown'),
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

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
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

      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    conversations,
    loading,
    getOrCreateConversation,
    sendMessage,
    refetch: fetchConversations,
  };
}

