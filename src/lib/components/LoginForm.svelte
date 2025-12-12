<script lang="js">
  import { auth } from '$lib/auth';
  import { goto } from '$app/navigation';
  import Logo from './Logo.svelte';
  import { t } from '$lib/i18n';
  import { onMount } from 'svelte';

  let email = '';
  let phone = '';
  let errorMessage = '';
  let successMessage = '';
  let isLoading = false;

  // Subscribe to auth store for loading state
  $: authState = $auth;
  $: isLoading = authState.isLoading;

  async function handleSubmit(event) {
    event.preventDefault();
    errorMessage = '';
    successMessage = '';

    if (!email.trim() || !phone.trim()) {
      errorMessage = $t('validation.required');
      return;
    }

    const result = await auth.login(email.trim(), phone.trim());
    
    if (result.success) {
      successMessage = result.message;
      // Redirect to main page after successful login
      setTimeout(() => {
        goto('/');
      }, 1000);
    } else {
      errorMessage = result.message;
    }
  }

  function formatPhoneInput(value) {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // If it doesn't start with +, add it
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  function handlePhoneInput(event) {
    const formatted = formatPhoneInput(event.target.value);
    phone = formatted;
    event.target.value = formatted;
  }
  
  onMount(() => {
    // Initialize auth store
    auth.init();
    
    // Check if already authenticated and redirect
    const unsubscribe = auth.subscribe(authState => {
      if (authState.isAuthenticated) {
        goto('/');
      }
    });
    
    return unsubscribe;
  });
</script>

<div class="min-h-screen flex items-center justify-center py-8 px-4 relative overflow-hidden">
  <!-- Background decorative elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-20 left-10 w-32 h-32 bg-sky-200/20 rounded-full blur-xl floating"></div>
    <div class="absolute top-40 right-20 w-24 h-24 bg-cyan-200/30 rounded-full blur-lg floating" style="animation-delay: -2s;"></div>
    <div class="absolute bottom-20 left-1/3 w-40 h-40 bg-blue-200/15 rounded-full blur-2xl floating" style="animation-delay: -4s;"></div>
  </div>

  <div class="w-full max-w-md relative z-10">
    <!-- Logo and Header -->
    <div class="text-center mb-8 floating">
      <div class="flex items-center justify-center mb-6 logo-glow">
        <Logo size={60} animated={true} />
      </div>
      <h1 class="text-3xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
        {$t('auth.welcomeBack')}
      </h1>
      <p class="text-sky-700 text-lg">
        {$t('auth.loginButton')}
      </p>
    </div>

    <!-- Login Form -->
    <div class="glass-card p-8 floating" style="animation-delay: -1s;">
      <form on:submit={handleSubmit} class="space-y-6">
        <!-- Gmail Input -->
        <div>
          <label for="email" class="block text-sm font-medium text-sky-800 mb-2">
            {$t('auth.email')}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              bind:value={email}
              placeholder={$t('auth.emailPlaceholder')}
              class="input-field pl-10"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <!-- Phone Number Input -->
        <div>
          <label for="phone" class="block text-sm font-medium text-sky-800 mb-2">
            {$t('auth.phone')}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <input
              id="phone"
              type="tel"
              bind:value={phone}
              on:input={handlePhoneInput}
              placeholder={$t('auth.phonePlaceholder')}
              class="input-field pl-10"
              required
              disabled={isLoading}
            />
          </div>
          <p class="text-xs text-sky-600 mt-1">
            Include country code (e.g., +1 for US, +62 for Indonesia)
          </p>
        </div>

        <!-- Error Message -->
        {#if errorMessage}
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm">{errorMessage}</span>
            </div>
          </div>
        {/if}

        <!-- Success Message -->
        {#if successMessage}
          <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-sm">{successMessage}</span>
            </div>
          </div>
        {/if}

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn-primary w-full relative"
          disabled={isLoading}
        >
          {#if isLoading}
            <div class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {$t('common.loading')}
            </div>
          {:else}
            {$t('auth.loginButton')}
          {/if}
        </button>
      </form>

      <!-- Security Notice -->
      <div class="mt-6 pt-6 border-t border-sky-100">
        <div class="text-center">
          <div class="flex items-center justify-center mb-2">
            <svg class="w-4 h-4 text-sky-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span class="text-sm text-sky-600 font-medium">{$t('common.info')}</span>
          </div>
          <p class="text-xs text-sky-500">
            Your information is stored locally and securely. We don't send your data to external servers.
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center mt-8 text-sky-500 text-sm floating" style="animation-delay: -3s;">
      <p>© 2024 Currency Transfer App. All rights reserved.</p>
    </div>
  </div>
</div>