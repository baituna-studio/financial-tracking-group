-- Tambah kolom untuk pengaturan tanggal mulai bulan di tabel profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS month_start_day INTEGER DEFAULT 1 CHECK (month_start_day >= 1 AND month_start_day <= 31);

-- Update existing profiles dengan default value
UPDATE public.profiles 
SET month_start_day = 1 
WHERE month_start_day IS NULL;

-- Set NOT NULL constraint setelah backfill
ALTER TABLE public.profiles 
ALTER COLUMN month_start_day SET NOT NULL;
