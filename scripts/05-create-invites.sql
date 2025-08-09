-- Tabel undangan grup
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  email TEXT, -- optional, bisa kosong untuk undangan umum
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- RLS (opsional). Kita gunakan service role dari API, jadi bisa dibuat minim.
CREATE POLICY "invites are selectable by admins"
ON public.invites FOR SELECT
USING (
  -- pilih invites yang group-nya dimiliki user sebagai admin
  group_id IN (
    SELECT ug.group_id FROM public.user_groups ug
    WHERE ug.user_id = auth.uid() AND ug.role = 'admin'
  )
);

-- Tambahkan index agar lookup token cepat
CREATE INDEX IF NOT EXISTS invites_token_idx ON public.invites (token);
CREATE INDEX IF NOT EXISTS invites_group_idx ON public.invites (group_id);
