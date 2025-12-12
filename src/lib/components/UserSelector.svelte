<script lang="js">
  import { userService } from '$lib/users';
  import { getBankById } from '$lib/banks';
  import { t } from '$lib/i18n';
  
  export let selectedUser = null;
  export let onUserSelect = null;
  export let currentUserId = null;
  
  let showUserList = false;
  let searchQuery = '';
  let users = [];
  
  $: filteredUsers = searchQuery.trim() 
    ? userService.searchUsers(searchQuery, currentUserId)
    : userService.getRecentUsers(currentUserId, 5);
  
  function handleUserSelect(user) {
    selectedUser = user;
    showUserList = false;
    searchQuery = '';
    if (onUserSelect) {
      onUserSelect(user);
    }
  }
  
  function clearSelection() {
    selectedUser = null;
    if (onUserSelect) {
      onUserSelect(null);
    }
  }
  
  function toggleUserList() {
    showUserList = !showUserList;
    if (showUserList) {
      users = userService.getAllUsers(currentUserId);
    }
  }
</script>

<div class="user-selector">
  {#if selectedUser}
    <!-- Selected User Display -->
    <div class="selected-user bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-sm">
            {selectedUser.profilePicture || '👤'}
          </div>
          <div>
            <p class="font-medium text-blue-800">{selectedUser.fullName}</p>
            <p class="text-xs text-blue-600">{selectedUser.email}</p>
          </div>
        </div>
        <button
          on:click={clearSelection}
          class="text-blue-400 hover:text-blue-600 p-1 rounded"
          title="Clear selection"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  {:else}
    <!-- User Selection Button -->
    <div class="mb-4">
      <button
        on:click={toggleUserList}
        class="w-full p-3 border-2 border-dashed border-blue-200 rounded-lg text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        <span>Select Recipient User</span>
      </button>
    </div>
  {/if}
  
  <!-- User Selection Dropdown -->
  {#if showUserList && !selectedUser}
    <div class="user-list bg-white border border-blue-200 rounded-lg shadow-lg mb-4 max-h-64 overflow-y-auto">
      <!-- Search -->
      <div class="p-3 border-b">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search users..."
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <!-- User List -->
      {#if filteredUsers.length === 0}
        <div class="p-4 text-center text-gray-500 text-sm">
          No users found
        </div>
      {:else}
        {#each filteredUsers as user (user.id)}
          <button
            on:click={() => handleUserSelect(user)}
            class="w-full p-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3 text-left"
            disabled={!userService.canReceiveTransfer(user)}
          >
            <div class="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-sm">
              {user.profilePicture || '👤'}
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-800">{user.fullName}</p>
              <p class="text-xs text-gray-600">{user.email}</p>
              {#if user.preferredBank}
                {@const bank = getBankById(user.preferredBank.bankId)}
                <p class="text-xs text-blue-500">{bank?.name} • {user.preferredBank.accountNumber}</p>
              {:else}
                <p class="text-xs text-red-500">No bank info</p>
              {/if}
            </div>
            <div class="text-xs">
              {user.isOnline ? '🟢' : '⚫'}
            </div>
          </button>
        {/each}
      {/if}
      
      <!-- View All Users Link -->
      <div class="p-3 border-t">
        <a
          href="/users"
          class="w-full block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All Users →
        </a>
      </div>
    </div>
  {/if}
</div>

<style>
  .user-selector {
    position: relative;
    z-index: 10;
  }
</style>