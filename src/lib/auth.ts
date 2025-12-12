import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
// Removed Supabase import

export interface User {
  email: string;
  phone: string;
  loginTime: Date;
  profile: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    occupation: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
    bankAccount: {
      accountNumber: string;
      bankName: string;
      accountHolder: string;
    };
    preferredBank?: {
      bankId: string;
      bankName: string;
      accountNumber?: string;
      accountHolder?: string;
    };
    memberSince: Date;
    lastLogin: Date;
    verificationData?: {
      biometric?: any;
      atmCard?: {
        cardNumber: string;
        cardHolder: string;
        expiryDate: string;
        issuerBank: string;
        selectedBankId: string;
        cardType: string;
      };
      timestamp: Date;
      verified: boolean;
    };
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    
    // Initialize auth state from localStorage only (no Supabase)
    init: async () => {
      if (browser) {
        // Check localStorage for saved auth state
        const savedAuth = localStorage.getItem('auth');
        if (savedAuth) {
          try {
            const parsedAuth = JSON.parse(savedAuth);
            // Check if login is still valid (24 hours)
            const loginTime = new Date(parsedAuth.user?.loginTime);
            const now = new Date();
            const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
              set({
                isAuthenticated: true,
                user: {
                  ...parsedAuth.user,
                  loginTime: loginTime
                },
                isLoading: false
              });
            } else {
              // Session expired
              localStorage.removeItem('auth');
            }
          } catch (error) {
            localStorage.removeItem('auth');
          }
        }
      }
    },

    // Login with Gmail and phone (no Supabase)
    login: async (email: string, phone: string): Promise<{ success: boolean; message: string }> => {
      update(state => ({ ...state, isLoading: true }));

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        // Basic validation
        if (!isValidEmail(email)) {
          update(state => ({ ...state, isLoading: false }));
          return { success: false, message: 'Please enter a valid Gmail address' };
        }

        if (!isValidPhone(phone)) {
          update(state => ({ ...state, isLoading: false }));
          return { success: false, message: 'Please enter a valid phone number' };
        }

        // Check if email is Gmail
        if (!email.toLowerCase().endsWith('@gmail.com')) {
          update(state => ({ ...state, isLoading: false }));
          return { success: false, message: 'Please use a Gmail address' };
        }

        // Create user object
        const user: User = {
          email,
          phone,
          loginTime: new Date(),
          profile: {
            fullName: '',
            dateOfBirth: '',
            gender: '',
            nationality: '',
            address: {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: ''
            },
            occupation: '',
            emergencyContact: {
              name: '',
              relationship: '',
              phone: ''
            },
            bankAccount: {
              accountNumber: '',
              bankName: '',
              accountHolder: ''
            },
            preferredBank: {
              bankId: '',
              bankName: '',
              accountNumber: '',
              accountHolder: ''
            },
            memberSince: new Date(),
            lastLogin: new Date()
          }
        };

        const authState: AuthState = {
          isAuthenticated: true,
          user,
          isLoading: false
        };

        // Save to store and localStorage
        set(authState);
        if (browser) {
          localStorage.setItem('auth', JSON.stringify(authState));
        }

        return { success: true, message: 'Login successful!' };
      } catch (error) {
        update(state => ({ ...state, isLoading: false }));
        return { success: false, message: 'Login failed. Please try again.' };
      }
    },

    // Logout
    logout: () => {
      set(initialState);
      if (browser) {
        localStorage.removeItem('auth');
        goto('/login');
      }
    },

    // Update user profile
    updateProfile: async (profileData: Partial<User['profile']>): Promise<{ success: boolean; message: string }> => {
      try {
        update(state => {
          if (state.user) {
            const updatedUser = {
              ...state.user,
              profile: {
                ...state.user.profile,
                ...profileData,
                lastLogin: new Date()
              }
            };
            
            const newState = {
              ...state,
              user: updatedUser
            };
            
            // Save to localStorage
            if (browser) {
              localStorage.setItem('auth', JSON.stringify(newState));
            }
            
            return newState;
          }
          return state;
        });
        
        return { success: true, message: 'Profile updated successfully!' };
      } catch (error) {
        return { success: false, message: 'Failed to update profile. Please try again.' };
      }
    },

    // Clear loading state
    clearLoading: () => {
      update(state => ({ ...state, isLoading: false }));
    }
  };
}

// Helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it's a valid phone number (10-15 digits, optionally starting with +)
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  return phoneRegex.test(cleanPhone);
}

export const auth = createAuthStore();

// Auto-initialize when store is created
if (browser) {
  auth.init();
}