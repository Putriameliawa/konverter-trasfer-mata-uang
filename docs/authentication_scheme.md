# Authentication Scheme with Supabase

## Current Authentication Analysis

The current authentication system in the Currency Transfer App uses a client-side only approach with localStorage for session management. Key features include:

- **Login Requirements**: Gmail address and phone number
- **Session Management**: 24-hour session stored in localStorage
- **Data Structure**: User profile with personal information, bank details, and verification data
- **Security**: Client-side validation only, no server-side authentication
- **Implementation**: Custom Svelte store (`auth.ts`) with manual state management

## Proposed Supabase Authentication Scheme

### Architecture Overview

```
Client (SvelteKit) → Supabase Auth → PostgreSQL Database
       ↑                ↓
   Session Cookies ← JWT Tokens
```

### Implementation Components

1. **Supabase Configuration**
   - Environment variables for Supabase URL and publishable key
   - SSR integration using @supabase/ssr package
   - Cookie-based session management

2. **Server-Side Hooks** (`src/hooks.server.ts`)
   - Create server-side Supabase client
   - Handle authentication state
   - Protect routes based on authentication status

3. **Type Definitions** (`src/app.d.ts`)
   - Extend App.Locals with Supabase client and session data
   - Define types for session and user objects

4. **Layout Load Functions**
   - `+layout.server.ts`: Server-side session handling
   - `+layout.ts`: Client-side Supabase client initialization
   - `+layout.svelte`: Auth state change listeners

5. **Authentication Pages**
   - Login page with email/password authentication
   - Signup confirmation route
   - Error handling pages

### Migration Plan from Current System

| Current Feature | Supabase Equivalent |
|----------------|-------------------|
| Gmail + Phone login | Email-only login with custom phone field in user metadata |
| localStorage session | Secure JWT cookies managed by Supabase |
| 24-hour session timeout | Configurable session length in Supabase dashboard |
| Manual profile storage | Supabase auth.users table with custom user metadata |
| Client-side validation | Server-side RLS (Row Level Security) + client validation |

### Data Migration Strategy

1. **User Data Mapping**

```typescript
// Current user structure → Supabase user metadata
{
  email: string,
  phone: string,
  loginTime: Date,
  profile: {
    fullName: string,
    dateOfBirth: string,
    gender: string,
    nationality: string,
    address: { /* ... */ },
    occupation: string,
    emergencyContact: { /* ... */ },
    bankAccount: { /* ... */ },
    preferredBank: { /* ... */ },
    memberSince: Date,
    lastLogin: Date,
    verificationData: { /* ... */ }
  }
}

// Migrates to Supabase user metadata format
{
  "full_name": string,
  "phone": string,
  "date_of_birth": string,
  "gender": string,
  "nationality": string,
  "address": { /* ... */ },
  "occupation": string,
  "emergency_contact": { /* ... */ },
  "bank_account": { /* ... */ },
  "preferred_bank": { /* ... */ },
  "member_since": string,
  "last_login": string,
  "verification_data": { /* ... */ }
}
```

2. **Database Schema**

```sql
-- Users table (handled by Supabase Auth)
-- Extended with RLS policies

-- Additional tables for application data
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

-- Row Level Security policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Implementation Steps

1. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

2. **Configure Environment Variables**
   Create `.env.local`:
   ```
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```

3. **Set Up Server Hooks** (`src/hooks.server.ts`)
   - Initialize Supabase server client
   - Implement safe session retrieval
   - Set up route protection

4. **Update Type Definitions** (`src/app.d.ts`)
   - Extend App.Locals with Supabase types
   - Define session and user interfaces

5. **Implement Layout Loaders**
   - Create `+layout.server.ts` for server-side session handling
   - Create `+layout.ts` for client-side Supabase client
   - Add auth state listeners in `+layout.svelte`

6. **Create Authentication Pages**
   - Login/signup page with form handling
   - Email confirmation route
   - Password reset functionality

7. **Migrate User Data**
   - Update profile management functions to use Supabase
   - Modify data access patterns to use Supabase client
   - Implement data synchronization between localStorage and Supabase

8. **Update Route Protection**
   - Replace client-side auth checks with server-side validation
   - Implement proper redirect logic
   - Update all protected routes

### Security Benefits

- **Secure Session Management**: JWT tokens stored in HTTP-only cookies
- **Server-Side Validation**: All authentication decisions made on server
- **Row Level Security**: Database-level protection of user data
- **Built-in Security Features**: Password hashing, brute force protection, etc.
- **Regular Security Updates**: Automatic security patches from Supabase

### Advantages Over Current System

| Aspect | Current System | Supabase | Improvement |
|-------|---------------|---------|------------|
| Security | Client-side only | Server-side + RLS | Significantly enhanced |
| Session Management | localStorage | Secure cookies | Protected against XSS |
| Scalability | Limited to client | Cloud infrastructure | Handles growth easily |
| Maintenance | Manual updates | Automated updates | Less developer overhead |
| Features | Basic auth | Social login, MFA, etc. | Rich feature set |
| Compliance | Manual implementation | Built-in compliance | Easier to meet standards |

This migration will provide a more secure, scalable, and maintainable authentication system while preserving the core user experience of the Currency Transfer App.