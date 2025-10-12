import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const dbType = process.env.DB_TYPE || 'supabase';

let supabase = null;

if (dbType === 'supabase') {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase, dbType };

