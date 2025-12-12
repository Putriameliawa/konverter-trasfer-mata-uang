// Internationalization (i18n) system for Currency Transfer App

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Language interface
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// Available languages
export const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩'
  }
];

// Translation keys interface
export interface Translations {
  // Common
  common: {
    loading: string;
    save: string;
    cancel: string;
    edit: string;
    back: string;
    next: string;
    continue: string;
    close: string;
    yes: string;
    no: string;
    or: string;
    and: string;
    optional: string;
    required: string;
    search: string;
    filter: string;
    all: string;
    popular: string;
    select: string;
    none: string;
    unknown: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };

  // Navigation
  nav: {
    home: string;
    profile: string;
    verification: string;
    login: string;
    logout: string;
    backToMain: string;
    backToProfile: string;
  };

  // Authentication
  auth: {
    welcome: string;
    welcomeBack: string;
    login: string;
    logout: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    loginButton: string;
    loginSuccess: string;
    loginFailed: string;
    invalidEmail: string;
    invalidPhone: string;
    gmailRequired: string;
    sessionExpired: string;
  };

  // Main page
  main: {
    title: string;
    subtitle: string;
    howItWorks: string;
    step1Title: string;
    step1Description: string;
    step2Title: string;
    step2Description: string;
    step3Title: string;
    step3Description: string;
    transferSuccessful: string;
    transferred: string;
    builtWith: string;
    exchangeRatesBy: string;
  };

  // Currency conversion
  currency: {
    amount: string;
    fromCurrency: string;
    toCurrency: string;
    convertedAmount: string;
    exchangeRate: string;
    convert: string;
    transfer: string;
    invalidAmount: string;
    conversionError: string;
    exchangeRateError: string;
    converting: string;
    transferReady: string;
  };

  // Hand detection
  handDetection: {
    title: string;
    subtitle: string;
    instructions: string;
    showHand: string;
    handDetected: string;
    handLost: string;
    preparing: string;
    detecting: string;
    cameraAccess: string;
    cameraError: string;
    notSupported: string;
  };

  // Transfer
  transfer: {
    details: string;
    amount: string;
    from: string;
    to: string;
    status: string;
    waiting: string;
    detecting: string;
    success: string;
    failed: string;
    timeout: string;
    cancel: string;
    holdSteady: string;
  };

  // Profile
  profile: {
    title: string;
    subtitle: string;
    editSubtitle: string;
    personalInfo: string;
    address: string;
    bankingInfo: string;
    membershipInfo: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    occupation: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    memberSince: string;
    membershipDuration: string;
    lastLogin: string;
    accountStatus: string;
    active: string;
    notProvided: string;
    cannotChange: string;
    saveChanges: string;
    saving: string;
    profileUpdated: string;
    updateFailed: string;
    genderOptions: {
      male: string;
      female: string;
      other: string;
      preferNotToSay: string;
    };
  };

  // Banking
  banking: {
    bankSelection: string;
    preferredBank: string;
    primaryBankAccount: string;
    accountNumber: string;
    accountHolder: string;
    bankName: string;
    selectBank: string;
    noBank: string;
    setBankInProfile: string;
    bankInfo: string;
    atmVerification: string;
    verified: string;
    notVerified: string;
    verifyNow: string;
    bankTypes: {
      government: string;
      private: string;
      regional: string;
      foreign: string;
      syariah: string;
    };
  };

  // Biometric verification
  verification: {
    title: string;
    subtitle: string;
    atmCardInfo: string;
    biometricScanning: string;
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cardType: string;
    debitCard: string;
    creditCard: string;
    setupDetection: string;
    positionFaceAndPalm: string;
    faceDetected: string;
    palmDetected: string;
    showPalm: string;
    showFace: string;
    bothDetected: string;
    holdSteady: string;
    verificationComplete: string;
    verificationFailed: string;
    verificationProgress: string;
    initializeVerification: string;
    startCamera: string;
    captureVerification: string;
    tryAgain: string;
    redirecting: string;
    instructions: string;
    instruction1: string;
    instruction2: string;
    instruction3: string;
    instruction4: string;
    instruction5: string;
    timeRemaining: string;
    faceNotFound: string;
    palmNotFound: string;
    atmCardComplete: string;
    completeFields: string;
    cameraAccessDenied: string;
    detectionNotAvailable: string;
    verificationTimeout: string;
    captureSuccess: string;
    captureFailed: string;
    saveFailed: string;
  };

