// src/routes/login/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    // Basic validation
    if (!email || !email.endsWith('@gmail.com')) {
      return { success: false, message: 'Please use a valid Gmail address' };
    }

    if (!phone) {
      return { success: false, message: 'Phone number is required' };
    }

    // In a real implementation with Supabase, you would:
    // 1. Sign up or sign in the user
    // 2. Store additional user metadata
    
    // For now, we're redirecting to home page after "login"
    // The actual authentication is handled client-side to maintain compatibility
    throw redirect(303, '/');
  }
};