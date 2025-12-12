<script lang="js">
  import { INDONESIAN_BANKS, BANK_TYPES, getBanksByType, getPopularBanks, searchBanks, getBankById } from '$lib/banks';
  import { t } from '$lib/i18n';

  export let selectedBankId = '';
  export let onBankSelect = null;
  export let placeholder = 'Select your bank';
  export let required = false;
  export let disabled = false;

  let isOpen = false;
  let searchQuery = '';
  let filteredBanks = INDONESIAN_BANKS;
  let activeFilter = 'all';
  let searchInput;

  $: selectedBank = selectedBankId ? getBankById(selectedBankId) : null;
  
  // Filter banks based on search and category
  $: {
    if (searchQuery.trim()) {
      filteredBanks = searchBanks(searchQuery);
    } else {
      switch (activeFilter) {
        case 'popular':
          filteredBanks = getPopularBanks();
          break;
        case 'government':
        case 'private':
        case 'regional':
        case 'foreign':
        case 'syariah':
          filteredBanks = getBanksByType(activeFilter);
          break;
        default:
          filteredBanks = INDONESIAN_BANKS;
      }
    }
  }

  function openDropdown() {
    if (disabled) return;
    isOpen = true;
    setTimeout(() => {
      if (searchInput) searchInput.focus();
    }, 100);
  }

  function closeDropdown() {
    isOpen = false;
    searchQuery = '';
    activeFilter = 'all';
  }

  function selectBank(bank) {
    selectedBankId = bank.id;
    if (onBankSelect) {
      onBankSelect(bank);
    }
    closeDropdown();
  }

  function handleClickOutside(event) {
    if (!event.target.closest('.bank-selector')) {
      closeDropdown();
    }
  }

  function setFilter(filter) {
    activeFilter = filter;
    searchQuery = '';
  }

  function getBankTypeCount(type) {
    return getBanksByType(type).length;
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="bank-selector relative">
  <label class="block text-sm font-medium text-sky-700 mb-2">
    {$t('banking.bankSelection')} {required ? '*' : ''}
  </label>
  
  <!-- Selected Bank Display / Trigger -->
  <button
    type="button"
    on:click={openDropdown}
    class="w-full px-4 py-3 text-left border border-sky-200 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all duration-300 outline-none bg-white/70 backdrop-blur-sm {disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/90 cursor-pointer'}"
    class:border-sky-400={isOpen}
    disabled={disabled}
  >
    <div class="flex items-center justify-between">
      {#if selectedBank}
        <div class="flex items-center space-x-3">
          <span class="text-2xl">{selectedBank.logo}</span>
          <div>
            <div class="font-medium text-sky-800">{selectedBank.name}</div>
            <div class="text-sm text-sky-600">{selectedBank.fullName}</div>
          </div>
          <span 
            class="px-2 py-1 text-xs rounded-full text-white"
            style="background-color: {selectedBank.color}"
          >
            {BANK_TYPES[selectedBank.type].label}
          </span>
        </div>
      {:else}
        <span class="text-sky-500">{placeholder}</span>
      {/if}
      
      <svg 
        class="w-5 h-5 text-sky-400 transition-transform duration-200"
        class:rotate-180={isOpen}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </button>

  <!-- Dropdown Panel -->
  {#if isOpen}
    <div class="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-sky-200 rounded-xl shadow-2xl max-h-96 overflow-hidden">
      <!-- Search Bar -->
      <div class="p-4 border-b border-sky-100">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            bind:this={searchInput}
            bind:value={searchQuery}
            type="text"
            placeholder="Search banks..."
            class="w-full pl-10 pr-4 py-2 border border-sky-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none"
          />
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex overflow-x-auto p-4 space-x-2 border-b border-sky-100">
        <button
          on:click={() => setFilter('all')}
          class="flex-shrink-0 px-3 py-1 text-sm rounded-full transition-colors {activeFilter === 'all' ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'}"
        >
          All ({INDONESIAN_BANKS.length})
        </button>
        <button
          on:click={() => setFilter('popular')}
          class="flex-shrink-0 px-3 py-1 text-sm rounded-full transition-colors {activeFilter === 'popular' ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'}"
        >
          Popular ({getPopularBanks().length})
        </button>
        {#each Object.entries(BANK_TYPES) as [type, config]}
          <button
            on:click={() => setFilter(type)}
            class="flex-shrink-0 px-3 py-1 text-sm rounded-full transition-colors {activeFilter === type ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'}"
          >
            {config.label} ({getBankTypeCount(type)})
          </button>
        {/each}
      </div>

      <!-- Bank List -->
      <div class="max-h-64 overflow-y-auto">
        {#if filteredBanks.length === 0}
          <div class="p-4 text-center text-sky-500">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15a7.962 7.962 0 01-5-1.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            No banks found
          </div>
        {:else}
          {#each filteredBanks as bank (bank.id)}
            <button
              type="button"
              on:click={() => selectBank(bank)}
              class="w-full p-4 hover:bg-sky-50 transition-colors duration-200 border-b border-sky-50 last:border-b-0 text-left group"
            >
              <div class="flex items-center space-x-4">
                <span class="text-3xl">{bank.logo}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <span class="font-semibold text-sky-800 group-hover:text-sky-900">{bank.name}</span>
                    {#if bank.popular}
                      <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                        ⭐ Popular
                      </span>
                    {/if}
                  </div>
                  <div class="text-sm text-sky-600 mb-1">{bank.fullName}</div>
                  <div class="text-xs text-sky-500 truncate">{bank.description}</div>
                  <div class="flex items-center space-x-2 mt-2">
                    <span 
                      class="px-2 py-0.5 text-xs rounded-full text-white"
                      style="background-color: {bank.color}"
                    >
                      {BANK_TYPES[bank.type].label}
                    </span>
                    <span class="text-xs text-sky-500">Code: {bank.code}</span>
                  </div>
                </div>
                <div class="flex-shrink-0">
                  <div class="text-xs text-sky-500">
                    {bank.services.length} services
                  </div>
                </div>
              </div>
            </button>
          {/each}
        {/if}
      </div>

      <!-- Footer -->
      <div class="p-4 bg-sky-50/50 border-t border-sky-100">
        <div class="text-xs text-sky-600 text-center">
          Select your primary bank for ATM and digital banking services
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