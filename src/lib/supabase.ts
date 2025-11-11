import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export { supabase };

// Database Types
export interface Farm {
  id: string
  farm_id: string
  owner_name: string
  location: string
  area: number
  price: number
  lease_start_date: string
  lease_end_date: string
  guarantor: string
  crop_type: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  agent_id: string
  company_name: string
  agent_name: string
  mobile: string
  guarantor: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Voucher {
  id: string
  voucher_id: string
  linked_to: 'farm' | 'agent'
  linked_id: string
  type: 'expense' | 'income'
  date: string
  reason: string
  description?: string
  payment_mode: 'cash' | 'bank' | 'cheque'
  amount: number
  created_at: string
  updated_at: string
}

export interface BillItem {
  id: string
  bill_id: string
  product_variety: string
  quantity: number
  rate: number
  total: number
  created_at: string
}

export interface Bill {
  id: string
  bill_id: string
  agent_id: string
  farm_id?: string
  vehicle_number: string
  arrival_number: string
  product_variety: string
  unloading_amount: number
  advance: number
  quantity: number
  rate: number
  total: number
  net_payment: number
  created_at: string
  updated_at: string
  bill_items?: BillItem[]
}

export interface CuttingSchedule {
  id: string
  farm_id: string
  cutting_date: string
  crop_type: string
  expected_quantity: number
  status: 'scheduled' | 'in_progress' | 'completed'
  notes?: string
  created_at: string
  updated_at: string
}

export interface LedgerEntry {
  id: string
  entity_type: 'farm' | 'agent'
  entity_id: string
  transaction_type: 'voucher' | 'bill'
  transaction_id: string
  date: string
  description: string
  debit: number
  credit: number
  created_at: string
}