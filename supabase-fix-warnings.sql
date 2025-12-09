-- Fix Function Search Path warnings by adding SET search_path = ''
-- Run this in Supabase SQL Editor after the initial schema

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Fix generate_catalog_number function
CREATE OR REPLACE FUNCTION public.generate_catalog_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  year_part TEXT;
  number_part TEXT;
  catalog_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  number_part := LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000)::TEXT, 4, '0');
  catalog_num := 'REF-' || year_part || '-' || number_part;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.posts WHERE catalog_number = catalog_num) LOOP
    number_part := LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000 + RANDOM()::INT % 1000)::TEXT, 4, '0');
    catalog_num := 'REF-' || year_part || '-' || number_part;
  END LOOP;
  
  RETURN catalog_num;
END;
$$;

