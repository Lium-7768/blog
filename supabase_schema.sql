// Supabase Database Schema
// Run this in Supabase SQL Editor

-- Enable RLS
alter table auth.users enable row level security;

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users(id) primary key,
  name text not null,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table categories enable row level security;

create policy "Categories are viewable by everyone"
  on categories for select using (true);

-- Posts table
create table posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  cover_image text,
  status text default 'draft' check (status in ('draft', 'published')),
  author_id uuid references profiles(id) not null,
  category_id uuid references categories(id),
  view_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table posts enable row level security;

create policy "Published posts are viewable by everyone"
  on posts for select using (status = 'published');

create policy "Authors can view their own posts"
  on posts for select using (auth.uid() = author_id);

create policy "Authenticated users can create posts"
  on posts for insert with check (auth.uid() = author_id);

create policy "Authors can update their own posts"
  on posts for update using (auth.uid() = author_id);

create policy "Authors can delete their own posts"
  on posts for delete using (auth.uid() = author_id);

-- Comments table
create table comments (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) not null,
  parent_id uuid references comments(id),
  status text default 'pending' check (status in ('pending', 'approved', 'spam')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table comments enable row level security;

create policy "Approved comments are viewable by everyone"
  on comments for select using (status = 'approved');

create policy "Users can view their own comments"
  on comments for select using (auth.uid() = author_id);

create policy "Authenticated users can create comments"
  on comments for insert with check (auth.uid() = author_id);

-- Insert default categories
insert into categories (name, slug, description) values
  ('Technology', 'tech', 'Tech articles and tutorials'),
  ('Design', 'design', 'Design inspiration and tips'),
  ('Life', 'life', 'Personal thoughts and stories');

-- Function to auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_posts_updated_at
  before update on posts
  for each row execute function update_updated_at_column();

-- Tags table
create table tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  color text default '#3B82F6',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table tags enable row level security;

create policy "Tags are viewable by everyone"
  on tags for select using (true);

-- Post-Tag relationship (many-to-many)
create table post_tags (
  post_id uuid references posts(id) on delete cascade not null,
  tag_id uuid references tags(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, tag_id)
);

alter table post_tags enable row level security;

create policy "Post tags are viewable by everyone"
  on post_tags for select using (true);

create policy "Authors can manage post tags"
  on post_tags for all using (
    exists (
      select 1 from posts 
      where posts.id = post_tags.post_id 
      and posts.author_id = auth.uid()
    )
  );

-- Function to get posts by tag
create or replace function get_posts_by_tag(tag_slug text)
returns setof posts as $$
begin
  return query
  select p.* from posts p
  inner join post_tags pt on p.id = pt.post_id
  inner join tags t on pt.tag_id = t.id
  where t.slug = tag_slug and p.status = 'published'
  order by p.created_at desc;
end;
$$ language plpgsql security definer;

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();