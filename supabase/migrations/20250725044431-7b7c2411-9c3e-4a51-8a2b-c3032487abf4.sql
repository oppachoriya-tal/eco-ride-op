-- Update the handle_new_user function to include the new admin user
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
    CASE 
      WHEN new.email = 'admin@scooter.com' THEN 'admin'::user_role
      WHEN new.email = 'admin@talentica.com' THEN 'admin'::user_role
      ELSE 'customer'::user_role
    END
  );
  RETURN new;
END;
$function$