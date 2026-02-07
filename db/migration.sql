-- ============================================
-- Blog Database Schema - Complete Migration
-- ============================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  name text NOT NULL,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- 3. Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  cover_image text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id uuid REFERENCES profiles(id) NOT NULL,
  category_id uuid REFERENCES categories(id),
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
CREATE POLICY "Published posts are viewable by everyone" ON posts FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authors can view their own posts" ON posts;
CREATE POLICY "Authors can view their own posts" ON posts FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
CREATE POLICY "Authors can update their own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own posts" ON posts;
CREATE POLICY "Authors can delete their own posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- 4. Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles(id) NOT NULL,
  parent_id uuid REFERENCES comments(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved comments are viewable by everyone" ON comments;
CREATE POLICY "Approved comments are viewable by everyone" ON comments FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Users can view their own comments" ON comments;
CREATE POLICY "Users can view their own comments" ON comments FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 5. Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  color text DEFAULT '#3B82F6',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);

-- 6. Post-Tag relationship table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Post tags are viewable by everyone" ON post_tags;
CREATE POLICY "Post tags are viewable by everyone" ON post_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authors can manage post tags" ON post_tags;
CREATE POLICY "Authors can manage post tags" ON post_tags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = post_tags.post_id 
    AND posts.author_id = auth.uid()
  )
);

-- 7. Insert default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Technology', 'tech', 'Tech articles and tutorials'),
  ('Design', 'design', 'Design inspiration and tips'),
  ('Life', 'life', 'Personal thoughts and stories')
ON CONFLICT (slug) DO NOTHING;

-- 8. Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for posts updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Create function for profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Create function to get posts by tag
CREATE OR REPLACE FUNCTION get_posts_by_tag(tag_slug text)
RETURNS SETOF posts AS $$
BEGIN
  RETURN QUERY
  SELECT p.* FROM posts p
  INNER JOIN post_tags pt ON p.id = pt.post_id
  INNER JOIN tags t ON pt.tag_id = t.id
  WHERE t.slug = tag_slug AND p.status = 'published'
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create function to increment post views
CREATE OR REPLACE FUNCTION increment_post_views(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts SET view_count = view_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;