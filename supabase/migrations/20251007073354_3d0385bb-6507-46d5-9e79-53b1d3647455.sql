-- 1) Add farm_id to bills so each bill can be linked to a farm
ALTER TABLE public.bills
ADD COLUMN IF NOT EXISTS farm_id text;

-- 2) Ensure function creates ledger entries for both agent and farm
CREATE OR REPLACE FUNCTION public.create_bill_ledger_entry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Agent ledger: debit agent by total amount
  INSERT INTO public.ledger_entries (
    entity_type, entity_id, transaction_type, transaction_id, date, description, debit, credit
  ) VALUES (
    'agent',
    NEW.agent_id,
    'bill',
    NEW.bill_id,
    COALESCE(NEW.created_at::date, CURRENT_DATE),
    'Bill #' || NEW.bill_id || ' - ' || COALESCE(NEW.product_variety, 'Product') || ' (Qty: ' || NEW.quantity || ')',
    NEW.total,
    0
  );

  -- Farm ledger: credit farm with net payment if farm_id is provided
  IF NEW.farm_id IS NOT NULL AND NEW.farm_id <> '' THEN
    INSERT INTO public.ledger_entries (
      entity_type, entity_id, transaction_type, transaction_id, date, description, debit, credit
    ) VALUES (
      'farm',
      NEW.farm_id,
      'bill',
      NEW.bill_id,
      COALESCE(NEW.created_at::date, CURRENT_DATE),
      'Bill #' || NEW.bill_id || ' - ' || COALESCE(NEW.product_variety, 'Product') || ' (Qty: ' || NEW.quantity || ')',
      0,
      NEW.net_payment
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 3) Create triggers for vouchers and bills so ledger entries are auto-created
DROP TRIGGER IF EXISTS trigger_voucher_ledger ON public.vouchers;
CREATE TRIGGER trigger_voucher_ledger
AFTER INSERT ON public.vouchers
FOR EACH ROW
EXECUTE FUNCTION public.create_voucher_ledger_entry();

DROP TRIGGER IF EXISTS trigger_bill_ledger ON public.bills;
CREATE TRIGGER trigger_bill_ledger
AFTER INSERT ON public.bills
FOR EACH ROW
EXECUTE FUNCTION public.create_bill_ledger_entry();