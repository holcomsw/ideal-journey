import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hdkdsxnjpjvuutrotlar.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhka2RzeG5qcGp2dXV0cm90bGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTc0MjAsImV4cCI6MjA5NDUzMzQyMH0.-FxThAezM-QXw59ahxwtfOjJszgepEyGbhdQ3EvaFh8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
