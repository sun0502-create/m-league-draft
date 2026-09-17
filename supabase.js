import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yhredcassbwiwmotryva.supabase.co'
const supabaseKey = 'sb_publishable_UTa6y3zuD7ZgMfHYoXLeJg_Bo8sDMVa'

export const supabase =
    createClient(
        supabaseUrl,
        supabaseKey,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );