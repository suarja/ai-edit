/*
  # Configure video storage bucket and policies
  
  This migration:
  1. Creates a videos bucket for storing user video uploads
  2. Sets up RLS policies for secure video access
  3. Configures file size limits and allowed MIME types
*/

-- Create bucket function if it doesn't exist
create or replace function create_storage_bucket(
  bucket_name text,
  public_access boolean default false,
  file_size_limit bigint default null,
  allowed_mime_types text[] default null
) returns void as $$
begin
  insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
  )
  values (
    bucket_name,
    bucket_name,
    public_access,
    file_size_limit,
    allowed_mime_types
  )
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
end;
$$ language plpgsql security definer;

-- Create policy function if it doesn't exist
create or replace function create_storage_policy(
  bucket_name text,
  policy_name text,
  operation text,
  policy_using text default null,
  policy_check text default null,
  policy_role name default 'authenticated'
) returns void as $$
begin
  if operation = 'SELECT' then
    execute format(
      'create policy %I on storage.objects for select to %I using (%s)',
      policy_name,
      policy_role,
      policy_using
    );
  elsif operation = 'INSERT' then
    execute format(
      'create policy %I on storage.objects for insert to %I with check (%s)',
      policy_name,
      policy_role,
      policy_check
    );
  elsif operation = 'DELETE' then
    execute format(
      'create policy %I on storage.objects for delete to %I using (%s)',
      policy_name,
      policy_role,
      policy_using
    );
  end if;
exception
  when duplicate_object then
    null; -- Policy already exists, ignore
end;
$$ language plpgsql security definer;

-- Create the videos bucket
select create_storage_bucket(
  'videos',
  false,
  104857600, -- 100MB limit
  array['video/mp4', 'video/quicktime', 'video/x-m4v']
);

-- Enable RLS on storage.objects if not already enabled
do $$
begin
  if not exists (
    select 1
    from pg_tables
    where schemaname = 'storage'
      and tablename = 'objects'
      and rowsecurity = true
  ) then
    alter table storage.objects enable row level security;
  end if;
end $$;

-- Create upload policy
select create_storage_policy(
  'videos',
  'Users can upload videos',
  'INSERT',
  null,
  $policy$bucket_id = 'videos' and split_part(name, '/', 1) = auth.uid()::text$policy$
);

-- Create read policy
select create_storage_policy(
  'videos',
  'Users can read own videos',
  'SELECT',
  $policy$bucket_id = 'videos' and split_part(name, '/', 1) = auth.uid()::text$policy$
);

-- Create delete policy
select create_storage_policy(
  'videos',
  'Users can delete own videos',
  'DELETE',
  $policy$bucket_id = 'videos' and split_part(name, '/', 1) = auth.uid()::text$policy$
);