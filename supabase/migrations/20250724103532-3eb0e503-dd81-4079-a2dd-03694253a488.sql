-- Remove the failed sample orders data and fix the trigger
DELETE FROM public.orders WHERE order_number IN ('ESC-2024-001', 'ESC-2024-002');

-- Fix the trigger function to handle phone number correctly
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, phone_number)
  VALUES (new.id, new.raw_user_meta_data->>'phone');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;