// src/routes/+layout.ts
// Simplified version without Supabase dependencies
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
  /**
   * Simplified layout load without Supabase
   * The app will now work without authentication
   */
  
  return { 
    session: null,
    user: null
  };
};