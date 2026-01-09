<script>
  import { goto } from '$app/navigation';
  import { t } from '$lib/i18n';
  import { auth } from '$lib/auth';
  
  let email = '';
  let phone = '';
  let loading = false;
  let errorMessage = '';
  
  /** @param {Event} e */
  async function handleLogin(e) {
    e.preventDefault();
    loading = true;
    errorMessage = '';
    
    if (!email.endsWith('@gmail.com')) {
      errorMessage = 'Please use a valid Gmail address';
      loading = false;
      return;
    }
    
    try {
      // Use our local auth store for login
      const result = await auth.login(email, phone);
      
      if (result.success) {
        // Redirect to home page
        goto('/');
      } else {
        errorMessage = result.message;
      }
    } catch (err) {
      console.error('Login error:', err);
      errorMessage = err.message || 'Failed to login';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>{$t('auth.login')} - {$t('main.title')}</title>
  <meta name="description" content="Sign in to your Currency Transfer App account using Gmail and phone number" />
</svelte:head>

<div class="flex items-center justify-center py-12">
  <div class="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden glass-card">
    <div class="p-1 bg-gradient-to-r from-cyan-500 to-blue-500">
      <div class="bg-white p-8 rounded-t-2xl">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">{$t('auth.welcome')}</h1>
          <p class="text-gray-600">{$t('auth.login')}</p>
        </div>

        {#if errorMessage}
          <div class="mb-6 p-3 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        {/if}

        <form on:submit={handleLogin}>
          <div class="mb-6">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              {$t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              bind:value={email}
              placeholder={$t('auth.emailPlaceholder')}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              required
            />
          </div>

          <div class="mb-6">
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
              {$t('auth.phone')}
            </label>
            <input
              id="phone"
              type="tel"
              bind:value={phone}
              placeholder={$t('auth.phonePlaceholder')}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {#if loading}
              <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {$t('common.loading')}
              </span>
            {:else}
              {$t('auth.loginButton')}
            {/if}
          </button>
        </form>
      </div>
    </div>
  </div>
</div>