// src/app.d.ts
// Simplified version without Supabase dependencies

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      // Removed Supabase dependencies
    }
    interface PageData {
      session: null;
      user: null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};