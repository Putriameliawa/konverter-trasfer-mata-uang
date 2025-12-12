<script>
  import { t } from '$lib/i18n';
  import { goto } from '$app/navigation';
  
  function goBack() {
    goto('/login');
  }
</script>

<svelte:head>
  <title>{$t('common.error')} - {$t('main.title')}</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 p-4">
  <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
    <div class="p-1 bg-gradient-to-r from-red-500 to-orange-500">
      <div class="bg-white p-8 rounded-t-2xl text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 class="text-2xl font-bold text-gray-800 mb-2">{$t('common.error')}</h1>
        <p class="text-gray-600 mb-8">
          {$t('auth.loginFailed')}
        </p>
        
        <button
          on:click={goBack}
          class="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 ease-in-out"
        >
          {$t('auth.login')}
        </button>
      </div>
    </div>
  </div>
</div>