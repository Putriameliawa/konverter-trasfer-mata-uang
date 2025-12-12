<script lang="js">
  import { onMount } from 'svelte';
  import { userService, formatLastSeen, formatMemberSince } from '$lib/users';
  import { getBankById } from '$lib/banks';
  import { t } from '$lib/i18n';
  
  export let onUserSelect = null; // Callback when user is selected for transfer
  export let showSelectButton = false; // Show select button for transfer
  export let currentUserId = null; // Current user ID to exclude from list
  
  let users = [];
  let filteredUsers = [];
  let searchQuery = '';
  let selectedFilter = 'all'; // 'all', 'online', 'recent'
  let loading = true;
  
  onMount(() => {
    loadUsers();
    loading = false;
  });
  
  function loadUsers() {
    users = userService.getAllUsers(currentUserId);
    filterUsers();
  }
  
  function filterUsers() {
    let baseUsers = users;
    
    // Apply search filter
    if (searchQuery.trim()) {
      baseUsers = userService.searchUsers(searchQuery, currentUserId);
    }
    
    // Apply status filter
    switch (selectedFilter) {
      case 'online':
        filteredUsers = baseUsers.filter(user => user.isOnline);
        break;
      case 'recent':
        filteredUsers = userService.getRecentUsers(currentUserId, 10);
        if (searchQuery.trim()) {
          const searchLower = searchQuery.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            user.fullName.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
          );
        }
        break;
      default:
        filteredUsers = baseUsers;
    }
  }
  
  function handleSearch() {
    filterUsers();
  }
  
  function handleFilterChange() {
    searchQuery = '';
    filterUsers();
  }
  
  function handleUserSelect(user) {
    if (onUserSelect) {
      onUserSelect(user);
    }
  }
  
  function getUserBank(user) {
    if (!user.preferredBank?.bankId) return null;
    return getBankById(user.preferredBank.bankId);
  }
  
  function canTransferToUser(user) {
    return userService.canReceiveTransfer(user);
  }
</script>

