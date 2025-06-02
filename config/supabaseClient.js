// config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Optional: Configure auth settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  // Optional: Configure storage settings
  storage: {
    // Set to true if you want to automatically handle file type detection
    autoDetectContentType: true
  }
});

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const user = await getCurrentUser();
    return !!user;        
  } catch (error) {
    return false;
  }
};

export default supabase;