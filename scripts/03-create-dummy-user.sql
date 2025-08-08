-- Create dummy user for testing
-- Note: This should be run after the main tables are created

-- First, we need to create the user in auth.users table
-- Since we can't directly insert into auth.users from SQL editor,
-- we'll create a function to handle this

-- Create a function to insert test user (if not exists)
CREATE OR REPLACE FUNCTION create_test_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    test_user_id uuid := '11111111-1111-1111-1111-111111111111';
    test_group_id uuid := '22222222-2222-2222-2222-222222222222';
BEGIN
    -- Insert test profile (this will work if the user signs up normally)
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (
        test_user_id,
        'ricky@gmail.com',
        'Ricky',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Create test group
    INSERT INTO public.groups (id, name, description, created_by, created_at, updated_at)
    VALUES (
        test_group_id,
        'Grup Ricky',
        'Grup keuangan pribadi Ricky',
        test_user_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Add user to group
    INSERT INTO public.user_groups (user_id, group_id, role, joined_at)
    VALUES (
        test_user_id,
        test_group_id,
        'admin',
        NOW()
    )
    ON CONFLICT (user_id, group_id) DO NOTHING;

    -- Update existing categories to belong to test group
    UPDATE public.categories 
    SET group_id = test_group_id, created_by = test_user_id
    WHERE group_id = '00000000-0000-0000-0000-000000000001';

    -- Create sample budget for test user
    INSERT INTO public.budgets (title, amount, category_id, group_id, start_date, end_date, created_by)
    SELECT 
        'Budget ' || c.name || ' Januari 2024',
        CASE 
            WHEN c.name = 'Makanan & Minuman' THEN 2000000
            WHEN c.name = 'Listrik & Utilities' THEN 500000
            WHEN c.name = 'Transportasi' THEN 1000000
            WHEN c.name = 'Pendidikan' THEN 1500000
            ELSE 500000
        END,
        c.id,
        test_group_id,
        '2024-01-01',
        '2024-01-31',
        test_user_id
    FROM public.categories c
    WHERE c.group_id = test_group_id
    ON CONFLICT DO NOTHING;

    -- Create sample expenses for test user
    INSERT INTO public.expenses (title, description, amount, category_id, group_id, expense_date, created_by)
    SELECT 
        CASE 
            WHEN c.name = 'Makanan & Minuman' THEN 'Makan siang di restoran'
            WHEN c.name = 'Listrik & Utilities' THEN 'Tagihan listrik bulan ini'
            WHEN c.name = 'Transportasi' THEN 'Bensin motor'
            WHEN c.name = 'Pendidikan' THEN 'Beli buku pelajaran'
            ELSE 'Pengeluaran ' || c.name
        END,
        'Contoh pengeluaran untuk kategori ' || c.name,
        CASE 
            WHEN c.name = 'Makanan & Minuman' THEN 75000
            WHEN c.name = 'Listrik & Utilities' THEN 350000
            WHEN c.name = 'Transportasi' THEN 50000
            WHEN c.name = 'Pendidikan' THEN 200000
            ELSE 25000
        END,
        c.id,
        test_group_id,
        CURRENT_DATE - INTERVAL '1 day',
        test_user_id
    FROM public.categories c
    WHERE c.group_id = test_group_id
    ON CONFLICT DO NOTHING;

END;
$$;

-- Execute the function
SELECT create_test_user();

-- Drop the function after use
DROP FUNCTION create_test_user();
