-- Create helper function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- FARMS
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id TEXT NOT NULL UNIQUE,
  owner_name TEXT NOT NULL,
  location TEXT NOT NULL,
  area NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  lease_start_date DATE,
  lease_end_date DATE,
  guarantor TEXT,
  crop_type TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='farms' AND policyname='Allow all select on farms'
  ) THEN
    CREATE POLICY "Allow all select on farms" ON public.farms FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='farms' AND policyname='Allow all insert on farms'
  ) THEN
    CREATE POLICY "Allow all insert on farms" ON public.farms FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='farms' AND policyname='Allow all update on farms'
  ) THEN
    CREATE POLICY "Allow all update on farms" ON public.farms FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='farms' AND policyname='Allow all delete on farms'
  ) THEN
    CREATE POLICY "Allow all delete on farms" ON public.farms FOR DELETE USING (true);
  END IF;
END$$;

DROP TRIGGER IF EXISTS update_farms_updated_at ON public.farms;
CREATE TRIGGER update_farms_updated_at
BEFORE UPDATE ON public.farms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AGENTS
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  mobile TEXT,
  guarantor TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='agents' AND policyname='Allow all select on agents'
  ) THEN
    CREATE POLICY "Allow all select on agents" ON public.agents FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='agents' AND policyname='Allow all insert on agents'
  ) THEN
    CREATE POLICY "Allow all insert on agents" ON public.agents FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='agents' AND policyname='Allow all update on agents'
  ) THEN
    CREATE POLICY "Allow all update on agents" ON public.agents FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='agents' AND policyname='Allow all delete on agents'
  ) THEN
    CREATE POLICY "Allow all delete on agents" ON public.agents FOR DELETE USING (true);
  END IF;
END$$;

DROP TRIGGER IF EXISTS update_agents_updated_at ON public.agents;
CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- VOUCHERS
CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id TEXT NOT NULL UNIQUE,
  linked_to TEXT NOT NULL CHECK (linked_to IN ('farm','agent')),
  linked_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense','income')),
  date DATE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash','bank','cheque')),
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vouchers' AND policyname='Allow all select on vouchers'
  ) THEN
    CREATE POLICY "Allow all select on vouchers" ON public.vouchers FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vouchers' AND policyname='Allow all insert on vouchers'
  ) THEN
    CREATE POLICY "Allow all insert on vouchers" ON public.vouchers FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vouchers' AND policyname='Allow all update on vouchers'
  ) THEN
    CREATE POLICY "Allow all update on vouchers" ON public.vouchers FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vouchers' AND policyname='Allow all delete on vouchers'
  ) THEN
    CREATE POLICY "Allow all delete on vouchers" ON public.vouchers FOR DELETE USING (true);
  END IF;
END$$;

DROP TRIGGER IF EXISTS update_vouchers_updated_at ON public.vouchers;
CREATE TRIGGER update_vouchers_updated_at
BEFORE UPDATE ON public.vouchers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BILLS
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id TEXT NOT NULL UNIQUE,
  agent_id TEXT NOT NULL,
  vehicle_number TEXT,
  arrival_number TEXT,
  product_variety TEXT,
  unloading_amount NUMERIC NOT NULL DEFAULT 0,
  advance NUMERIC NOT NULL DEFAULT 0,
  quantity NUMERIC NOT NULL DEFAULT 0,
  rate NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  net_payment NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bills_agent_fk FOREIGN KEY (agent_id) REFERENCES public.agents(agent_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bills' AND policyname='Allow all select on bills'
  ) THEN
    CREATE POLICY "Allow all select on bills" ON public.bills FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bills' AND policyname='Allow all insert on bills'
  ) THEN
    CREATE POLICY "Allow all insert on bills" ON public.bills FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bills' AND policyname='Allow all update on bills'
  ) THEN
    CREATE POLICY "Allow all update on bills" ON public.bills FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bills' AND policyname='Allow all delete on bills'
  ) THEN
    CREATE POLICY "Allow all delete on bills" ON public.bills FOR DELETE USING (true);
  END IF;
END$$;

DROP TRIGGER IF EXISTS update_bills_updated_at ON public.bills;
CREATE TRIGGER update_bills_updated_at
BEFORE UPDATE ON public.bills
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CUTTING SCHEDULES
CREATE TABLE IF NOT EXISTS public.cutting_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id TEXT NOT NULL,
  cutting_date DATE NOT NULL,
  crop_type TEXT,
  expected_quantity NUMERIC,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cutting_farm_fk FOREIGN KEY (farm_id) REFERENCES public.farms(farm_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

ALTER TABLE public.cutting_schedules ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cutting_schedules' AND policyname='Allow all select on cutting_schedules'
  ) THEN
    CREATE POLICY "Allow all select on cutting_schedules" ON public.cutting_schedules FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cutting_schedules' AND policyname='Allow all insert on cutting_schedules'
  ) THEN
    CREATE POLICY "Allow all insert on cutting_schedules" ON public.cutting_schedules FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cutting_schedules' AND policyname='Allow all update on cutting_schedules'
  ) THEN
    CREATE POLICY "Allow all update on cutting_schedules" ON public.cutting_schedules FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cutting_schedules' AND policyname='Allow all delete on cutting_schedules'
  ) THEN
    CREATE POLICY "Allow all delete on cutting_schedules" ON public.cutting_schedules FOR DELETE USING (true);
  END IF;
END$$;

DROP TRIGGER IF EXISTS update_cutting_schedules_updated_at ON public.cutting_schedules;
CREATE TRIGGER update_cutting_schedules_updated_at
BEFORE UPDATE ON public.cutting_schedules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LEDGER ENTRIES
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('farm','agent')),
  entity_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('voucher','bill')),
  transaction_id TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  debit NUMERIC NOT NULL DEFAULT 0,
  credit NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ledger_entries' AND policyname='Allow all select on ledger_entries'
  ) THEN
    CREATE POLICY "Allow all select on ledger_entries" ON public.ledger_entries FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ledger_entries' AND policyname='Allow all insert on ledger_entries'
  ) THEN
    CREATE POLICY "Allow all insert on ledger_entries" ON public.ledger_entries FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ledger_entries' AND policyname='Allow all update on ledger_entries'
  ) THEN
    CREATE POLICY "Allow all update on ledger_entries" ON public.ledger_entries FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ledger_entries' AND policyname='Allow all delete on ledger_entries'
  ) THEN
    CREATE POLICY "Allow all delete on ledger_entries" ON public.ledger_entries FOR DELETE USING (true);
  END IF;
END$$;