<div class="user-directory">
  <!-- Header -->
  <div class="mb-6">
    <h2 class="text-2xl font-bold text-sky-800 mb-2">
      {$t('users.directory')}
    </h2>
    <p class="text-sky-600">
      {$t('users.directorySubtitle')}
    </p>
  </div>

  <!-- Search and Filters -->
  <div class="glass-card p-4 mb-6">
    <div class="flex flex-col md:flex-row gap-4">
      <!-- Search Input -->
      <div class="flex-1">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            bind:value={searchQuery}
            on:input={handleSearch}
            placeholder={$t('users.searchPlaceholder')}
            class="w-full pl-10 pr-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 backdrop-blur-sm"
          />
        </div>
      </div>
      
      <!-- Filter Buttons -->
      <div class="flex space-x-2">
        <button
          on:click={() => { selectedFilter = 'all'; handleFilterChange(); }}
          class="filter-btn {selectedFilter === 'all' ? 'active' : ''}"
        >
          {$t('users.allUsers')}
        </button>
        <button
          on:click={() => { selectedFilter = 'online'; handleFilterChange(); }}
          class="filter-btn {selectedFilter === 'online' ? 'active' : ''}"
        >
          🟢 {$t('users.online')}
        </button>
        <button
          on:click={() => { selectedFilter = 'recent'; handleFilterChange(); }}
          class="filter-btn {selectedFilter === 'recent' ? 'active' : ''}"
        >
          ⏰ {$t('users.recent')}
        </button>
      </div>
    </div>
  </div>

  <!-- Users List -->
  {#if loading}
    <div class="glass-card p-8 text-center">
      <div class="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-sky-600">{$t('common.loading')}</p>
    </div>
  {:else if filteredUsers.length === 0}
    <div class="glass-card p-8 text-center">
      <svg class="w-16 h-16 text-sky-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
      <h3 class="text-lg font-medium text-sky-800 mb-2">{$t('users.noUsersFound')}</h3>
      <p class="text-sky-600">{$t('users.tryDifferentSearch')}</p>
    </div>
  {:else}
    <div class="grid gap-4">
      {#each filteredUsers as user (user.id)}
        <div class="glass-card p-4 hover:shadow-lg transition-all duration-200">
          <div class="flex items-center justify-between">
            <!-- User Info -->
            <div class="flex items-center space-x-4">
              <!-- Profile Picture -->
              <div class="w-12 h-12 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center text-xl">
                {user.profilePicture || '👤'}
              </div>
              
              <!-- User Details -->
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <h3 class="font-semibold text-sky-800">{user.fullName}</h3>
                  <span class="text-sm">
                    {user.isOnline ? '🟢' : '⚫'}
                  </span>
                </div>
                
                <p class="text-sm text-sky-600">{user.email}</p>
                
                <!-- Bank Info -->
                {#if user.preferredBank}
                  {@const bank = getUserBank(user)}
                  {#if bank}
                    <div class="flex items-center space-x-2 mt-1">
                      <span class="text-sm">{bank.logo}</span>
                      <span class="text-xs text-sky-500">
                        {bank.name} • {user.preferredBank.accountNumber}
                      </span>
                    </div>
                  {/if}
                {:else}
                  <p class="text-xs text-amber-500 mt-1">{$t('users.noBankInfo')}</p>
                {/if}
              </div>
            </div>
            
            <!-- User Stats and Actions -->
            <div class="flex items-center space-x-4">
              <!-- User Stats -->
              <div class="text-right text-xs text-sky-500">
                {#if user.transferHistory?.totalTransfers}
                  <p>{user.transferHistory.totalTransfers} {$t('users.transfers')}</p>
                {/if}
                <p>{formatLastSeen(user.lastSeen)}</p>
                <p>{$t('users.memberSince')} {formatMemberSince(user.joinedDate)}</p>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex flex-col space-y-2">
                {#if showSelectButton}
                  <button
                    on:click={() => handleUserSelect(user)}
                    disabled={!canTransferToUser(user)}
                    class="btn-primary-sm {!canTransferToUser(user) ? 'opacity-50 cursor-not-allowed' : ''}"
                  >
                    {$t('users.selectForTransfer')}
                  </button>
                {:else}
                  <!-- Profile View Button -->
                  <button class="btn-secondary-sm">
                    {$t('users.viewProfile')}
                  </button>
                {/if}
                
                <!-- Quick Actions -->
                <div class="flex space-x-1">
                  <button 
                    class="icon-btn"
                    title={$t('users.sendMessage')}
                  >
                    💬
                  </button>
                  <button 
                    class="icon-btn"
                    title={$t('users.addToFavorites')}
                  >
                    ⭐
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Summary -->
  <div class="mt-6 text-center text-sm text-sky-600">
    {$t('users.showingResults', { count: filteredUsers.length, total: users.length })}
  </div>
</div>

<style>
  .glass-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .filter-btn {
    padding: 1rem;
    font-size: 0.875rem;
    border-radius: 0.5rem;
    transition: colors 200ms;
    border: 1px solid rgb(186 230 253);
    background: rgba(255, 255, 255, 0.7);
    color: #0369a1;
  }

  .filter-btn:hover {
    background-color: rgb(240 249 255);
    border-color: rgb(147 197 253);
  }

  .filter-btn.active {
    background-color: rgb(14 165 233);
    color: white;
    border-color: rgb(14 165 233);
  }

  .btn-primary-sm {
    background: linear-gradient(to right, rgb(14 165 233), rgb(8 145 178));
    color: white;
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    border-radius: 0.5rem;
    transition: all 200ms;
    font-size: 0.875rem;
  }

  .btn-primary-sm:hover {
    background: linear-gradient(to right, rgb(2 132 199), rgb(21 94 117));
  }

  .btn-secondary-sm {
    background-color: rgb(224 242 254);
    color: rgb(3 105 161);
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    border-radius: 0.5rem;
    transition: colors 200ms;
    font-size: 0.875rem;
  }

  .btn-secondary-sm:hover {
    background-color: rgb(186 230 253);
  }

  .icon-btn {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    transition: colors 200ms;
    font-size: 0.875rem;
  }

  .icon-btn:hover {
    background-color: rgb(240 249 255);
  }
</style>