/*
  # Add Bill Items Table for Multiple Varieties

  ## Summary
  Creates a bill_items table to support multiple product varieties per bill with individual quantities and rates.

  ## New Tables
  1. `bill_items`
    - `id` (uuid, primary key)
    - `bill_id` (text, foreign key to bills.bill_id)
    - `product_variety` (text) - Name of the mango variety
    - `quantity` (numeric) - Quantity in kg
    - `rate` (numeric) - Rate per kg
    - `total` (numeric) - Calculated total (quantity * rate)
    - `created_at` (timestamptz)

  ## Changes to Existing Tables
  - The bills table will continue to have aggregated totals
  - Individual variety details will be stored in bill_items

  ## Security
  - Enable RLS on bill_items table
  - Add policies for public access (consistent with bills table)

  ## Notes
  - This allows bills to have multiple varieties with different rates
  - The bills table stores the final calculated amounts
  - bill_items stores the breakdown by variety
*/

-- Create bill_items table
CREATE TABLE IF NOT EXISTS public.bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id TEXT NOT NULL,
  product_variety TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  rate NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bill_items_bill_fk FOREIGN KEY (bill_id) REFERENCES public.bills(bill_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;

-- Create policies for bill_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bill_items' AND policyname='Allow all select on bill_items'
  ) THEN
    CREATE POLICY "Allow all select on bill_items" ON public.bill_items FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bill_items' AND policyname='Allow all insert on bill_items'
  ) THEN
    CREATE POLICY "Allow all insert on bill_items" ON public.bill_items FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bill_items' AND policyname='Allow all update on bill_items'
  ) THEN
    CREATE POLICY "Allow all update on bill_items" ON public.bill_items FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bill_items' AND policyname='Allow all delete on bill_items'
  ) THEN
    CREATE POLICY "Allow all delete on bill_items" ON public.bill_items FOR DELETE USING (true);
  END IF;
END$$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON public.bill_items(bill_id);
