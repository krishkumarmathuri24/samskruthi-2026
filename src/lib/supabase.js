import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasCredentials =
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_project_url' &&
    supabaseAnonKey !== 'your_supabase_anon_key' &&
    supabaseUrl.startsWith('https://')

if (!hasCredentials) {
    console.warn(
        '⚠️  Supabase credentials not configured.\n' +
        'The app will run in DEMO mode (mock data shown, auth disabled).\n' +
        'To enable full features, update your .env file:\n' +
        '  VITE_SUPABASE_URL=https://your-project-id.supabase.co\n' +
        '  VITE_SUPABASE_ANON_KEY=your_actual_anon_key'
    )
}

// Use real credentials or safe fallback that won't crash the client constructor
export const supabase = createClient(
    hasCredentials ? supabaseUrl : 'https://placeholder.supabase.co',
    hasCredentials ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder',
    {
        auth: {
            persistSession: hasCredentials,
            autoRefreshToken: hasCredentials,
            detectSessionInUrl: true,
            storageKey: 'sk-auth-token',
        },
        realtime: {
            params: { eventsPerSecond: 10 },
        },
    }
)

export const isSupabaseConfigured = hasCredentials

export default supabase
