import { createClient } from '@supabase/supabase-js';

// URL de tu proyecto Architrack
const supabaseUrl = 'https://jphemhgubueqxkcahjqg.supabase.co';

// Clave 'anon public' proporcionada
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwaGVtaGd1YnVlcXhrY2FoanFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDU5NjgsImV4cCI6MjA3OTU4MTk2OH0.TOE0VQnA92W9ffIcx2UqRqhBuV5FWAmbgbjr1njdZts';

export const supabase = createClient(supabaseUrl, supabaseKey);