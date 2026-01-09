<script>
  import { t } from '$lib/i18n';
  import Logo from '$lib/components/Logo.svelte';
  import LanguageSelector from '$lib/components/LanguageSelector.svelte';
  import { auth } from '$lib/auth';
  import { getBankById } from '$lib/banks';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  $: authState = $auth;
  $: user = authState.user;
  $: preferredBank = user?.profile?.preferredBank?.bankId ? getBankById(user.profile.preferredBank.bankId) : null;
  
  function handleLogout() {
    auth.logout();
    goto('/login');
  }

  $: activeRoute = $page.url.pathname;
</script>

<nav class="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
  <div class="container mx-auto px-4 py-3">
    <div class="flex justify-between items-center">
      <!-- Logo and Brand -->
      <a href="/" class="flex items-center space-x-2 group">
        <Logo size={40} animated={true} />
        <span class="font-bold text-xl bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent group-hover:from-sky-500 group-hover:to-blue-500 transition-all">
          {$t('main.title')}
        </span>
      </a>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-6">
        {#if user}
           <a 
            href="/users" 
            class="nav-link {activeRoute === '/users' ? 'active' : ''}"
          >
            {$t('nav.users')}
          </a>
          <a 
            href="/history" 
            class="nav-link {activeRoute === '/history' ? 'active' : ''}"
          >
            {$t('nav.history')}
          </a>
          
          <div class="h-6 w-px bg-slate-300 mx-2"></div>
          
          <!-- User Profile Summary -->
          <div class="flex items-center space-x-4">
             <a href="/profile" class="flex items-center space-x-2 text-sm text-sky-700 hover:text-sky-900 transition-colors">
               {#if preferredBank}
                  <span class="text-lg">{preferredBank.logo}</span>
               {/if}
               <span class="font-medium hidden lg:inline">{user.email}</span>
             </a>
             
             <button 
               on:click={handleLogout}
               class="p-2 text-sky-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
               title="{$t('nav.logout')}"
             >
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
             </button>
          </div>
        {/if}
        
        <LanguageSelector />
      </div>
    </div>
  </div>
</nav>

<style>
  .nav-link {
    @apply text-slate-600 font-medium transition-colors relative py-1;
  }
  
  .nav-link.active {
    @apply text-sky-700;
  }
  
  .nav-link::after {
    content: '';
    @apply absolute bottom-0 left-0 w-0 h-0.5 bg-sky-500 transition-all duration-300 rounded-full;
  }
  
  .nav-link:hover::after, .nav-link.active::after {
    @apply w-full;
  }
</style>
