-- Create sample user accounts for testing
-- Note: These will be placeholder profiles that can be used when users sign up

-- Insert sample customer profiles (these will be linked when users actually sign up)
INSERT INTO public.profiles (id, user_id, full_name, role) VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'John Doe', 'customer'),
  (gen_random_uuid(), gen_random_uuid(), 'Jane Smith', 'customer'),
  (gen_random_uuid(), gen_random_uuid(), 'Mike Johnson', 'customer'),
  (gen_random_uuid(), gen_random_uuid(), 'Sarah Wilson', 'customer'),
  (gen_random_uuid(), gen_random_uuid(), 'David Brown', 'support')
ON CONFLICT (user_id) DO NOTHING;

-- Create some sample support tickets for testing
INSERT INTO public.support_tickets (customer_id, title, description, category, priority, status) 
SELECT 
  p.id,
  CASE 
    WHEN random() < 0.3 THEN 'Battery Issue'
    WHEN random() < 0.6 THEN 'Charging Problem'
    ELSE 'General Inquiry'
  END,
  CASE 
    WHEN random() < 0.3 THEN 'My scooter battery is not holding charge properly'
    WHEN random() < 0.6 THEN 'Charging port seems loose and not connecting well'
    ELSE 'Need information about service locations'
  END,
  CASE 
    WHEN random() < 0.4 THEN 'technical'
    WHEN random() < 0.7 THEN 'billing'
    ELSE 'general'
  END,
  CASE 
    WHEN random() < 0.2 THEN 'high'
    WHEN random() < 0.7 THEN 'medium'
    ELSE 'low'
  END,
  CASE 
    WHEN random() < 0.6 THEN 'open'
    WHEN random() < 0.8 THEN 'in_progress'
    ELSE 'resolved'
  END
FROM public.profiles p 
WHERE p.role = 'customer'
LIMIT 8;

-- Add some ticket messages
INSERT INTO public.ticket_messages (ticket_id, user_id, message, is_internal)
SELECT 
  st.id,
  st.customer_id,
  'Initial ticket description and problem details.',
  false
FROM public.support_tickets st
LIMIT 5;