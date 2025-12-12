<script lang="js">
  import { auth } from '$lib/auth';
  import Logo from './Logo.svelte';
  import LanguageSelector from './LanguageSelector.svelte';
  import BankSelector from './BankSelector.svelte';
  import { getBankById } from '$lib/banks';
  import { t } from '$lib/i18n';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  export let isEditing = false;

  let user = null;
  let editData = {};
  let successMessage = '';
  let errorMessage = '';
  let isLoading = false;

  // Subscribe to auth store
  $: authState = $auth;
  $: {
    if (authState.user) {
      user = authState.user;
      // Initialize edit data with current profile
      editData = JSON.parse(JSON.stringify(user.profile));
    }
  }
  
  onMount(async () => {
    // Initialize auth store
    await auth.init();
    
    // Check authentication status and redirect if needed
    const unsubscribe = auth.subscribe(authState => {
      if (!authState.isAuthenticated && !authState.isLoading) {
        goto('/login');
      }
    });
    
    return unsubscribe;
  });

  function toggleEdit() {
    isEditing = !isEditing;
    if (isEditing && user) {
      // Reset edit data when starting to edit
      editData = JSON.parse(JSON.stringify(user.profile));
      
      // Ensure preferredBank object exists
      if (!editData.preferredBank) {
        editData.preferredBank = {
          bankId: '',
          bankName: '',
          accountNumber: '',
          accountHolder: ''
        };
      }
    }
    successMessage = '';
    errorMessage = '';
  }

  async function handleSave() {
    isLoading = true;
    errorMessage = '';
    successMessage = '';

    try {
      const result = await auth.updateProfile(editData);
      
      if (result.success) {
        successMessage = result.message;
        isEditing = false;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          successMessage = '';
        }, 3000);
      } else {
        errorMessage = result.message;
      }
    } catch (error) {
      errorMessage = 'Failed to save profile. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function handleCancel() {
    isEditing = false;
    if (user) {
      editData = JSON.parse(JSON.stringify(user.profile));
      
      // Ensure preferredBank object exists
      if (!editData.preferredBank) {
        editData.preferredBank = {
          bankId: '',
          bankName: '',
          accountNumber: '',
          accountHolder: ''
        };
      }
    }
    errorMessage = '';
    successMessage = '';
  }

  function goToMain() {
    goto('/');
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function calculateMembershipDuration() {
    if (!user?.profile?.memberSince) return '';
    
    const memberSince = new Date(user.profile.memberSince);
    const now = new Date();
    const diffTime = Math.abs(now - memberSince);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      let result = `${years} year${years > 1 ? 's' : ''}`;
      if (remainingMonths > 0) {
        result += ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
      }
      return result;
    }
  }

  function handleBankSelect(bank) {
    editData.preferredBank = {
      bankId: bank.id,
      bankName: bank.fullName,
      accountNumber: editData.preferredBank?.accountNumber || '',
      accountHolder: editData.preferredBank?.accountHolder || ''
    };
  }
</script>

