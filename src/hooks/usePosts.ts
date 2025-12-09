import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  category: 'seeking' | 'missed' | 'inquiry';
  catalog_number: string;
  created_at: string;
  author: string;
  responses: number;
}

export function usePosts(filter: 'all' | 'seeking' | 'missed' | 'inquiry' = 'all') {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('posts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts' },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('category', filter);
      }

      const { data: postsData, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set((postsData || []).map((post: any) => post.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', userIds);

      // Create a map of user_id to username
      const usernameMap = new Map(
        (profilesData || []).map((profile: any) => [profile.user_id, profile.username])
      );

      // Transform data to match Post interface
      const transformedPosts: Post[] = (postsData || []).map((post: any) => ({
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        category: post.category,
        catalog_number: post.catalog_number,
        created_at: post.created_at,
        author: usernameMap.get(post.user_id) || 'Anonymous Patron',
        responses: 0, // TODO: Calculate from messages/conversations
      }));

      setPosts(transformedPosts);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, category: 'seeking' | 'missed' | 'inquiry') => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error('Authentication error: ' + userError.message);
      }
      
      if (!user) {
        throw new Error('Not authenticated. Please log in to create posts.');
      }

      // Generate catalog number (fallback if RPC doesn't exist)
      let catalogNumber = `REF-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      try {
        const { data: catalogData, error: catalogError } = await supabase
          .rpc('generate_catalog_number');
        if (!catalogError && catalogData) {
          catalogNumber = catalogData;
        }
      } catch (err) {
        // RPC might not exist yet, use fallback
        console.warn('Catalog number RPC not available, using fallback:', err);
      }

      // Ensure user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        // Try to create profile if it doesn't exist
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email || '',
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          });
        
        if (createProfileError) {
          console.error('Profile creation error:', createProfileError);
          throw new Error('Profile not found. Please try logging out and back in.');
        }
      }

      console.log('Creating post with:', { user_id: user.id, content, category, catalog_number: catalogNumber });

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          category,
          catalog_number: catalogNumber,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(insertError.message || 'Failed to create post');
      }

      console.log('Post created successfully:', data);
      
      // Refresh posts list
      await fetchPosts();
      
      return data;
    } catch (err: any) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  return { posts, loading, error, createPost, refetch: fetchPosts };
}

