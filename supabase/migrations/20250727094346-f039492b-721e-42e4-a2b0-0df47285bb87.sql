-- Create user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'support', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update handle_new_user function to properly handle roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    COALESCE(
      (new.raw_user_meta_data ->> 'role')::user_role,
      'customer'::user_role
    )
  );
  RETURN new;
END;
$function$;