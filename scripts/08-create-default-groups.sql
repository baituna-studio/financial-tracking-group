-- Script to create default groups for existing users who don't have any groups
-- This ensures all users have at least one group to work with

-- Function to create default group for a user
CREATE OR REPLACE FUNCTION create_default_group_for_user(user_id UUID, user_email TEXT, user_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    group_id UUID;
    default_categories TEXT[] := ARRAY[
        'Makanan & Minuman',
        'Listrik & Utilities', 
        'Pendidikan',
        'Transportasi',
        'Kesehatan',
        'Hiburan',
        'Belanja',
        'Lainnya'
    ];
    category_icons TEXT[] := ARRAY[
        'utensils',
        'zap',
        'graduation-cap',
        'car',
        'heart',
        'gamepad-2',
        'shopping-bag',
        'more-horizontal'
    ];
    category_colors TEXT[] := ARRAY[
        '#EF4444',
        '#F59E0B',
        '#3B82F6',
        '#10B981',
        '#EC4899',
        '#8B5CF6',
        '#F97316',
        '#6B7280'
    ];
    i INTEGER;
BEGIN
    -- Create default group
    INSERT INTO public.groups (name, description, created_by, created_at, updated_at)
    VALUES (
        'Grup Pribadi',
        'Grup keuangan pribadi',
        user_id,
        NOW(),
        NOW()
    )
    RETURNING id INTO group_id;

    -- Add user to group as admin
    INSERT INTO public.user_groups (user_id, group_id, role, joined_at)
    VALUES (user_id, group_id, 'admin', NOW());

    -- Create default categories
    FOR i IN 1..array_length(default_categories, 1) LOOP
        INSERT INTO public.categories (name, icon, color, group_id, created_by, created_at, updated_at)
        VALUES (
            default_categories[i],
            category_icons[i],
            category_colors[i],
            group_id,
            user_id,
            NOW(),
            NOW()
        );
    END LOOP;

    RETURN group_id;
END;
$$;

-- Find users who don't have any groups and create default groups for them
DO $$
DECLARE
    user_record RECORD;
    group_id UUID;
BEGIN
    -- Loop through all profiles that don't have any group memberships
    FOR user_record IN 
        SELECT p.id, p.email, p.full_name
        FROM public.profiles p
        WHERE NOT EXISTS (
            SELECT 1 FROM public.user_groups ug WHERE ug.user_id = p.id
        )
    LOOP
        BEGIN
            -- Create default group for this user
            SELECT create_default_group_for_user(user_record.id, user_record.email, user_record.full_name) INTO group_id;
            
            RAISE NOTICE 'Created default group % for user % (%)', group_id, user_record.email, user_record.full_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Failed to create default group for user %: %', user_record.email, SQLERRM;
        END;
    END LOOP;
END;
$$;

-- Clean up the function
DROP FUNCTION create_default_group_for_user(UUID, TEXT, TEXT);

-- Show summary of what was created
SELECT 
    'Summary' as info,
    COUNT(DISTINCT ug.user_id) as users_with_groups,
    COUNT(DISTINCT g.id) as total_groups,
    COUNT(DISTINCT c.id) as total_categories
FROM public.user_groups ug
JOIN public.groups g ON ug.group_id = g.id
LEFT JOIN public.categories c ON c.group_id = g.id;
