import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/integrations/supabase/types';

type PublicTables = Database['public']['Tables'];
type TableName = keyof PublicTables;
type TableRow<T extends TableName> = PublicTables[T]['Row'];
type TableInsert<T extends TableName> = PublicTables[T]['Insert'];

export async function fetchRows<T extends TableName>(table: T): Promise<TableRow<T>[]> {
  const { data, error } = await supabase.from(table).select('*');

  if (error) {
    throw error;
  }

  return (data ?? []) as TableRow<T>[];
}

export async function insertRow<T extends TableName>(table: T, values: TableInsert<T>): Promise<TableRow<T>> {
  const { data, error } = await supabase.from(table).insert(values).select().single();

  if (error) {
    throw error;
  }

  return data as TableRow<T>;
}
