import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lcuvsyxakhuwxdrmsjod.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdXZzeXhha2h1d3hkcm1zam9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwOTg1NDQsImV4cCI6MjA2MTY3NDU0NH0.ItY1nRs2xh06cFQph2YqnH2B3vRdCcaG7durMIqDUZ0'

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase