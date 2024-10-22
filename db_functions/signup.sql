
/**
* This trigger automatically creates a user entry when a new user signs up via Supabase Auth.
*/ 
-- Drop the existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create or replace the function
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, username, display_name, email)
  values (new.id, new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create the new trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
