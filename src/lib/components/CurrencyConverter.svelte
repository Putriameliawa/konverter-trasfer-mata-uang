<script>
  import { onMount } from 'svelte';
  import { CURRENCIES, fetchExchangeRates, convertCurrency, formatCurrency } from '$lib/currency';
  import UserSelector from '$lib/components/UserSelector.svelte';
  import { t } from '$lib/i18n';
  
  export let onTransferReady;
  export let selectedUser = null;
  
  let amount = '';
  let fromCurrency = 'IDR';
  let toCurrency = 'USD';
  let exchangeRates = null;
  let convertedAmount = 0;
  let loading = false;
  let error = '';
  
  $: {
    if (amount && exchangeRates && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
      try {
        // Clear previous errors
        error = '';
        console.log('Converting:', {
          amount: parseFloat(amount),
          from: fromCurrency,
          to: toCurrency,
          rates: exchangeRates.rates,
          base: exchangeRates.base
        });
        
        convertedAmount = convertCurrency(
          parseFloat(amount),
          fromCurrency,
          toCurrency,
          exchangeRates.rates,
          exchangeRates.base
        );
        
        console.log('Conversion result:', convertedAmount);
      } catch (e) {
        console.error('Conversion error:', e);
        convertedAmount = 0;
        if (e instanceof Error) {
          error = 'Conversion failed: ' + e.message;
        } else {
          error = 'Conversion failed: Unknown error';
        }
      }
    } else {
      convertedAmount = 0;
      // Clear error if amount is invalid but not show error for empty input
      if (amount && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
        error = '';
      }
    }
  }
  
  async function loadExchangeRates(retryCount = 0) {
    loading = true;
    error = '';
    try {
      exchangeRates = await fetchExchangeRates();
      
      // Validate that we have the required exchange rates
      if (!exchangeRates || !exchangeRates.rates) {
        throw new Error('Invalid exchange rates data received');
      }
      
      console.log('Exchange rates loaded successfully:', exchangeRates);
    } catch (e) {
      console.error('Failed to load exchange rates:', e);
      
      if (retryCount < 2) {
        // Retry up to 2 times
        console.log(`Retrying to load exchange rates... (attempt ${retryCount + 1})`);
        setTimeout(() => loadExchangeRates(retryCount + 1), 1000);
        return;
      }
      
      error = 'Failed to load exchange rates. Using fallback data.';
      // Still try to load fallback data
      try {
        exchangeRates = await fetchExchangeRates();
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        error = 'Unable to load exchange rates. Please refresh the page.';
      }
    } finally {
      loading = false;
    }
  }
  
  function handleTransfer() {
    if (convertedAmount > 0 && amount && parseFloat(amount) > 0) {
      // Clear any previous errors
      error = '';
      onTransferReady(convertedAmount, fromCurrency, toCurrency);
    }
  }
  
  function swapCurrencies() {
    [fromCurrency, toCurrency] = [toCurrency, fromCurrency];
    // Clear any conversion errors when swapping
    error = '';
  }
  
  function getExchangeRate(from, to, rates) {
    if (from === to) return '1.0000';
    
    try {
      // Validate rates object
      if (!rates || !rates.rates) {
        return 'N/A';
      }
      
      const rate = convertCurrency(1, from, to, rates.rates, rates.base);
      return rate.toFixed(4);
    } catch (e) {
      console.error('Error calculating exchange rate:', e);
      return 'N/A';
    }
  }
  
  onMount(() => {
    loadExchangeRates();
    // Refresh rates every 5 minutes
    const interval = setInterval(loadExchangeRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  });
</script>

<div class="glass-card p-6 mb-6">
  <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">{$t('currency.title', { default: 'Currency Converter' })}</h2>
  
  <!-- User Selection -->
  <UserSelector bind:selectedUser={selectedUser} />
  
  {#if loading}
    <div class="text-center py-4">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="mt-2 text-gray-600">{$t('common.loading', { default: 'Loading exchange rates...' })}</p>
    </div>
  {:else if error}
    <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
      <p>{error}</p>
    </div>
  {/if}
  
  {#if exchangeRates}
    <div class="text-center mb-6">
      <p class="text-sm text-gray-600">Exchange rates updated: {exchangeRates.date}</p>
      <p class="text-xs text-gray-500">Base currency: {exchangeRates.base}</p>
    </div>
  {/if}
  
  <div class="space-y-4">
    <!-- Amount Input -->
    <div>
      <label for="amount" class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
      <input
        id="amount"
        type="number"
        bind:value={amount}
        placeholder="Enter amount"
        class="input-field {amount && parseFloat(amount) <= 0 ? 'border-red-500' : ''}"
        min="0.01"
        step="0.01"
      />
      {#if amount && parseFloat(amount) <= 0}
        <p class="text-red-500 text-xs mt-1">Amount must be greater than 0</p>
      {/if}
    </div>
    
    <!-- From Currency -->
    <div>
      <label for="from-currency" class="block text-sm font-medium text-gray-700 mb-2">From</label>
      <select id="from-currency" bind:value={fromCurrency} class="input-field">
        {#each CURRENCIES as currency}
          <option value={currency.code}>{currency.symbol} {currency.code} - {currency.name}</option>
        {/each}
      </select>
    </div>
    
    <!-- Swap Button -->
    <div class="flex justify-center">
      <button
        on:click={swapCurrencies}
        class="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
        title="Swap currencies"
      >
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </button>
    </div>
    
    <!-- To Currency -->
    <div>
      <label for="to-currency" class="block text-sm font-medium text-gray-700 mb-2">To</label>
      <select id="to-currency" bind:value={toCurrency} class="input-field">
        {#each CURRENCIES as currency}
          <option value={currency.code}>{currency.symbol} {currency.code} - {currency.name}</option>
        {/each}
      </select>
    </div>
    
    <!-- Conversion Result -->
    {#if convertedAmount > 0}
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <p class="text-lg font-semibold text-green-800 text-center">
          {formatCurrency(parseFloat(amount), CURRENCIES.find(c => c.code === fromCurrency) || CURRENCIES[0])}
          =
          {formatCurrency(convertedAmount, CURRENCIES.find(c => c.code === toCurrency) || CURRENCIES[1])}
        </p>
        
        {#if exchangeRates}
          <p class="text-sm text-green-600 text-center mt-2">
            1 {fromCurrency} = {getExchangeRate(fromCurrency, toCurrency, exchangeRates)} {toCurrency}
          </p>
        {/if}
      </div>
      
      <!-- Transfer Button -->
      <button
        on:click={handleTransfer}
        class="btn-primary w-full mt-4"
        disabled={!convertedAmount || !amount || parseFloat(amount) <= 0 || loading}
      >
        {#if loading}
          Processing...
        {:else}
          Proceed to Transfer
        {/if}
      </button>
    {/if}
  </div>
</div>