<script lang="js">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/auth';
  import { t } from '$lib/i18n';
  import TransferHistory from '$lib/components/TransferHistory.svelte';
  
  // Auth state
  $: authState = $auth;
  $: user = authState.user;
  
  onMount(() => {
    // Initialize auth store
    auth.init();
    
    // Check authentication status and redirect if needed
    const unsubscribe = auth.subscribe(authState => {
      if (!authState.isAuthenticated && !authState.isLoading) {
        goto('/login');
      }
    });
    
    return unsubscribe;
  });
</script>

<svelte:head>
  <title>Transfer History - Currency Transfer App</title>
  <meta name="description" content="View your complete transfer history and transaction records" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 py-8 px-4">
  <div class="container mx-auto max-w-6xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Transfer History
        </h1>
        <p class="text-sky-700 mt-2">
          View and manage your complete transaction history
        </p>
      </div>
      
      <div class="flex items-center space-x-3">
        <a
          href="/users"
          class="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span>{$t('nav.users')}</span>
        </a>
        
        <a
          href="/"
          class="px-4 py-2 text-sm bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>{$t('nav.backToMain')}</span>
        </a>
      </div>
    </div>
    
    <!-- User Info -->
    {#if user}
      <div class="bg-white rounded-lg shadow-sm border border-sky-200 p-4 mb-6">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p class="font-medium text-sky-800">{user.email}</p>
            <p class="text-sm text-sky-600">Complete transaction history for your account</p>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Transfer History Component -->
    <TransferHistory userId={null} showFilters={true} compact={false} />
    
    <!-- Quick Actions -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- New Transfer -->
      <a
        href="/"
        class="block bg-white rounded-lg shadow-sm border border-sky-200 hover:border-sky-300 p-6 text-center transition-colors duration-200"
      >
        <div class="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 class="font-medium text-sky-800 mb-2">New Transfer</h3>
        <p class="text-sm text-sky-600">Start a new currency transfer</p>
      </a>
      
      <!-- User Directory -->
      <a
        href="/users"
        class="block bg-white rounded-lg shadow-sm border border-blue-200 hover:border-blue-300 p-6 text-center transition-colors duration-200"
      >
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 class="font-medium text-blue-800 mb-2">Find Users</h3>
        <p class="text-sm text-blue-600">Browse users for transfers</p>
      </a>
      
      <!-- Verification -->
      <a
        href="/verification"
        class="block bg-white rounded-lg shadow-sm border border-purple-200 hover:border-purple-300 p-6 text-center transition-colors duration-200"
      >
        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 class="font-medium text-purple-800 mb-2">Verification</h3>
        <p class="text-sm text-purple-600">Manage biometric security</p>
      </a>
    </div>
    
    <!-- Footer -->
    <footer class="text-center mt-12 text-sky-500 text-sm">
      <div class="mt-4 pt-4 border-t border-sky-200">
        <p class="text-sky-600 font-medium mb-1">Dibuat oleh</p>
        <p class="text-sky-700 font-semibold">Putri Amelia</p>
        <p class="text-sky-500 text-xs mt-1">MA KHA WAHID HASYIM BANGIL</p>
      </div>
    </footer>
  </div>
</div>

<style>
  :global(body) {
    @apply bg-gradient-to-br from-sky-50 via-white to-cyan-50;
  }
</style>