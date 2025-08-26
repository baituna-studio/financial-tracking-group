-- Create wallet categories
-- This script adds wallet categories for different payment methods

-- Insert wallet categories
INSERT INTO categories (name, description, type, color, icon, group_id, created_at, updated_at, created_by)
VALUES 
  ('Bank BCA',  'Bank Central Asia',              'Dompet', '#1E40AF', 'folder', '697390c3-bb9d-445b-9d4e-c6634a7507fd', NOW(), NOW(), '4457f496-1e38-475d-999e-2f1e8b14c406'),
  ('Bank BSI',  'Bank Syariah Indonesia',         'Dompet', '#059669', 'folder', '697390c3-bb9d-445b-9d4e-c6634a7507fd', NOW(), NOW(), '4457f496-1e38-475d-999e-2f1e8b14c406'),
  ('Bank JAGO', 'Bank JAGO - digital banking',    'Dompet', '#DC2626', 'folder', '697390c3-bb9d-445b-9d4e-c6634a7507fd', NOW(), NOW(), '4457f496-1e38-475d-999e-2f1e8b14c406'),
  ('ShoppeyPay','ShoppeyPay - e-wallet',          'Dompet', '#7C3AED', 'folder', '697390c3-bb9d-445b-9d4e-c6634a7507fd', NOW(), NOW(), '4457f496-1e38-475d-999e-2f1e8b14c406'),
  ('Flip',      'Flip - transfer dan pembayaran', 'Dompet', '#F59E0B', 'folder', '697390c3-bb9d-445b-9d4e-c6634a7507fd', NOW(), NOW(), '4457f496-1e38-475d-999e-2f1e8b14c406');

-- Note: This script assumes there's at least one group in the groups table
-- If you need to create categories for specific groups, replace (SELECT id FROM groups LIMIT 1) with the actual group IDs
