# Supabase Integration Guide

This document explains how Supabase authentication has been integrated into the Currency Transfer App.

## Overview

The Currency Transfer App now uses Supabase for user authentication while maintaining backward compatibility with the existing localStorage-based system. This provides enhanced security and scalability.

## Key Components

### 1. Supabase Client (`src/lib/supabaseClient.ts`)

Initializes the Supabase client with environment variables:

```typescript
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY);
```

### 2. Authentication Store (`src/lib/auth.ts`)

Updated to work with both localStorage (legacy) and Supabase authentication:

- `init()` - Checks for Supabase session first, falls back to localStorage
- `login()` - Authenticates with Supabase and stores user data
- `logout()` - Signs out from Supabase and clears localStorage

### 3. Server Hooks (`src/hooks.server.ts`)

Handles server-side authentication with Supabase:

- Creates server-side Supabase client
- Implements safe session retrieval with JWT validation
- Protects routes based on authentication status

### 4. Layout Loaders (`src/routes/+layout.*`)

Manages client-side Supabase client initialization and auth state:

- `+layout.server.ts` - Server-side session handling
- `+layout.ts` - Client-side Supabase client initialization
- `+layout.svelte` - Auth state change listeners

### 5. Authentication Pages

- `/login` - Login page with Gmail and phone authentication
- `/auth/confirm` - Email confirmation route
- `/auth/error` - Authentication error page

## Environment Variables

Create a `.env` file with your Supabase credentials:

```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## Database Schema

The integration uses a `user_profiles` table to store additional user information:

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  address JSONB,
  occupation TEXT,
  emergency_contact JSONB,
  bank_account JSONB,
  preferred_bank JSONB,
  member_since TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  verification_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Migration Process

1. Users are authenticated through Supabase
2. User profile data is stored in the `user_profiles` table
3. Legacy localStorage data is still supported for backward compatibility
4. When a user logs in, their data is synchronized between Supabase and localStorage

## Security Features

- JWT token validation
- Row Level Security (RLS) for database protection
- Secure cookie-based session management
- Password hashing (handled by Supabase)

## Testing

A test page is available at `/test` to verify the Supabase connection.

## Future Improvements

- Implement real-time profile updates with Supabase Realtime
- Add social login options
- Implement password reset functionality
- Add multi-factor authentication