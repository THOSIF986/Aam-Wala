-- Fix search_path for voucher ledger function
CREATE OR REPLACE FUNCTION public.create_voucher_ledger_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ledger_entries (
    entity_type,
    entity_id,
    transaction_type,
    transaction_id,
    date,
    description,
    debit,
    credit
  ) VALUES (
    NEW.linked_to,
    NEW.linked_id,
    'voucher',
    NEW.voucher_id,
    NEW.date,
    NEW.reason || COALESCE(' - ' || NEW.description, ''),
    CASE WHEN NEW.type = 'expense' THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE 0 END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix search_path for bill ledger function
CREATE OR REPLACE FUNCTION public.create_bill_ledger_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ledger_entries (
    entity_type,
    entity_id,
    transaction_type,
    transaction_id,
    date,
    description,
    debit,
    credit
  ) VALUES (
    'agent',
    NEW.agent_id,
    'bill',
    NEW.bill_id,
    CURRENT_DATE,
    'Bill #' || NEW.bill_id || ' - ' || COALESCE(NEW.product_variety, 'Product') || ' (Qty: ' || NEW.quantity || ')',
    NEW.total,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;