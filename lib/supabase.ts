
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ojngpcvmphomkoanrzwk.supabase.co';
const supabaseAnonKey = 'sb_publishable_fyY_uf4_31RIv2slD_2bQQ_g6QoGFfi';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
