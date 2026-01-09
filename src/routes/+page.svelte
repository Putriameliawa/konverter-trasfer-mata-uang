<script lang="js">
  import CurrencyConverter from '$lib/components/CurrencyConverter.svelte';
  import DomesticTransfer from '$lib/components/DomesticTransfer.svelte';
  import HandDetector from '$lib/components/HandDetector.svelte';
  import TransferHistory from '$lib/components/TransferHistory.svelte';
  import { CURRENCIES } from '$lib/currency';
  import { getBankById } from '$lib/banks';
  import { auth } from '$lib/auth';
  import { t } from '$lib/i18n';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { userService } from '$lib/users';
  import { page } from '$app/stores';
  import { transferHistoryService, createTransferRecord } from '$lib/transferHistory';
  
  // Transfer state
  let transferActive = false;
  let transferAmount = 0;
  let transferFromCurrency = '';
  let transferToCurrency = '';
  let transferStatus = 'pending'; // 'pending' | 'detecting' | 'success' | 'failed'
  let showNotification = false;
  let handDetectionTimeout = null;
  let selectedUser = null; // Selected user for transfer
  let transferMode = 'international'; // 'international' | 'domestic'
  
  // Auth state
  $: authState = $auth;
  $: user = authState.user;
  $: preferredBank = user?.profile?.preferredBank?.bankId ? getBankById(user.profile.preferredBank.bankId) : null;
  
  onMount(async () => {
    // Initialize auth store
    await auth.init();
    
    // Check for selected user from URL params
    const transferToUserId = $page.url.searchParams.get('transferTo');
    if (transferToUserId) {
      selectedUser = userService.getUserById(transferToUserId);
      // Clear the URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('transferTo');
      window.history.replaceState({}, '', newUrl);
    }
    
    // Check authentication status and redirect if needed
    const unsubscribe = auth.subscribe(authState => {
      if (!authState.isAuthenticated && !authState.isLoading) {
        goto('/login');
      }
    });
    
    return unsubscribe;
  });
  
  function handleTransferReady(amount, fromCurrency, toCurrency) {
    transferAmount = amount;
    transferFromCurrency = fromCurrency;
    transferToCurrency = toCurrency;
    transferActive = true;
    transferStatus = 'detecting';
  }
  
  function handleHandDetected() {
    if (transferStatus !== 'detecting') return;
    
    // Start countdown timer
    if (handDetectionTimeout) {
      clearTimeout(handDetectionTimeout);
    }
    
    handDetectionTimeout = setTimeout(() => {
      completeTransfer();
    }, 2000); // 2 seconds to complete transfer
  }
  
  function handleHandLost() {
    if (handDetectionTimeout) {
      clearTimeout(handDetectionTimeout);
      handDetectionTimeout = null;
    }
  }
  
  function completeTransfer() {
    transferStatus = 'success';
    showNotification = true;
    
    // Record transfer if sending to another user
    if (selectedUser) {
      userService.recordTransfer(selectedUser.id);
    }
    
    // Record transfer in history
    const exchangeRate = transferFromCurrency === transferToCurrency ? 1 : transferAmount / transferAmount; // Simplified for demo
    const transferRecord = createTransferRecord(
      transferAmount,
      transferFromCurrency,
      transferToCurrency,
      transferAmount, // Using same amount for demo
      exchangeRate,
      selectedUser,
      'hand_gesture',
      selectedUser ? `Transfer to ${selectedUser.fullName}` : 'Currency conversion'
    );
    
    transferHistoryService.addTransfer(transferRecord);
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      showNotification = false;
      resetTransfer();
    }, 5000);
  }
  
  function resetTransfer() {
    transferActive = false;
    transferAmount = 0;
    transferFromCurrency = '';
    transferToCurrency = '';
    transferStatus = 'pending';
    selectedUser = null; // Reset selected user
    
    if (handDetectionTimeout) {
      clearTimeout(handDetectionTimeout);
      handDetectionTimeout = null;
    }
  }
  
  function formatCurrencyDisplay(amount, currencyCode) {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    if (!currency) return `${amount} ${currencyCode}`;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  function handleLogout() {
    auth.logout();
  }
</script>

<svelte:head>
  <title>💱 Currency Transfer App - Hand Gesture Payments</title>
  <meta name="description" content="Convert currencies and transfer money using hand gesture detection with real-time exchange rates" />
  <meta name="keywords" content="currency converter, hand gesture, biometric, payment, exchange rates" />
</svelte:head>

<div class="relative">
    
    <!-- Hero / Welcome Message (Replaces Header Title) -->
    <div class="text-center mb-10 mt-4">
      <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
        {$t('main.title')}
      </h1>
      <p class="text-sky-700 text-lg md:text-xl font-medium">
        {$t('main.subtitle')}
      </p>
      <div class="w-24 h-1 bg-gradient-to-r from-sky-300 to-cyan-400 mx-auto mt-4 rounded-full"></div>
    </div>
    
    <!-- Success Notification -->
    {#if showNotification && transferStatus === 'success'}
      <div 
        class="fixed top-24 right-4 z-50 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-500 animate-bounce-slow backdrop-blur-lg"
        role="alert"
      >
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <h4 class="font-semibold">{$t('main.transferSuccessful')}</h4>
            <p class="text-sm opacity-90">
              {formatCurrencyDisplay(transferAmount, transferToCurrency)} {$t('main.transferred')}
            </p>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Features Section -->  
    <div class="grid md:grid-cols-3 gap-6 mb-12">
      <!-- International Transfer -->
      <div class="glass-card p-6 text-center floating" style="animation-delay: -5s;">
        <div class="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-sky-800 mb-2">International Transfer</h3>
        <p class="text-sky-600 text-sm mb-4">Multi-currency conversion with real-time exchange rates and biometric security</p>
        <p class="text-xs text-sky-500">Available above</p>
      </div>

      <!-- Domestic Transfer -->
      <div class="glass-card p-6 text-center floating" style="animation-delay: -6s;">
        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-green-800 mb-2">Transfer Dalam Negeri</h3>
        <p class="text-green-600 text-sm mb-4">Transfer IDR ke pengguna di seluruh Indonesia with low fees</p>
        <button 
          on:click={() => transferMode = 'domestic'}
          class="text-xs text-green-600 hover:text-green-700 font-medium"
        >
          Try Now →
        </button>
      </div>

      <!-- User Transfer -->
      <div class="glass-card p-6 text-center floating" style="animation-delay: -7s;">
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-blue-800 mb-2">{$t('nav.users')}</h3>
        <p class="text-blue-600 text-sm mb-4">Transfer currency to other users easily and securely</p>
        <a href="/users" class="text-xs text-blue-600 hover:text-blue-700 font-medium">
          View Users →
        </a>
      </div>

      <!-- Biometric Verification -->
      <div class="glass-card p-6 text-center floating" style="animation-delay: -8s;">
        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-purple-800 mb-2">Verifikasi Biometrik</h3>
        <p class="text-purple-600 text-sm mb-4">High level security with face and hand detection</p>
      </div>
    </div>

    <!-- Transfer Mode Toggle -->
    <div class="flex justify-center mb-8">
      <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-1 inline-flex">
        <button
          on:click={() => transferMode = 'international'}
          class="px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 {transferMode === 'international' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'}"
        >
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Transfer Internasional
        </button>
        <button
          on:click={() => transferMode = 'domestic'}
          class="px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 {transferMode === 'domestic' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'}"
        >
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Transfer Dalam Negeri
        </button>
      </div>
    </div>

    <!-- Main Transfer Section -->
    <div class="grid md:grid-cols-2 gap-8 mb-12">
      <!-- Transfer Component -->
      <div class="floating" style="animation-delay: -1s;">
        {#if transferMode === 'international'}
          <CurrencyConverter onTransferReady={handleTransferReady} bind:selectedUser={selectedUser} />
        {:else}
          <DomesticTransfer onTransferReady={handleTransferReady} bind:selectedUser={selectedUser} bind:transferAmount={transferAmount} />
        {/if}
      </div>
      
      <!-- Hand Detection Transfer -->
      <div class="floating" style="animation-delay: -3s;">
        <HandDetector 
          active={transferActive}
          onHandDetected={handleHandDetected}
          onHandLost={handleHandLost}
        />
        
        <!-- Transfer Status -->
        {#if transferActive}
          <div class="glass-card p-4 mt-4 pulse-subtle">
            <h4 class="font-semibold text-sky-800 mb-2">Transfer Details</h4>
            <div class="space-y-2 text-sm">
              {#if selectedUser}
                <div class="flex justify-between">
                  <span class="text-sky-600">To:</span>
                  <span class="font-medium text-sky-800">{selectedUser.fullName}</span>
                </div>
              {/if}
              <div class="flex justify-between">
                <span class="text-sky-600">Amount:</span>
                <span class="font-medium text-sky-800">
                  {formatCurrencyDisplay(transferAmount, transferToCurrency)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sky-600">From:</span>
                <span class="text-sky-800">{transferFromCurrency}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sky-600">To Currency:</span>
                <span class="text-sky-800">{transferToCurrency}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sky-600">Status:</span>
                <span class="capitalize {transferStatus === 'success' ? 'text-emerald-600' : 'text-sky-600'} font-medium">
                  {transferStatus === 'detecting' ? 'Waiting for hand gesture' : transferStatus}
                </span>
              </div>
            </div>
            
            {#if transferStatus === 'detecting'}
              <div class="mt-4">
                <div class="w-full bg-sky-100 rounded-full h-2">
                  <div class="bg-gradient-to-r from-sky-400 to-cyan-500 h-2 rounded-full animate-pulse-slow w-full"></div>
                </div>
                <p class="text-xs text-sky-600 mt-1 text-center">
                  Hold your hand steady for 2 seconds to complete transfer
                </p>
              </div>
            {/if}
            
            <button
              on:click={resetTransfer}
              class="btn-secondary w-full mt-4"
            >
              Cancel Transfer
            </button>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Bank Information Quick View -->
    {#if user?.profile?.preferredBank?.bankId || user?.profile?.verificationData?.verified}
      <div class="glass-card p-6 mb-8 floating" style="animation-delay: -4s;">
        <h3 class="text-xl font-semibold text-sky-800 mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          {$t('banking.bankInfo')}
        </h3>
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Preferred Bank -->
          {#if preferredBank}
            <div class="bg-sky-50/50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-sky-700 mb-2">{$t('banking.preferredBank')}</h4>
              <div class="flex items-center space-x-3">
                <span class="text-2xl">{preferredBank.logo}</span>
                <div>
                  <div class="font-medium text-sky-800">{preferredBank.name}</div>
                  <div class="text-sm text-sky-600">{preferredBank.fullName}</div>
                  {#if user.profile.preferredBank.accountNumber}
                    <div class="text-xs text-sky-500 mt-1">Account: {user.profile.preferredBank.accountNumber}</div>
                  {/if}
                </div>
              </div>
            </div>
          {:else}
            <div class="bg-amber-50/50 rounded-lg p-4 border border-amber-200">
              <h4 class="text-sm font-medium text-amber-700 mb-2">{$t('banking.preferredBank')}</h4>
              <p class="text-sm text-amber-600">{$t('banking.noBank')}</p>
              <a href="/profile" class="text-xs text-amber-700 hover:text-amber-800 underline">{$t('banking.setBankInProfile')}</a>
            </div>
          {/if}
          
          <!-- ATM Verification Status -->
          <div class="bg-{user?.profile?.verificationData?.verified ? 'emerald' : 'amber'}-50/50 rounded-lg p-4 border border-{user?.profile?.verificationData?.verified ? 'emerald' : 'amber'}-200">
            <h4 class="text-sm font-medium text-{user?.profile?.verificationData?.verified ? 'emerald' : 'amber'}-700 mb-2">{$t('banking.atmVerification')}</h4>
            {#if user?.profile?.verificationData?.verified}
              <div class="flex items-center text-{user?.profile?.verificationData?.verified ? 'emerald' : 'amber'}-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm">{$t('banking.verified')}</span>
              </div>
              {#if user.profile.verificationData.atmCard?.issuerBank}
                <div class="text-xs text-{user?.profile?.verificationData?.verified ? 'emerald' : 'amber'}-500 mt-1">
                  ATM: {user.profile.verificationData.atmCard.issuerBank}
                </div>
              {/if}
            {:else}
              <div class="flex items-center text-amber-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm">{$t('banking.notVerified')}</span>
              </div>
              <a href="/verification" class="text-xs text-amber-700 hover:text-amber-800 underline">{$t('banking.verifyNow')}</a>
            {/if}
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Recent Transfer History -->
    <div class="glass-card p-6 mb-8 floating" style="animation-delay: -6s;">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-sky-800 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Recent Transfers
        </h3>
        <a
          href="/history"
          class="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center space-x-1"
        >
          <span>View All</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
      <TransferHistory userId={null} maxItems={3} showFilters={false} compact={true} />
    </div>
    
    <!-- Instructions -->
    <div class="glass-card p-8 floating" style="animation-delay: -5s;">
      <h3 class="text-2xl font-semibold text-sky-800 mb-6 text-center">{$t('main.howItWorks')}</h3>
      <div class="grid md:grid-cols-3 gap-8 text-sm text-sky-600">
        <div class="text-center group">
          <div class="w-16 h-16 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <span class="text-2xl">💱</span>
          </div>
          <h4 class="font-semibold text-sky-800 mb-3 text-lg">{$t('main.step1Title')}</h4>
          <p>{$t('main.step1Description')}</p>
        </div>
        
        <div class="text-center group">
          <div class="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <span class="text-2xl">👋</span>
          </div>
          <h4 class="font-semibold text-sky-800 mb-3 text-lg">{$t('main.step2Title')}</h4>
          <p>{$t('main.step2Description')}</p>
        </div>
        
        <div class="text-center group">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <span class="text-2xl">✅</span>
          </div>
          <h4 class="font-semibold text-sky-800 mb-3 text-lg">{$t('main.step3Title')}</h4>
          <p>{$t('main.step3Description')}</p>
        </div>
      </div>
    </div>
    
</div>