<script lang="js">
  import { language, LANGUAGES, t } from '$lib/i18n';
  import { onMount } from 'svelte';

  let isOpen = false;
  let currentLanguage = 'en';

  // Subscribe to language changes
  const unsubscribe = language.subscribe(lang => {
    currentLanguage = lang;
  });

  onMount(() => {
    return unsubscribe;
  });

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function selectLanguage(langCode) {
    language.setLanguage(langCode);
    isOpen = false;
  }

  function closeDropdown() {
    isOpen = false;
  }

  function handleClickOutside(event) {
    if (!event.target.closest('.language-selector')) {
      closeDropdown();
    }
  }

  // Get current language object
  $: currentLangObj = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];
</script>

<svelte:window on:click={handleClickOutside} />

<div class="language-selector relative">
  <!-- Language Toggle Button -->
  <button
    type="button"
    on:click={toggleDropdown}
    class="flex items-center space-x-2 px-3 py-2 text-sm text-sky-700 rounded-lg transition-all duration-300 backdrop-blur-sm border border-sky-200/50 shadow-sm hover:shadow-md {isOpen ? 'bg-white/90 shadow-md' : 'bg-white/70 hover:bg-white/90'}"
    aria-label="{$t('language.selectLanguage') || 'Select Language'}"
  >
    <span class="text-lg">{currentLangObj.flag}</span>
    <span class="font-medium">{currentLangObj.code.toUpperCase()}</span>
    <svg 
      class="w-4 h-4 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <!-- Language Dropdown -->
  {#if isOpen}
    <div class="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl border border-sky-200 rounded-xl shadow-2xl z-50 overflow-hidden">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-sky-100 bg-sky-50/50">
        <h3 class="text-sm font-medium text-sky-800">{$t('language.selectLanguage') || 'Select Language'}</h3>
      </div>

      <!-- Language Options -->
      <div class="py-2">
        {#each LANGUAGES as lang (lang.code)}
          <button
            type="button"
            on:click={() => selectLanguage(lang.code)}
            class="w-full px-4 py-3 hover:bg-sky-50 transition-colors duration-200 text-left group flex items-center space-x-3 {currentLanguage === lang.code ? 'bg-sky-100/70 text-sky-800' : 'text-sky-700'}"
          >
            <span class="text-xl">{lang.flag}</span>
            <div class="flex-1">
              <div class="font-medium {currentLanguage === lang.code ? 'text-sky-900' : 'text-sky-800'} group-hover:text-sky-900">
                {lang.name}
              </div>
              <div class="text-xs text-sky-600 group-hover:text-sky-700">
                {lang.nativeName}
              </div>
            </div>
            {#if currentLanguage === lang.code}
              <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Footer -->
      <div class="px-4 py-2 border-t border-sky-100 bg-sky-50/30">
        <div class="text-xs text-sky-600 text-center">
          {$t('language.changeLanguage') || 'Change Language'}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .rotate-180 {
    transform: rotate(180deg);
  }
</style>