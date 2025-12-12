
<script lang="js">
  import { onMount } from 'svelte';
  import { transferHistoryService, transferHistoryStore } from '$lib/transferHistory';
  import { t } from '$lib/i18n';
  
  export let userId = null; // Optional: filter by user ID
  export let maxItems = null; // Optional: limit number of items
  export let showFilters = true; // Show filter controls
  export let compact = false; // Compact display mode
  
  let transfers = [];
  let filteredTransfers = [];
  let searchQuery = '';
  let filterType = 'all'; // 'all', 'sent', 'received', 'conversion'
  let filterStatus = 'all'; // 'all', 'completed', 'pending', 'failed'
  let filterDateRange = 'all'; // 'all', 'today', 'week', 'month', 'year'
  let showStats = false;
  let stats = null;
  
  // Reactive statements
  $: transfers = $transferHistoryStore;
  $: {
    // Apply filters
    let filtered = userId ? transferHistoryService.getAllTransfers(userId) : transfers;
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = transferHistoryService.searchTransfers(searchQuery, userId || undefined);
    }
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }
    
    // Filter by date range
    if (filterDateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (filterDateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = transferHistoryService.getTransfersByDateRange(startDate, now, userId || undefined);
    }
    
    // Apply max items limit
    if (maxItems && maxItems > 0) {
      filtered = filtered.slice(0, maxItems);
    }
    
    filteredTransfers = filtered;
  }
  
  onMount(() => {
    // Load initial data
    transfers = transferHistoryService.getAllTransfers(userId || undefined);
    
    // Calculate stats if needed
    if (showStats) {
      stats = transferHistoryService.getTransferStats(userId || undefined);
    }
  });
  
  function getTransferIcon(transfer) {
    switch (transfer.type) {
      case 'sent':
        return '↗️';
      case 'received':
        return '↙️';
      case 'conversion':
        return '🔄';
      default:
        return '💸';
    }
  }
  
  function getStatusColor(status) {
    switch (status) {
      case 'completed':
        return 'text-emerald-600 bg-emerald-100';
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
  
  function getTypeColor(type) {
    switch (type) {
      case 'sent':
        return 'text-blue-600 bg-blue-100';
      case 'received':
        return 'text-emerald-600 bg-emerald-100';
      case 'conversion':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
  
  function toggleStats() {
    showStats = !showStats;
    if (showStats && !stats) {
      stats = transferHistoryService.getTransferStats(userId || undefined);
    }
  }
  
  function clearFilters() {
    searchQuery = '';
    filterType = 'all';
    filterStatus = 'all';
    filterDateRange = 'all';
  }
</script>

<div class="transfer-history">
  {#if showFilters}
    <!-- Header and Controls -->
    <div class="bg-white rounded-lg shadow-sm border border-sky-200 p-4 mb-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 class="text-xl font-semibold text-sky-800 mb-2 md:mb-0">
          {$t('history.title')}
        </h2>
        <div class="flex items-center space-x-2">
          <button
            on:click={toggleStats}
            class="px-3 py-2 text-sm bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg transition-colors duration-200 flex items-center space-x-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>{$t('history.showStats')}</span>
          </button>
          <button
            on:click={clearFilters}
            class="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
          >
            {$t('history.clearFilters')}
          </button>
        </div>
      </div>
      
      <!-- Search and Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <!-- Search -->
        <div class="md:col-span-2">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="{$t('history.searchPlaceholder')}"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        
        <!-- Type Filter -->
        <select
          bind:value={filterType}
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        >
          <option value="all">{$t('history.allTypes')}</option>
          <option value="sent">{$t('history.sent')}</option>
          <option value="received">{$t('history.received')}</option>
          <option value="conversion">{$t('history.conversion')}</option>
        </select>
        
        <!-- Status Filter -->
        <select
          bind:value={filterStatus}
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        >
          <option value="all">{$t('history.allStatus')}</option>
          <option value="completed">{$t('history.completed')}</option>
          <option value="pending">{$t('history.pending')}</option>
          <option value="failed">{$t('history.failed')}</option>
        </select>
      </div>
    </div>
    
    <!-- Statistics Panel -->
    {#if showStats && stats}
      <div class="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-lg border border-sky-200 p-4 mb-4">
        <h3 class="text-lg font-medium text-sky-800 mb-3">{$t('history.statistics')}</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-sky-600">{stats.totalTransfers}</div>
            <div class="text-sky-700">{$t('history.total')}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{stats.totalSent}</div>
            <div class="text-blue-700">{$t('history.sent')}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-emerald-600">{stats.totalReceived}</div>
            <div class="text-emerald-700">{$t('history.received')}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{stats.totalConversions}</div>
            <div class="text-purple-700">{$t('history.totalConversions')}</div>
          </div>
        </div>
      </div>
    {/if}
  {/if}
  
  <!-- Transfer List -->
  <div class="space-y-3">
    {#if filteredTransfers.length === 0}
      <div class="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">{$t('history.noTransfers')}</h3>
        <p class="text-gray-500">{$t('history.noTransfersMessage')}</p>
      </div>
    {:else}
      {#each filteredTransfers as transfer (transfer.id)}
        <div class="bg-white rounded-lg border border-gray-200 hover:border-sky-300 transition-colors duration-200 {compact ? 'p-3' : 'p-4'}">
          <div class="flex items-center justify-between">
            <!-- Transfer Info -->
            <div class="flex items-start space-x-3">
              <!-- Icon -->
              <div class="w-10 h-10 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center text-lg">
                {getTransferIcon(transfer)}
              </div>
              
              <!-- Details -->
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="px-2 py-1 text-xs font-medium rounded-full {getTypeColor(transfer.type)}">
                    {transfer.type.charAt(0).toUpperCase() + transfer.type.slice(1)}
                  </span>
                  <span class="px-2 py-1 text-xs font-medium rounded-full {getStatusColor(transfer.status)}">
                    {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                  </span>
                </div>
                
                <div class="font-medium text-gray-800">
                  {#if transfer.type === 'sent'}
                    {$t('transfer.to')}: {transfer.toUserName}
                  {:else if transfer.type === 'received'}
                    {$t('transfer.from')}: {transfer.fromUserName}
                  {:else}
                    {$t('history.conversion')}
                  {/if}
                </div>
                
                <div class="text-sm text-gray-600">
                  {transferHistoryService.formatCurrency(transfer.fromAmount, transfer.fromCurrency)}
                  →
                  {transferHistoryService.formatCurrency(transfer.toAmount, transfer.toCurrency)}
                </div>
                
                {#if transfer.notes && !compact}
                  <div class="text-xs text-gray-500 mt-1">{transfer.notes}</div>
                {/if}
              </div>
            </div>
            
            <!-- Amount and Time -->
            <div class="text-right">
              <div class="font-medium text-gray-800">
                {#if transfer.type === 'sent'}
                  -{transferHistoryService.formatCurrency(transfer.fromAmount, transfer.fromCurrency)}
                {:else if transfer.type === 'received'}
                  +{transferHistoryService.formatCurrency(transfer.toAmount, transfer.toCurrency)}
                {:else}
                  {transferHistoryService.formatCurrency(transfer.toAmount, transfer.toCurrency)}
                {/if}
              </div>
              <div class="text-xs text-gray-500">
                {transferHistoryService.formatRelativeTime(transfer.timestamp)}
              </div>
              {#if transfer.fee && !compact}
                <div class="text-xs text-red-500">
                  Fee: {transferHistoryService.formatCurrency(transfer.fee || 0, transfer.feeCurrency || 'USD')}
                </div>
              {/if}
            </div>
          </div>
          
          <!-- Additional Details (Expandable) -->
          {#if !compact}
            <div class="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 grid grid-cols-2 gap-2">
              <div>
                <span class="font-medium">{$t('history.transactionId')}:</span>
                <span class="font-mono">{transfer.transactionId}</span>
              </div>
              <div>
                <span class="font-medium">{$t('history.method')}:</span>
                <span class="capitalize">{transfer.method.replace('_', ' ')}</span>
              </div>
              {#if transfer.exchangeRate}
                <div>
                  <span class="font-medium">{$t('history.exchangeRate')}:</span>
                  <span>1 {transfer.fromCurrency} = {transfer.exchangeRate} {transfer.toCurrency}</span>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
  
  <!-- Load More Button (if applicable) -->
  {#if maxItems && filteredTransfers.length >= maxItems}
    <div class="text-center mt-4">
      <a
        href="/history"
        class="inline-flex items-center px-4 py-2 text-sm bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg transition-colors duration-200"
      >
        {$t('history.viewComplete')}
        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  {/if}
</div>

<style>
  .transfer-history {
    @apply w-full;
  }
</style>