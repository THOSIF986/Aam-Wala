-- Update bill ledger function to use net_payment for agent debit
CREATE OR REPLACE FUNCTION public.create_bill_ledger_entry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Agent ledger: debit agent by net_payment (not total)
  INSERT INTO public.ledger_entries (
    entity_type, entity_id, transaction_type, transaction_id, date, description, debit, credit
  ) VALUES (
    'agent',
    NEW.agent_id,
    'bill',
    NEW.bill_id,
    COALESCE(NEW.created_at::date, CURRENT_DATE),
    'Bill #' || NEW.bill_id,
    NEW.net_payment,
    0
  );

  -- Farm ledger: credit farm with net_payment if farm_id is provided
  IF NEW.farm_id IS NOT NULL AND NEW.farm_id <> '' THEN
    INSERT INTO public.ledger_entries (
      entity_type, entity_id, transaction_type, transaction_id, date, description, debit, credit
    ) VALUES (
      'farm',
      NEW.farm_id,
      'bill',
      NEW.bill_id,
      COALESCE(NEW.created_at::date, CURRENT_DATE),
      'Bill #' || NEW.bill_id,
      0,
      NEW.net_payment
    );
  END IF;

  RETURN NEW;
END;
$$;