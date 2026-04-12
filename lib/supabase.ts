import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cpmyyeottwnhyiwayjqm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwbXl5ZW90dHduaHlpd2F5anFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MTYwMzgsImV4cCI6MjA5MTQ5MjAzOH0.dBAHBLlJSSvkHnN_ORQJ6O6LSWILExO39pY1pADjKPA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);