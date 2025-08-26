-- Add wallet_id column to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Add wallet_id column to budgets table
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_wallet_id ON expenses(wallet_id);
CREATE INDEX IF NOT EXISTS idx_budgets_wallet_id ON budgets(wallet_id);
