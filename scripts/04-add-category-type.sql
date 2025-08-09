-- Tambah kolom tipe kategori dan constraint
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Pengeluaran' CHECK (type IN ('Pemasukan', 'Pengeluaran'));

-- Set default NOT NULL setelah backfill
UPDATE public.categories
SET type = COALESCE(type, 'Pengeluaran');

ALTER TABLE public.categories
ALTER COLUMN type SET NOT NULL;
