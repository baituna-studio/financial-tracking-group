-- Insert sample categories for demonstration
-- Updated to use proper UUIDs and structure

-- Sample group (this will be updated by the test user script)
INSERT INTO public.groups (id, name, description, created_by) VALUES 
('00000000-0000-0000-0000-000000000001', 'Default Group', 'Default group for initial setup', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Sample categories with proper structure
INSERT INTO public.categories (id, name, description, icon, color, group_id, created_by) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Makanan & Minuman', 'Pengeluaran untuk makanan dan minuman sehari-hari', 'utensils', '#EF4444', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Listrik & Utilities', 'Tagihan listrik, air, gas, dan utilitas lainnya', 'zap', '#F59E0B', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Pendidikan', 'Biaya sekolah, kursus, dan pendidikan', 'graduation-cap', '#3B82F6', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Transportasi', 'Bensin, parkir, tol, dan transportasi umum', 'car', '#10B981', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Kesehatan', 'Obat-obatan, dokter, dan perawatan kesehatan', 'heart', '#EC4899', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Hiburan', 'Rekreasi, film, games, dan hiburan lainnya', 'gamepad-2', '#8B5CF6', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Belanja', 'Pakaian, elektronik, dan belanja lainnya', 'shopping-bag', '#F97316', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Lainnya', 'Pengeluaran yang tidak masuk kategori lain', 'more-horizontal', '#6B7280', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
