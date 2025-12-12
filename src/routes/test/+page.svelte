<script>
  import { onMount } from 'svelte';
  import { auth } from '$lib/auth';
  
  let user = null;
  let loading = true;
  let error = null;
  
  onMount(async () => {
    try {
      // Initialize auth store
      await auth.init();
      
      // Check if user is authenticated
      const authState = auth;
      if (authState && authState.user) {
        user = authState.user;
      } else {
        // Check localStorage for user data
        const savedAuth = localStorage.getItem('auth');
        if (savedAuth) {
          const parsedAuth = JSON.parse(savedAuth);
          if (parsedAuth.isAuthenticated && parsedAuth.user) {
            user = parsedAuth.user;
          }
        }
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 p-4">
  <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
    <div class="p-1 bg-gradient-to-r from-cyan-500 to-blue-500">
      <div class="bg-white p-8 rounded-t-2xl">
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Authentication Test</h1>
        
        {#if loading}
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
            <p class="mt-4 text-gray-600">Checking authentication status...</p>
          </div>
        {:else if error}
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">Error! </strong>
            <span class="block sm:inline">{error}</span>
          </div>
        {:else if user}
          <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">Success! </strong>
            <span class="block sm:inline">Authenticated as {user.email}</span>
          </div>
        {:else}
          <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">Not authenticated </strong>
            <span class="block sm:inline">No user is currently signed in.</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>