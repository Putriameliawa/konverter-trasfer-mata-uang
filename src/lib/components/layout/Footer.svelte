<script>
  import { t } from '$lib/i18n';
  import Logo from '$lib/components/Logo.svelte';
</script>

<footer class="mt-auto py-8 text-center text-sky-500 text-sm relative z-10 glass-footer">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-center mb-3">
      <Logo size={30} animated={false} />
      <span class="ml-2 font-medium text-sky-600">{$t('main.title')}</span>
    </div>
    <p class="opacity-75">{$t('main.builtWith')}</p>
    <p class="mt-1 opacity-75">{$t('main.exchangeRatesBy')}</p>
    
    <!-- Creator Information -->
    <div class="mt-4 pt-4 border-t border-sky-200/50 max-w-xs mx-auto">
      <p class="text-sky-600 font-medium mb-1">{$t('main.createdBy')}</p>
      <p class="text-sky-700 font-semibold">{$t('main.creator')}</p>
      <p class="text-sky-500 text-xs mt-1">{$t('main.school')}</p>
    </div>
  </div>
</footer>

<style>
  .glass-footer {
    background: linear-gradient(to top, rgba(255,255,255,0.8), transparent);
    backdrop-filter: blur(4px);
  }
</style>
