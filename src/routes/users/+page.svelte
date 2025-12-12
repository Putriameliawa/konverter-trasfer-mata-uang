<script lang="js">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/auth';
  import { t } from '$lib/i18n';
  import UserDirectory from '$lib/components/UserDirectory.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import LanguageSelector from '$lib/components/LanguageSelector.svelte';
  
  $: authState = $auth;
  $: user = authState.user;
  
  onMount(() => {
    auth.init();
    const unsubscribe = auth.subscribe(authState => {
      if (!authState.isAuthenticated && !authState.isLoading) {
        goto('/login');
      }
    });
    return unsubscribe;
  });
  
  function goBack() {
    goto('/');
  }
  
  function handleUserSelect(selectedUser) {
    // Navigate to main page with selected user for transfer
    goto(`/?transferTo=${selectedUser.id}`);
  }
</script>

<svelte:head>
  <title>{$t('users.directory')} - {$t('main.title')}</title>
  <meta name="description" content="Browse and select users for currency transfers" />
</svelte:head>

<div class="min-h-screen py-8 px-4 relative overflow-hidden">
  <!-- Decorative background elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-20 left-10 w-32 h-32 bg-sky-200/20 rounded-full blur-xl floating"></div>
    <div class="absolute top-40 right-20 w-24 h-24 bg-cyan-200/30 rounded-full blur-lg floating" style="animation-delay: -2s;"></div>
    <div class="absolute bottom-20 left-1/3 w-40 h-40 bg-blue-200/15 rounded-full blur-2xl floating" style="animation-delay: -4s;"></div>
  </div>
  
  <div class="container mx-auto max-w-6xl relative z-10">
    <!-- Header -->
    <header class="mb-8 floating">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <LanguageSelector />
          {#if user}
            <div class="text-right text-sm">
              <p class="text-sky-600">{$t('auth.welcomeBack')}</p>
              <p class="font-semibold text-sky-800">{user.email}</p>
            </div>
          {/if}
        </div>

        <button
          on:click={goBack}
          class="btn-secondary flex items-center space-x-2"
        >
          <span>{$t('nav.backToMain')}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div class="text-center">
        <div class="flex items-center justify-center mb-4 logo-glow">
          <Logo size={60} animated={true} />
        </div>
        
        <h1 class="text-4xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          {$t('users.directory')}
        </h1>
        <p class="text-sky-700 text-lg">
          {$t('users.findAndSelectUsers')}
        </p>
        <div class="w-24 h-1 bg-gradient-to-r from-sky-300 to-cyan-400 mx-auto mt-4 rounded-full"></div>
      </div>
    </header>
    
    <!-- Main Content -->
    <div class="floating" style="animation-delay: -1s;">
      <UserDirectory 
        showSelectButton={true}
        onUserSelect={handleUserSelect}
        currentUserId={user?.id}
      />
    </div>
    
    <!-- Instructions -->
    <div class="glass-card p-6 mt-8 floating" style="animation-delay: -2s;">
      <h3 class="text-lg font-semibold text-sky-800 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {$t('users.howToUse')}
      </h3>
      <div class="grid md:grid-cols-3 gap-4 text-sm text-sky-600">
        <div class="flex items-start space-x-3">
          <span class="text-xl">🔍</span>
          <div>
            <h4 class="font-medium text-sky-800">{$t('users.step1Title')}</h4>
            <p>{$t('users.step1Description')}</p>
          </div>
        </div>
        
        <div class="flex items-start space-x-3">
          <span class="text-xl">👤</span>
          <div>
            <h4 class="font-medium text-sky-800">{$t('users.step2Title')}</h4>
            <p>{$t('users.step2Description')}</p>
          </div>
        </div>
        
        <div class="flex items-start space-x-3">
          <span class="text-xl">💸</span>
          <div>
            <h4 class="font-medium text-sky-800">{$t('users.step3Title')}</h4>
            <p>{$t('users.step3Description')}</p>
          </div>
        </div>
      </div>
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
  .floating {
    animation: floating 6s ease-in-out infinite;
  }

  @keyframes floating {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .btn-secondary {
    background-color: rgb(224 242 254);
    color: rgb(3 105 161);
    font-weight: 500;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    transition: colors 200ms;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .btn-secondary:hover {
    background-color: rgb(186 230 253);
  }

  .logo-glow {
    filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.3));
  }
</style>