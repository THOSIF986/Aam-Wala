-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create farms table
CREATE TABLE IF NOT EXISTS farms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farm_id VARCHAR(50) UNIQUE NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  location TEXT NOT NULL,
  area DECIMAL(10,2) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  lease_start_date DATE NOT NULL,
  lease_end_date DATE NOT NULL,
  guarantor VARCHAR(255) NOT NULL,
  crop_type VARCHAR(100) NOT NULL DEFAULT 'Mango',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id VARCHAR(50) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  agent_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  guarantor VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  voucher_id VARCHAR(50) UNIQUE NOT NULL,
  linked_to VARCHAR(10) NOT NULL CHECK (linked_to IN ('farm', 'agent')),
  linked_id VARCHAR(50) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
  date DATE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('cash', 'bank', 'cheque')),
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bill_id VARCHAR(50) UNIQUE NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  vehicle_number VARCHAR(50) NOT NULL,
  arrival_number VARCHAR(50) NOT NULL,
  product_variety VARCHAR(100) NOT NULL,
  unloading_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  advance DECIMAL(12,2) NOT NULL DEFAULT 0,
  quantity DECIMAL(10,2) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  net_payment DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cutting_schedules table
CREATE TABLE IF NOT EXISTS cutting_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farm_id VARCHAR(50) NOT NULL,
  cutting_date DATE NOT NULL,
  crop_type VARCHAR(100) NOT NULL,
  expected_quantity DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ledger_entries table
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  entity_type VARCHAR(10) NOT NULL CHECK (entity_type IN ('farm', 'agent')),
  entity_id VARCHAR(50) NOT NULL,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('voucher', 'bill')),
  transaction_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  debit DECIMAL(12,2) NOT NULL DEFAULT 0,
  credit DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farms_farm_id ON farms(farm_id);
CREATE INDEX IF NOT EXISTS idx_agents_agent_id ON agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_voucher_id ON vouchers(voucher_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_linked ON vouchers(linked_to, linked_id);
CREATE INDEX IF NOT EXISTS idx_bills_bill_id ON bills(bill_id);
CREATE INDEX IF NOT EXISTS idx_bills_agent_id ON bills(agent_id);
CREATE INDEX IF NOT EXISTS idx_cutting_schedules_farm_id ON cutting_schedules(farm_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_entity ON ledger_entries(entity_type, entity_id);

-- Create functions for automatic ledger entry creation
CREATE OR REPLACE FUNCTION create_voucher_ledger_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ledger_entries (
    entity_type, entity_id, transaction_type, transaction_id, 
    date, description, debit, credit
  ) VALUES (
    NEW.linked_to, NEW.linked_id, 'voucher', NEW.voucher_id,
    NEW.date, NEW.reason,
    CASE WHEN NEW.type = 'expense' THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE 0 END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_bill_ledger_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ledger_entries (
    entity_type, entity_id, transaction_type, transaction_id,
    date, description, debit, credit
  ) VALUES (
    'agent', NEW.agent_id, 'bill', NEW.bill_id,
    CURRENT_DATE, 'Sale Bill - ' || NEW.product_variety || ' (' || NEW.quantity || ' units)',
    0, NEW.net_payment
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_voucher_ledger ON vouchers;
CREATE TRIGGER trigger_voucher_ledger
  AFTER INSERT ON vouchers
  FOR EACH ROW EXECUTE FUNCTION create_voucher_ledger_entry();

DROP TRIGGER IF EXISTS trigger_bill_ledger ON bills;
CREATE TRIGGER trigger_bill_ledger
  AFTER INSERT ON bills
  FOR EACH ROW EXECUTE FUNCTION create_bill_ledger_entry();

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vouchers_updated_at BEFORE UPDATE ON vouchers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cutting_schedules_updated_at BEFORE UPDATE ON cutting_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();