<div class="min-h-screen py-8 px-4 relative overflow-hidden">
  <!-- Background decorative elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-20 left-10 w-32 h-32 bg-sky-200/20 rounded-full blur-xl floating"></div>
    <div class="absolute top-40 right-20 w-24 h-24 bg-cyan-200/30 rounded-full blur-lg floating" style="animation-delay: -2s;"></div>
    <div class="absolute bottom-20 left-1/3 w-40 h-40 bg-blue-200/15 rounded-full blur-2xl floating" style="animation-delay: -4s;"></div>
  </div>

  <div class="container mx-auto max-w-4xl relative z-10">
    <!-- Header -->
    <header class="text-center mb-8 floating">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <!-- Language Selector -->
          <LanguageSelector />
          
          <a
            href="/verification"
            class="btn-primary flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>{$t('nav.verification')}</span>
          </a>
          {#if !isEditing}
            <button
              on:click={toggleEdit}
              class="btn-secondary flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>{$t('common.edit')}</span>
            </button>
          {/if}
        </div>

        <button
          on:click={goToMain}
          class="btn-secondary flex items-center space-x-2"
        >
          <span>{$t('nav.backToMain')}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div class="flex items-center justify-center mb-4 logo-glow">
        <Logo size={60} animated={true} />
      </div>
      
      <h1 class="text-4xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
        {$t('profile.title')}
      </h1>
      <p class="text-sky-700 text-lg">
        {isEditing ? $t('profile.editSubtitle') : $t('profile.subtitle')}
      </p>
    </header>

    <!-- Success/Error Messages -->
    {#if successMessage}
      <div class="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl floating">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      </div>
    {/if}

    {#if errorMessage}
      <div class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl floating">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      </div>
    {/if}

    {#if user}
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Personal Information -->
        <div class="glass-card p-6 floating" style="animation-delay: -1s;">
          <div class="flex items-center mb-4">
            <svg class="w-6 h-6 text-sky-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 class="text-xl font-semibold text-sky-800">{$t('profile.personalInfo')}</h3>
          </div>

          <div class="space-y-4">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-medium text-sky-700 mb-1">{$t('profile.fullName')}</label>
              {#if isEditing}
                <input
                  type="text"
                  bind:value={editData.fullName}
                  placeholder="Enter your full name"
                  class="input-field"
                  disabled={isLoading}
                />
              {:else}
                <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                  {user.profile.fullName || 'Not provided'}
                </p>
              {/if}
            </div>

            <!-- Email (Read-only) -->
            <div>
              <label class="block text-sm font-medium text-sky-700 mb-1">{$t('auth.email')}</label>
              <p class="text-sky-800 bg-gray-50/50 px-3 py-2 rounded-lg">
                {user.email}
                <span class="text-xs text-sky-500 ml-2">{$t('profile.cannotChange')}</span>
              </p>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-sky-700 mb-1">{$t('auth.phone')}</label>
              <p class="text-sky-800 bg-gray-50/50 px-3 py-2 rounded-lg">
                {user.phone}
                <span class="text-xs text-sky-500 ml-2">{$t('profile.cannotChange')}</span>
              </p>
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="block text-sm font-medium text-sky-700 mb-1">Date of Birth</label>
              {#if isEditing}
                <input
                  type="date"
                  bind:value={editData.dateOfBirth}
                  class="input-field"
                  disabled={isLoading}
                />
              {:else}
                <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                  {user.profile.dateOfBirth ? formatDate(user.profile.dateOfBirth) : 'Not provided'}
                </p>
              {/if}
            </div>

            <!-- Gender -->
            <div>
              <label class="block text-sm font-medium text-sky-700 mb-1">Gender</label>
              {#if isEditing}
                <select
                  bind:value={editData.gender}
                  class="input-field"
                  disabled={isLoading}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              {:else}
                <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg capitalize">
                  {user.profile.gender || 'Not provided'}
                </p>
              {/if}
            </div>

            <!-- Nationality -->
            <div>
              <label class="block text-sm font-medium text-sky-700 mb-1">Nationality</label>
              {#if isEditing}
                <input
                  type="text"
                  bind:value={editData.nationality}
                  placeholder="e.g., Indonesian, American, etc."
                  class="input-field"
                  disabled={isLoading}
                />
              {:else}
                <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                  {user.profile.nationality || 'Not provided'}
                </p>
              {/if}
            </div>

            <!-- Occupation -->
            <div>
              <label class="block text-sm font-medium text-sky-700 mb-1">Occupation</label>
              {#if isEditing}
                <input
                  type="text"
                  bind:value={editData.occupation}
                  placeholder="Your job or profession"
                  class="input-field"
                  disabled={isLoading}
                />
              {:else}
                <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                  {user.profile.occupation || 'Not provided'}
                </p>
              {/if}
            </div>
          </div>
        </div>

        <!-- Address & Additional Info -->
        <div class="space-y-8">
          <!-- Address -->
          <div class="glass-card p-6 floating" style="animation-delay: -2s;">
            <div class="flex items-center mb-4">
              <svg class="w-6 h-6 text-sky-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 class="text-xl font-semibold text-sky-800">Address</h3>
            </div>

            <div class="space-y-4">
              <!-- Street -->
              <div>
                <label class="block text-sm font-medium text-sky-700 mb-1">Street Address</label>
                {#if isEditing}
                  <input
                    type="text"
                    bind:value={editData.address.street}
                    placeholder="Street address"
                    class="input-field"
                    disabled={isLoading}
                  />
                {:else}
                  <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                    {user.profile.address.street || 'Not provided'}
                  </p>
                {/if}
              </div>

              <!-- City -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-sky-700 mb-1">City</label>
                  {#if isEditing}
                    <input
                      type="text"
                      bind:value={editData.address.city}
                      placeholder="City"
                      class="input-field"
                      disabled={isLoading}
                    />
                  {:else}
                    <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                      {user.profile.address.city || 'Not provided'}
                    </p>
                  {/if}
                </div>

                <div>
                  <label class="block text-sm font-medium text-sky-700 mb-1">State/Province</label>
                  {#if isEditing}
                    <input
                      type="text"
                      bind:value={editData.address.state}
                      placeholder="State/Province"
                      class="input-field"
                      disabled={isLoading}
                    />
                  {:else}
                    <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                      {user.profile.address.state || 'Not provided'}
                    </p>
                  {/if}
                </div>
              </div>

              <!-- Postal Code and Country -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-sky-700 mb-1">Postal Code</label>
                  {#if isEditing}
                    <input
                      type="text"
                      bind:value={editData.address.postalCode}
                      placeholder="Postal Code"
                      class="input-field"
                      disabled={isLoading}
                    />
                  {:else}
                    <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                      {user.profile.address.postalCode || 'Not provided'}
                    </p>
                  {/if}
                </div>

                <div>
                  <label class="block text-sm font-medium text-sky-700 mb-1">Country</label>
                  {#if isEditing}
                    <input
                      type="text"
                      bind:value={editData.address.country}
                      placeholder="Country"
                      class="input-field"
                      disabled={isLoading}
                    />
                  {:else}
                    <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                      {user.profile.address.country || 'Not provided'}
                    </p>
                  {/if}
                </div>
              </div>
            </div>
          </div>

          <!-- Banking Information -->
          <div class="glass-card p-6 floating" style="animation-delay: -2.5s;">
            <div class="flex items-center mb-4">
              <svg class="w-6 h-6 text-sky-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 class="text-xl font-semibold text-sky-800">Banking Information</h3>
            </div>

            <div class="space-y-4">
              <!-- Preferred Bank Selection -->
              <div>
                {#if isEditing}
                  <BankSelector
                    selectedBankId={editData.preferredBank?.bankId || ''}
                    onBankSelect={handleBankSelect}
                    placeholder="Select your preferred bank"
                    disabled={isLoading}
                  />
                {:else}
                  <label class="block text-sm font-medium text-sky-700 mb-1">Preferred Bank</label>
                  {#if user.profile.preferredBank?.bankId}
                    {@const selectedBank = getBankById(user.profile.preferredBank.bankId)}
                    {#if selectedBank}
                      <div class="bg-sky-50/50 px-3 py-2 rounded-lg flex items-center space-x-3">
                        <span class="text-2xl">{selectedBank.logo}</span>
                        <div>
                          <div class="font-medium text-sky-800">{selectedBank.name}</div>
                          <div class="text-sm text-sky-600">{selectedBank.fullName}</div>
                        </div>
                      </div>
                    {:else}
                      <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">Bank information unavailable</p>
                    {/if}
                  {:else}
                    <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">No preferred bank selected</p>
                  {/if}
                {/if}
              </div>

              <!-- Bank Account Information -->
              {#if user.profile.preferredBank?.bankId || isEditing}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Account Number -->
                  <div>
                    <label class="block text-sm font-medium text-sky-700 mb-1">Account Number</label>
                    {#if isEditing}
                      <input
                        type="text"
                        bind:value={editData.preferredBank.accountNumber}
                        placeholder="Your account number"
                        class="input-field"
                        disabled={isLoading}
                      />
                    {:else}
                      <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                        {user.profile.preferredBank?.accountNumber || 'Not provided'}
                      </p>
                    {/if}
                  </div>

                  <!-- Account Holder -->
                  <div>
                    <label class="block text-sm font-medium text-sky-700 mb-1">Account Holder Name</label>
                    {#if isEditing}
                      <input
                        type="text"
                        bind:value={editData.preferredBank.accountHolder}
                        placeholder="Account holder name"
                        class="input-field"
                        disabled={isLoading}
                      />
                    {:else}
                      <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                        {user.profile.preferredBank?.accountHolder || 'Not provided'}
                      </p>
                    {/if}
                  </div>
                </div>
              {/if}

              <!-- Bank Account Information (Legacy) -->
              <div class="border-t border-sky-100 pt-4">
                <h4 class="text-sm font-medium text-sky-700 mb-3">Primary Bank Account</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Legacy Account Number -->
                  <div>
                    <label class="block text-sm font-medium text-sky-700 mb-1">Account Number</label>
                    {#if isEditing}
                      <input
                        type="text"
                        bind:value={editData.bankAccount.accountNumber}
                        placeholder="Account number"
                        class="input-field"
                        disabled={isLoading}
                      />
                    {:else}
                      <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                        {user.profile.bankAccount.accountNumber || 'Not provided'}
                      </p>
                    {/if}
                  </div>

                  <!-- Legacy Bank Name -->
                  <div>
                    <label class="block text-sm font-medium text-sky-700 mb-1">Bank Name</label>
                    {#if isEditing}
                      <input
                        type="text"
                        bind:value={editData.bankAccount.bankName}
                        placeholder="Bank name"
                        class="input-field"
                        disabled={isLoading}
                      />
                    {:else}
                      <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                        {user.profile.bankAccount.bankName || 'Not provided'}
                      </p>
                    {/if}
                  </div>
                </div>

                <!-- Legacy Account Holder -->
                <div class="mt-4">
                  <label class="block text-sm font-medium text-sky-700 mb-1">Account Holder</label>
                  {#if isEditing}
                    <input
                      type="text"
                      bind:value={editData.bankAccount.accountHolder}
                      placeholder="Account holder name"
                      class="input-field"
                      disabled={isLoading}
                    />
                  {:else}
                    <p class="text-sky-800 bg-sky-50/50 px-3 py-2 rounded-lg">
                      {user.profile.bankAccount.accountHolder || 'Not provided'}
                    </p>
                  {/if}
                </div>
              </div>
            </div>
          </div>

          <!-- Membership Info -->
          <div class="glass-card p-6 floating" style="animation-delay: -3s;">
            <div class="flex items-center mb-4">
              <svg class="w-6 h-6 text-sky-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <h3 class="text-xl font-semibold text-sky-800">Membership Information</h3>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sky-600">Member Since:</span>
                <span class="text-sky-800 font-medium">
                  {formatDate(user.profile.memberSince)}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sky-600">Membership Duration:</span>
                <span class="text-sky-800 font-medium">
                  {calculateMembershipDuration()}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sky-600">Last Login:</span>
                <span class="text-sky-800 font-medium">
                  {formatDate(user.profile.lastLogin)}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sky-600">Account Status:</span>
                <span class="text-emerald-600 font-medium flex items-center">
                  <div class="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons for Editing -->
      {#if isEditing}
        <div class="flex justify-center space-x-4 mt-8 floating" style="animation-delay: -4s;">
          <button
            on:click={handleCancel}
            class="btn-secondary"
            disabled={isLoading}
          >
            {$t('common.cancel')}
          </button>
          
          <button
            on:click={handleSave}
            class="btn-primary"
            disabled={isLoading}
          >
            {#if isLoading}
              <div class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            {:else}
              {$t('profile.saveChanges')}
            {/if}
          </button>
        </div>
      {/if}
    {:else}
      <div class="text-center">
        <p class="text-sky-600">Loading profile...</p>
      </div>
    {/if}
    
    <!-- Footer -->
    <footer class="text-center mt-12 text-sky-500 text-sm">
      <div class="mt-4 pt-4 border-t border-sky-200">
        <p class="text-sky-600 font-medium mb-1">Dibuat oleh</p>
        <p class="text-sky-700 font-semibold">Putri Amelia</p>
        <p class="text-sky-500 text-xs mt-1">MA KHA WAHID HASYIM BANGIL</p>
      </div>
    </footer>
  </div>
</div>