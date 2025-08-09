-- Tambahkan policy INSERT untuk profiles
-- User baru harus bisa membuat profile mereka sendiri saat sign up

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Juga tambahkan policy untuk DELETE jika diperlukan (opsional)
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);
