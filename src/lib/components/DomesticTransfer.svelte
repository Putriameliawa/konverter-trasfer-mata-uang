
<script lang="js">
  import { onMount } from 'svelte';
  import { t } from '$lib/i18n';
  import { userService } from '$lib/users';
  import { transferHistoryService, createTransferRecord } from '$lib/transferHistory';
  import { formatCurrency } from '$lib/currency';
  
  export let onTransferReady;
  export let selectedUser = null;
  export let transferAmount = 0;
  export let onTransferComplete = null;
  
  // Indonesian provinces/regions
  const INDONESIAN_REGIONS = [
    { code: 'JK', name: 'DKI Jakarta', capital: 'Jakarta' },
    { code: 'JB', name: 'Jawa Barat', capital: 'Bandung' },
    { code: 'JT', name: 'Jawa Tengah', capital: 'Semarang' },
    { code: 'JI', name: 'Jawa Timur', capital: 'Surabaya' },
    { code: 'YG', name: 'DI Yogyakarta', capital: 'Yogyakarta' },
    { code: 'BT', name: 'Banten', capital: 'Serang' },
    { code: 'SU', name: 'Sumatera Utara', capital: 'Medan' },
    { code: 'SB', name: 'Sumatera Barat', capital: 'Padang' },
    { code: 'RI', name: 'Riau', capital: 'Pekanbaru' },
    { code: 'JA', name: 'Jambi', capital: 'Jambi' },
    { code: 'SS', name: 'Sumatera Selatan', capital: 'Palembang' },
    { code: 'BE', name: 'Bengkulu', capital: 'Bengkulu' },
    { code: 'LA', name: 'Lampung', capital: 'Bandar Lampung' },
    { code: 'KB', name: 'Kepulauan Bangka Belitung', capital: 'Pangkal Pinang' },
    { code: 'KR', name: 'Kepulauan Riau', capital: 'Tanjung Pinang' },
    { code: 'AC', name: 'Aceh', capital: 'Banda Aceh' },
    { code: 'BA', name: 'Bali', capital: 'Denpasar' },
    { code: 'NTB', name: 'Nusa Tenggara Barat', capital: 'Mataram' },
    { code: 'NTT', name: 'Nusa Tenggara Timur', capital: 'Kupang' },
    { code: 'KB', name: 'Kalimantan Barat', capital: 'Pontianak' },
    { code: 'KT', name: 'Kalimantan Tengah', capital: 'Palangka Raya' },
    { code: 'KS', name: 'Kalimantan Selatan', capital: 'Banjarmasin' },
    { code: 'KI', name: 'Kalimantan Timur', capital: 'Samarinda' },
    { code: 'KU', name: 'Kalimantan Utara', capital: 'Tanjung Selor' },
    { code: 'SA', name: 'Sulawesi Utara', capital: 'Manado' },
    { code: 'ST', name: 'Sulawesi Tengah', capital: 'Palu' },
    { code: 'SN', name: 'Sulawesi Selatan', capital: 'Makassar' },
    { code: 'SG', name: 'Sulawesi Tenggara', capital: 'Kendari' },
    { code: 'GO', name: 'Gorontalo', capital: 'Gorontalo' },
    { code: 'SR', name: 'Sulawesi Barat', capital: 'Mamuju' },
    { code: 'MA', name: 'Maluku', capital: 'Ambon' },
    { code: 'MU', name: 'Maluku Utara', capital: 'Ternate' },
    { code: 'PA', name: 'Papua', capital: 'Jayapura' },
    { code: 'PB', name: 'Papua Barat', capital: 'Manokwari' }
  ];
  
  // Transfer state
  let amount = '';
  let selectedRegion = '';
  let availableUsers = [];
  let filteredUsers = [];
  let searchQuery = '';
  let loading = false;
  let error = '';
  let transferStep = 'amount'; // 'amount' | 'region' | 'user' | 'confirm'
  
  // Form validation
  $: isValidAmount = amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
  $: isValidRegion = selectedRegion !== '';
  $: isValidUser = selectedUser !== null;
  $: canProceed = isValidAmount && isValidRegion && isValidUser;
  
  // Filter users based on search query
  $: {
    if (searchQuery.trim()) {
      filteredUsers = availableUsers.filter(user => 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      );
    } else {
      filteredUsers = availableUsers;
    }
  }
  
  // Mock function to get users by region (in real app, this would be an API call)
  function getUsersByRegion(regionCode) {
    // For demo purposes, we'll filter existing users and simulate regional distribution
    const allUsers = userService.getAllUsers('current_user');
    const regionUsers = allUsers.filter((user, index) => {
      // Simulate regional distribution
      const regions = ['JK', 'JB', 'JT', 'JI', 'BA'];
      const userRegion = regions[index % regions.length];
      return userRegion === regionCode;
    });
    
    // Add some mock regional data to existing users
    return regionUsers.map(user => ({
      ...user,
      region: {
        code: regionCode,
        name: INDONESIAN_REGIONS.find(r => r.code === regionCode)?.name || 'Unknown',
        city: getRandomCityForRegion(regionCode)
      }
    }));
  }
  
  function getRandomCityForRegion(regionCode) {
    const cities = {
      'JK': ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Barat'],
      'JB': ['Bandung', 'Bogor', 'Bekasi', 'Depok', 'Cimahi'],
      'JT': ['Semarang', 'Solo', 'Magelang', 'Salatiga', 'Pekalongan'],
      'JI': ['Surabaya', 'Malang', 'Kediri', 'Blitar', 'Mojokerto'],
      'BA': ['Denpasar', 'Ubud', 'Sanur', 'Kuta', 'Nusa Dua']
    };
    
    const regionCities = cities[regionCode] || ['Kota Utama'];
    return regionCities[Math.floor(Math.random() * regionCities.length)];
  }
  
  async function handleRegionChange() {
    if (!selectedRegion) {
      availableUsers = [];
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      availableUsers = getUsersByRegion(selectedRegion);
      
      if (availableUsers.length === 0) {
        error = 'Tidak ada pengguna ditemukan di daerah ini. Silakan pilih daerah lain.';
      }
    } catch (e) {
      error = 'Gagal memuat pengguna untuk daerah ini. Silakan coba lagi.';
      console.error('Error loading users for region:', e);
    } finally {
      loading = false;
    }
  }
  
  function nextStep() {
    if (transferStep === 'amount' && isValidAmount) {
      transferStep = 'region';
    } else if (transferStep === 'region' && isValidRegion) {
      transferStep = 'user';
      handleRegionChange();
    } else if (transferStep === 'user' && isValidUser) {
      transferStep = 'confirm';
    }
  }
  
  function prevStep() {
    if (transferStep === 'region') {
      transferStep = 'amount';
    } else if (transferStep === 'user') {
      transferStep = 'region';
      selectedUser = null;
      availableUsers = [];
    } else if (transferStep === 'confirm') {
      transferStep = 'user';
    }
  }
  
  function selectUser(user) {
    selectedUser = user;
  }
  
  function handleTransfer() {
    if (!canProceed) return;
    
    transferAmount = parseFloat(amount);
    
    // Create transfer record
    const transferRecord = createTransferRecord(
      transferAmount,
      'IDR', // Domestic transfers are in IDR
      'IDR',
      transferAmount,
      1, // Exchange rate is 1 for same currency
      selectedUser,
      'hand_gesture',
      `Transfer domestik ke ${selectedUser.fullName} di ${selectedUser.region?.name}`
    );
    
    // Call parent handler
    if (onTransferReady) {
      onTransferReady(transferAmount, 'IDR', 'IDR');
    }
  }
  
  function resetTransfer() {
    transferStep = 'amount';
    amount = '';
    selectedRegion = '';
    selectedUser = null;
    availableUsers = [];
    filteredUsers = [];
    searchQuery = '';
    error = '';
  }
  
  function formatAmount(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
</script>

<div class="bg-white rounded-lg shadow-lg border border-blue-200 p-6 mb-6">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold text-blue-800">Transfer Dalam Negeri</h2>
    <div class="flex items-center space-x-2">
      <!-- Step indicator -->
      <div class="flex items-center space-x-2 text-sm">
        <div class="flex items-center">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium {transferStep === 'amount' ? 'bg-blue-500 text-white' : transferStep === 'region' || transferStep === 'user' || transferStep === 'confirm' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}">
            1
          </div>
          <span class="ml-1 {transferStep === 'amount' ? 'text-blue-600 font-medium' : 'text-gray-600'}">Nominal</span>
        </div>
        <div class="w-8 h-px bg-gray-300"></div>
        <div class="flex items-center">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium {transferStep === 'region' ? 'bg-blue-500 text-white' : transferStep === 'user' || transferStep === 'confirm' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}">
            2
          </div>
          <span class="ml-1 {transferStep === 'region' ? 'text-blue-600 font-medium' : 'text-gray-600'}">Daerah</span>
        </div>
        <div class="w-8 h-px bg-gray-300"></div>
        <div class="flex items-center">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium {transferStep === 'user' ? 'bg-blue-500 text-white' : transferStep === 'confirm' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}">
            3
          </div>
          <span class="ml-1 {transferStep === 'user' ? 'text-blue-600 font-medium' : 'text-gray-600'}">Pengguna</span>
        </div>
        <div class="w-8 h-px bg-gray-300"></div>
        <div class="flex items-center">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium {transferStep === 'confirm' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}">
            4
          </div>
          <span class="ml-1 {transferStep === 'confirm' ? 'text-blue-600 font-medium' : 'text-gray-600'}">Konfirmasi</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{error}</p>
    </div>
  {/if}

  <!-- Step 1: Amount Input -->
  {#if transferStep === 'amount'}
    <div class="space-y-4">
      <div>
        <label for="domestic-amount" class="block text-sm font-medium text-gray-700 mb-2">
          Nominal Transfer (IDR)
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
          <input
            id="domestic-amount"
            type="number"
            bind:value={amount}
            placeholder="Masukkan nominal transfer"
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            min="1000"
            step="1000"
          />
        </div>
        {#if amount && !isValidAmount}
          <p class="text-red-500 text-sm mt-1">Nominal harus lebih dari Rp 1.000</p>
        {/if}
        {#if isValidAmount}
          <p class="text-green-600 text-sm mt-1">
            Nominal: {formatAmount(parseFloat(amount))}
          </p>
        {/if}
      </div>
      
      <div class="flex justify-end">
        <button
          on:click={nextStep}
          disabled={!isValidAmount}
          class="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
        >
          Lanjutkan
        </button>
      </div>
    </div>
  {/if}

  <!-- Step 2: Region Selection -->
  {#if transferStep === 'region'}
    <div class="space-y-4">
      <div>
        <label for="region-select" class="block text-sm font-medium text-gray-700 mb-2">
          Pilih Daerah Tujuan
        </label>
        <select
          id="region-select"
          bind:value={selectedRegion}
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Pilih Provinsi --</option>
          {#each INDONESIAN_REGIONS as region}
            <option value={region.code}>{region.name} ({region.capital})</option>
          {/each}
        </select>
      </div>
      
      <div class="flex justify-between">
        <button
          on:click={prevStep}
          class="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors duration-200"
        >
          Kembali
        </button>
        <button
          on:click={nextStep}
          disabled={!isValidRegion}
          class="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
        >
          Lanjutkan
        </button>
      </div>
    </div>
  {/if}

  <!-- Step 3: User Selection -->
  {#if transferStep === 'user'}
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-gray-800 mb-3">
          Pilih Penerima di {INDONESIAN_REGIONS.find(r => r.code === selectedRegion)?.name}
        </h3>
        
        <!-- Search -->
        <div class="mb-4">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Cari pengguna berdasarkan nama, email, atau telepon..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {#if loading}
          <div class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p class="mt-2 text-gray-600">Memuat pengguna...</p>
          </div>
        {:else if filteredUsers.length === 0}
          <div class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p class="text-gray-600">Tidak ada pengguna ditemukan</p>
          </div>
        {:else}
          <div class="space-y-3 max-h-60 overflow-y-auto">
            {#each filteredUsers as user}
              <div 
                class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors duration-200 cursor-pointer {selectedUser?.id === user.id ? 'border-blue-500 bg-blue-50' : ''}"
                on:click={() => selectUser(user)}
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-lg">
                      {user.profilePicture || '👤'}
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-800">{user.fullName}</h4>
                      <p class="text-sm text-gray-600">{user.email}</p>
                      <p class="text-xs text-gray-500">{user.region?.city || 'Kota tidak diketahui'}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="flex items-center space-x-1">
                      <span class="text-xs {user.isOnline ? 'text-green-600' : 'text-gray-500'}">
                        {user.isOnline ? '🟢 Online' : '⚫ Offline'}
                      </span>
                    </div>
                    {#if user.preferredBank}
                      <p class="text-xs text-gray-500 mt-1">
                        {user.preferredBank.bankId?.toUpperCase()} • {user.preferredBank.accountNumber}
                      </p>
                    {/if}
                  </div>
                </div>
                {#if selectedUser?.id === user.id}
                  <div class="mt-2 pt-2 border-t border-blue-200">
                    <div class="text-xs text-blue-600">✓ Pengguna dipilih</div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
      
      <div class="flex justify-between">
        <button
          on:click={prevStep}
          class="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors duration-200"
        >
          Kembali
        </button>
        <button
          on:click={nextStep}
          disabled={!isValidUser}
          class="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
        >
          Lanjutkan
        </button>
      </div>
    </div>
  {/if}

  <!-- Step 4: Confirmation -->
  {#if transferStep === 'confirm'}
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-medium text-gray-800 mb-4">Konfirmasi Transfer Domestik</h3>
        
        <div class="bg-gray-50 rounded-lg p-4 space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Nominal Transfer:</span>
            <span class="font-medium text-gray-800">{formatAmount(parseFloat(amount))}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Daerah Tujuan:</span>
            <span class="font-medium text-gray-800">{INDONESIAN_REGIONS.find(r => r.code === selectedRegion)?.name}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Penerima:</span>
            <span class="font-medium text-gray-800">{selectedUser?.fullName}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Bank Penerima:</span>
            <span class="font-medium text-gray-800">{selectedUser?.preferredBank?.bankId?.toUpperCase()} • {selectedUser?.preferredBank?.accountNumber}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Biaya Admin:</span>
            <span class="font-medium text-gray-800">Rp 2.500</span>
          </div>
          <hr class="border-gray-300">
          <div class="flex justify-between text-lg">
            <span class="text-gray-800 font-medium">Total:</span>
            <span class="font-bold text-gray-800">{formatAmount(parseFloat(amount) + 2500)}</span>
          </div>
        </div>
      </div>
      
      <div class="flex justify-between">
        <button
          on:click={prevStep}
          class="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors duration-200"
        >
          Kembali
        </button>
        <button
          on:click={handleTransfer}
          class="px-8 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          Transfer Sekarang
        </button>
      </div>
    </div>
  {/if}

  <!-- Reset Button -->
  {#if transferStep !== 'amount'}
    <div class="mt-6 pt-4 border-t border-gray-200">
      <button
        on:click={resetTransfer}
        class="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
      >
        Reset Transfer
      </button>
    </div>
  {/if}
</div>