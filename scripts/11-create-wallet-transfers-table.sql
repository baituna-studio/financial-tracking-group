-- Create wallet_transfers table
-- This table tracks money transfers between different wallet categories

CREATE TABLE IF NOT EXISTS wallet_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) NOT NULL,
  from_wallet_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  to_wallet_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  transfer_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE wallet_transfers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see transfers from their groups
CREATE POLICY "Users can view wallet transfers from their groups" ON wallet_transfers
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM user_groups WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can only insert transfers to their groups
CREATE POLICY "Users can insert wallet transfers to their groups" ON wallet_transfers
  FOR INSERT WITH CHECK (
    group_id IN (
      SELECT group_id FROM user_groups WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can only update transfers from their groups
CREATE POLICY "Users can update wallet transfers from their groups" ON wallet_transfers
  FOR UPDATE USING (
    group_id IN (
      SELECT group_id FROM user_groups WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can only delete transfers from their groups
CREATE POLICY "Users can delete wallet transfers from their groups" ON wallet_transfers
  FOR DELETE USING (
    group_id IN (
      SELECT group_id FROM user_groups WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_wallet_transfers_group_id ON wallet_transfers(group_id);
CREATE INDEX idx_wallet_transfers_created_by ON wallet_transfers(created_by);
CREATE INDEX idx_wallet_transfers_transfer_date ON wallet_transfers(transfer_date);
CREATE INDEX idx_wallet_transfers_from_wallet ON wallet_transfers(from_wallet_id);
CREATE INDEX idx_wallet_transfers_to_wallet ON wallet_transfers(to_wallet_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wallet_transfers_updated_at 
    BEFORE UPDATE ON wallet_transfers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
