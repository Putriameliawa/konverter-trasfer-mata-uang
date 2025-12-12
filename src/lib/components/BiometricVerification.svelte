<script lang="js">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/auth';
  import Logo from './Logo.svelte';
  import BiometricVerificationService from '$lib/biometricVerification';
  import BankSelector from './BankSelector.svelte';
  import { getBankById } from '$lib/banks';

  let videoElement;
  let canvasElement;
  let verificationService = null;
  let isInitialized = false;
  let isVerifying = false;
  let verificationStep = 'setup'; // 'setup' | 'scanning' | 'face-detected' | 'hand-detected' | 'both-detected' | 'success' | 'failed'
  let countdown = 0;
  let verificationResult = null;
  let errorMessage = '';
  let successMessage = '';

  // ATM Card Information
  let atmCard = {
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    issuerBank: '',
    selectedBankId: '',
    cardType: 'debit'
  };

  // Detection status
  let faceDetected = false;
  let handDetected = false;
  let verificationProgress = 0;

  // Auth state
  $: authState = $auth;

  onMount(async () => {
    // Initialize auth and check authentication
    auth.init();
    const unsubscribe = auth.subscribe(authState => {
      if (!authState.isAuthenticated && !authState.isLoading) {
        goto('/login');
      }
    });

    // Auto-initialize verification
    await initializeVerification();
    
    return unsubscribe;
  });

  onDestroy(() => {
    cleanup();
  });

  async function initializeVerification() {
    try {
      verificationService = new BiometricVerificationService();
      
      verificationService.setCallbacks({
        onFaceDetected: handleFaceDetected,
        onHandDetected: handleHandDetected,
        onVerificationComplete: handleVerificationComplete,
        onError: handleError
      });

      isInitialized = true;
      verificationStep = 'scanning';
      // Auto-start camera after initialization
      setTimeout(() => {
        startCamera();
      }, 500);
    } catch (error) {
      console.error('Error initializing verification:', error);
      errorMessage = 'Failed to initialize biometric verification: ' + error.message;
    }
  }

  async function startCamera() {
    if (!verificationService || !videoElement || !canvasElement) {
      console.error('Missing required elements for camera initialization');
      errorMessage = 'Camera elements not ready. Please refresh the page.';
      return;
    }

    try {
      const success = await verificationService.initializeCamera(videoElement, canvasElement);
      if (success) {
        verificationStep = 'scanning';
        startVerificationTimer();
        successMessage = 'Camera started successfully!';
        // Clear success message after 3 seconds
        setTimeout(() => {
          successMessage = '';
        }, 3000);
      } else {
        errorMessage = 'Failed to start camera. Please check permissions.';
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      errorMessage = 'Camera access denied or not available: ' + error.message;
    }
  }

  function handleFaceDetected(results) {
    faceDetected = true;
    updateVerificationProgress();
  }

  function handleHandDetected(results) {
    handDetected = true;
    updateVerificationProgress();
  }

  function updateVerificationProgress() {
    let progress = 0;
    if (faceDetected) progress += 50;
    if (handDetected) progress += 50;
    
    verificationProgress = progress;

    if (faceDetected && !handDetected) {
      verificationStep = 'face-detected';
    } else if (!faceDetected && handDetected) {
      verificationStep = 'hand-detected';
    } else if (faceDetected && handDetected) {
      verificationStep = 'both-detected';
    }
  }

  function handleVerificationComplete(result) {
    verificationResult = result;
    if (result.success) {
      verificationStep = 'success';
      successMessage = 'Biometric verification completed successfully!';
      saveVerificationData(result);
    } else {
      verificationStep = 'failed';
      errorMessage = result.message || 'Verification failed';
    }
  }

  function handleError(error) {
    console.error('Verification error:', error);
    errorMessage = error;
    verificationStep = 'failed';
  }

  function startVerificationTimer() {
    if (isVerifying) return;
    
    isVerifying = true;
    countdown = 30; // 30 seconds for verification
    
    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        if (verificationStep !== 'success') {
          verificationStep = 'failed';
          errorMessage = 'Verification timeout. Please try again.';
        }
        isVerifying = false;
      }
    }, 1000);
  }

  async function captureVerification() {
    if (!verificationService) {
      errorMessage = 'Verification service not initialized';
      return;
    }

    try {
      const biometricData = await verificationService.captureVerification();
      if (biometricData) {
        verificationStep = 'success';
        successMessage = 'Biometric data captured successfully!';
        await saveVerificationData(biometricData);
      } else {
        errorMessage = 'Failed to capture biometric data. Please ensure both face and hand are visible.';
      }
    } catch (error) {
      console.error('Error capturing verification:', error);
      errorMessage = 'Failed to capture verification data: ' + error.message;
    }
  }

  async function saveVerificationData(data) {
    try {
      // Get selected bank information
      const selectedBank = getBankById(atmCard.selectedBankId);
      
      // Save verification data to user profile
      const verificationData = {
        biometric: data,
        atmCard: { ...atmCard },
        timestamp: new Date(),
        verified: true
      };

      // Also update preferred bank in profile
      const profileUpdate = {
        verificationData,
        preferredBank: selectedBank ? {
          bankId: selectedBank.id,
          bankName: selectedBank.fullName,
          accountNumber: atmCard.cardNumber.replace(/\s/g, ''),
          accountHolder: atmCard.cardHolder
        } : undefined
      };

      // Update user profile with verification and bank data
      const result = await auth.updateProfile(profileUpdate);

      if (result.success) {
        successMessage = 'Verification data saved successfully!';
        setTimeout(() => {
          goto('/');
        }, 3000);
      } else {
        errorMessage = 'Failed to save verification data: ' + result.message;
      }
    } catch (error) {
      console.error('Error saving verification data:', error);
      errorMessage = 'Failed to save verification data: ' + error.message;
    }
  }

  function resetVerification() {
    verificationStep = 'scanning';
    faceDetected = false;
    handDetected = false;
    verificationProgress = 0;
    errorMessage = '';
    successMessage = '';
    verificationResult = null;
    isVerifying = false;
    startCamera();
  }

  function goBack() {
    goto('/profile');
  }

  function cleanup() {
    if (verificationService) {
      verificationService.cleanup();
    }
  }

  function formatCardNumber(value) {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function handleCardNumberInput(event) {
    const formatted = formatCardNumber(event.target.value);
    atmCard.cardNumber = formatted;
    event.target.value = formatted;
  }

  function validateForm() {
    return atmCard.cardNumber.replace(/\s/g, '').length >= 16 && 
           atmCard.cardHolder.trim() !== '' && 
           atmCard.expiryDate !== '' && 
           atmCard.selectedBankId !== '';
  }
  
  function handleBankSelect(bank) {
    atmCard.selectedBankId = bank.id;
    atmCard.issuerBank = bank.fullName;
  }
</script>

<div class="min-h-screen py-8 px-4 relative overflow-hidden">
  <!-- Background decorative elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-20 left-10 w-32 h-32 bg-sky-200/20 rounded-full blur-xl floating"></div>
    <div class="absolute top-40 right-20 w-24 h-24 bg-cyan-200/30 rounded-full blur-lg floating" style="animation-delay: -2s;"></div>
    <div class="absolute bottom-20 left-1/3 w-40 h-40 bg-blue-200/15 rounded-full blur-2xl floating" style="animation-delay: -4s;"></div>
  </div>

  <div class="container mx-auto max-w-6xl relative z-10">
    <!-- Header -->
    <header class="text-center mb-8 floating">
      <div class="flex items-center justify-between mb-6">
        <button
          on:click={goBack}
          class="btn-secondary flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Profile</span>
        </button>

        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full {verificationStep === 'success' ? 'bg-emerald-500' : 'bg-sky-300'}"></div>
          <span class="text-sm text-sky-600">
            {verificationStep === 'success' ? 'Verified' : 'Verification Required'}
          </span>
        </div>
      </div>

      <div class="flex items-center justify-center mb-4 logo-glow">
        <Logo size={60} animated={true} />
      </div>
      
      <h1 class="text-4xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
        Biometric Verification
      </h1>
      <p class="text-sky-700 text-lg">
        Secure ATM card registration with face and palm scanning
      </p>
    </header>

    <!-- Messages -->
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

    <div class="grid lg:grid-cols-2 gap-8">
      <!-- ATM Card Information -->
      <div class="glass-card p-6 floating" style="animation-delay: -1s;">
        <div class="flex items-center mb-6">
          <svg class="w-6 h-6 text-sky-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h3 class="text-xl font-semibold text-sky-800">ATM Card Information</h3>
        </div>

        <div class="space-y-4">
          <!-- Card Number -->
          <div>
            <label class="block text-sm font-medium text-sky-700 mb-1">Card Number</label>
            <input
              type="text"
              bind:value={atmCard.cardNumber}
              on:input={handleCardNumberInput}
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              class="input-field"
            />
          </div>

          <!-- Card Holder -->
          <div>
            <label class="block text-sm font-medium text-sky-700 mb-1">Card Holder Name</label>
            <input
              type="text"
              bind:value={atmCard.cardHolder}
              placeholder="Full name as on card"
              class="input-field"
            />
          </div>

          <!-- Expiry Date -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-sky-700 mb-1">Expiry Date</label>
              <input
                type="month"
                bind:value={atmCard.expiryDate}
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-sky-700 mb-1">Card Type</label>
              <select bind:value={atmCard.cardType} class="input-field">
                <option value="debit">Debit Card</option>
                <option value="credit">Credit Card</option>
              </select>
            </div>
          </div>

          <!-- Bank Selection -->
          <div>
            <BankSelector
              bind:selectedBankId={atmCard.selectedBankId}
              onBankSelect={handleBankSelect}
              placeholder="Select your bank"
              required={true}
              disabled={isLoading}
            />
          </div>

          <!-- Form Validation Status -->
          <div class="mt-4 p-3 {validateForm() ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'} border rounded-lg">
            <div class="flex items-center text-sm">
              {#if validateForm()}
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                ATM card information is complete
              {:else}
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Please complete all ATM card fields
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- Biometric Scanning -->
      <div class="glass-card p-6 floating" style="animation-delay: -2s;">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-sky-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <h3 class="text-xl font-semibold text-sky-800">Biometric Scanning</h3>
          </div>
          
          {#if countdown > 0}
            <div class="text-sm text-sky-600">
              Time remaining: {countdown}s
            </div>
          {/if}
        </div>

        <!-- Camera View -->
        <div class="relative mb-4">
          <video
            bind:this={videoElement}
            class="w-full h-64 bg-gray-100 rounded-lg object-cover"
            autoplay
            muted
            playsinline
          ></video>
          
          <canvas
            bind:this={canvasElement}
            class="absolute top-0 left-0 w-full h-64 rounded-lg"
            width="640"
            height="480"
          ></canvas>

          <!-- Verification Overlay -->
          <div class="absolute top-4 left-4 right-4">
            <div class="bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
              {#if verificationStep === 'setup'}
                Setting up biometric detection...
              {:else if verificationStep === 'scanning'}
                Position your face and palm in view
              {:else if verificationStep === 'face-detected'}
                ✓ Face detected - Show your palm
              {:else if verificationStep === 'hand-detected'}
                ✓ Palm detected - Show your face
              {:else if verificationStep === 'both-detected'}
                ✓ Both detected - Hold steady
              {:else if verificationStep === 'success'}
                ✓ Verification complete!
              {:else if verificationStep === 'failed'}
                ✗ Verification failed
              {/if}
            </div>
          </div>

          <!-- Detection Status -->
          <div class="absolute bottom-4 left-4 right-4">
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
                <div class="w-2 h-2 rounded-full mr-2 {faceDetected ? 'bg-green-500' : 'bg-red-500'}"></div>
                Face {faceDetected ? 'Detected' : 'Not Found'}
              </div>
              <div class="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
                <div class="w-2 h-2 rounded-full mr-2 {handDetected ? 'bg-green-500' : 'bg-red-500'}"></div>
                Palm {handDetected ? 'Detected' : 'Not Found'}
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-sky-600 mb-1">
            <span>Verification Progress</span>
            <span>{verificationProgress}%</span>
          </div>
          <div class="w-full bg-sky-100 rounded-full h-2">
            <div 
              class="bg-gradient-to-r from-sky-400 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style="width: {verificationProgress}%"
            ></div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          {#if !isInitialized}
            <button
              on:click={initializeVerification}
              class="btn-primary w-full"
            >
              Initialize Verification
            </button>
          {:else if verificationStep === 'scanning' || verificationStep === 'setup'}
            <button
              on:click={startCamera}
              class="btn-primary w-full"
              disabled={!validateForm()}
            >
              Start Camera
            </button>
          {:else if verificationStep === 'both-detected'}
            <button
              on:click={captureVerification}
              class="btn-primary w-full"
            >
              Capture Verification
            </button>
          {:else if verificationStep === 'failed'}
            <button
              on:click={resetVerification}
              class="btn-secondary w-full"
            >
              Try Again
            </button>
          {:else if verificationStep === 'success'}
            <div class="text-center text-emerald-600 font-medium">
              Redirecting to main page in 3 seconds...
            </div>
          {/if}
        </div>

        <!-- Instructions -->
        <div class="mt-6 p-4 bg-sky-50/50 rounded-lg">
          <h4 class="font-medium text-sky-800 mb-2">Instructions:</h4>
          <ul class="text-sm text-sky-600 space-y-1">
            <li>• Ensure good lighting conditions</li>
            <li>• Position your face clearly in the camera view</li>
            <li>• Show your open palm to the camera</li>
            <li>• Hold steady when both are detected</li>
            <li>• Complete ATM card information first</li>
          </ul>
        </div>
      </div>
    </div>
    
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