  // Language selector
  language: {
    selectLanguage: string;
    currentLanguage: string;
    changeLanguage: string;
  };

  // Validation messages
  validation: {
    required: string;
    invalidFormat: string;
    tooShort: string;
    tooLong: string;
    invalidEmail: string;
    invalidPhone: string;
    invalidDate: string;
    mustBePositive: string;
    selectOption: string;
  };

  // Time and date
  time: {
    seconds: string;
    minutes: string;
    hours: string;
    days: string;
    weeks: string;
    months: string;
    years: string;
    ago: string;
    in: string;
    now: string;
    today: string;
    yesterday: string;
    tomorrow: string;
  };
}

// Default language
const DEFAULT_LANGUAGE = 'en';

// Language store
function createLanguageStore() {
  const { subscribe, set, update } = writable<string>(DEFAULT_LANGUAGE);

  return {
    subscribe,
    
    // Initialize language from localStorage or browser preference
    init: () => {
      if (browser) {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && LANGUAGES.find(lang => lang.code === savedLanguage)) {
          set(savedLanguage);
        } else {
          // Try to detect browser language
          const browserLang = navigator.language.split('-')[0];
          const supportedLang = LANGUAGES.find(lang => lang.code === browserLang);
          set(supportedLang ? supportedLang.code : DEFAULT_LANGUAGE);
        }
      }
    },

    // Set language and persist to localStorage
    setLanguage: (langCode: string) => {
      const language = LANGUAGES.find(lang => lang.code === langCode);
      if (language) {
        set(langCode);
        if (browser) {
          localStorage.setItem('language', langCode);
        }
      }
    },

    // Get current language object
    getCurrentLanguage: () => {
      let currentLang = DEFAULT_LANGUAGE;
      subscribe(lang => currentLang = lang)();
      return LANGUAGES.find(lang => lang.code === currentLang) || LANGUAGES[0];
    }
  };
}

export const language = createLanguageStore();

// Translation store - will be populated with translation files
const translationsStore = writable<Record<string, Translations>>({});

// Current translations derived store
export const t = derived(
  [language, translationsStore],
  ([currentLang, translations]) => {
    const currentTranslations = translations[currentLang];
    
    // Return a function that can access nested translation keys
    return (key: string, params?: Record<string, string | number>) => {
      const keys = key.split('.');
      let value: any = currentTranslations;
      
      // Navigate through nested object
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Fallback to English if translation not found
          const fallback = translations['en'];
          if (fallback) {
            let fallbackValue: any = fallback;
            for (const fallbackKey of keys) {
              if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
                fallbackValue = fallbackValue[fallbackKey];
              } else {
                return key; // Return key if no translation found
              }
            }
            value = fallbackValue;
          } else {
            return key; // Return key if no translation found
          }
          break;
        }
      }
      
      // Handle parameterized translations
      if (typeof value === 'string' && params) {
        return Object.entries(params).reduce(
          (text, [param, val]) => text.replace(new RegExp(`{${param}}`, 'g'), String(val)),
          value
        );
      }
      
      return typeof value === 'string' ? value : key;
    };
  }
);

// Load translations function
export async function loadTranslations() {
  try {
    // Dynamic import of translation files
    const [enTranslations, idTranslations] = await Promise.all([
      import('./translations/en.json'),
      import('./translations/id.json')
    ]);

    translationsStore.set({
      en: enTranslations.default,
      id: idTranslations.default
    });
  } catch (error) {
    // Silent error handling for production
    // Initialize with basic fallback translations if files not found
    translationsStore.set({
      en: {
        language: {
          selectLanguage: 'Select Language',
          changeLanguage: 'Change Language'
        }
      } as any,
      id: {
        language: {
          selectLanguage: 'Pilih Bahasa',
          changeLanguage: 'Ubah Bahasa'
        }
      } as any
    });
  }
}

// Utility functions
export function formatDate(date: Date | string, langCode?: string): string {
  const lang = langCode || language.getCurrentLanguage().code;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  } catch {
    return dateObj.toLocaleDateString();
  }
}

export function formatCurrency(amount: number, currency: string, langCode?: string): string {
  const lang = langCode || language.getCurrentLanguage().code;
  
  try {
    return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatNumber(number: number, langCode?: string): string {
  const lang = langCode || language.getCurrentLanguage().code;
  
  try {
    return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US').format(number);
  } catch {
    return number.toString();
  }
}

// Auto-initialize when store is created
if (browser) {
  language.init();
  loadTranslations();
}