-- Create admin user profile (this will be linked when the user signs up)
INSERT INTO public.profiles (id, user_id, full_name, role) 
VALUES (
  gen_random_uuid(),
  gen_random_uuid(),
  'Talentica Admin',
  'admin'::user_role
)
ON CONFLICT DO NOTHING;

-- Update the handle_new_user function to automatically assign admin role for specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Insert profile with automatic admin assignment for specific emails
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    CASE 
      WHEN new.email = 'admin@talentica.com' THEN 'admin'::user_role
      WHEN new.email = 'admin@scooter.com' THEN 'admin'::user_role
      ELSE 'customer'::user_role
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$function$;