-- Script untuk debug invites
-- Cek invite yang ada dan statusnya

SELECT 
  i.id,
  i.token,
  i.group_id,
  g.name as group_name,
  i.role,
  i.email,
  i.created_at,
  i.expires_at,
  i.accepted_at,
  i.accepted_by,
  p.full_name as accepted_by_name,
  CASE 
    WHEN i.accepted_at IS NOT NULL THEN 'ACCEPTED'
    WHEN i.expires_at < NOW() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as status
FROM public.invites i
LEFT JOIN public.groups g ON i.group_id = g.id
LEFT JOIN public.profiles p ON i.accepted_by = p.id
ORDER BY i.created_at DESC;

-- Cek user_groups untuk melihat membership
SELECT 
  ug.user_id,
  p.full_name,
  p.email,
  ug.group_id,
  g.name as group_name,
  ug.role,
  ug.joined_at
FROM public.user_groups ug
LEFT JOIN public.profiles p ON ug.user_id = p.id
LEFT JOIN public.groups g ON ug.group_id = g.id
ORDER BY ug.joined_at DESC;
