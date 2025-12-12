<script>
  import { onMount, onDestroy } from 'svelte';
  import { HandDetector, FallbackHandDetector } from '$lib/handDetection';
  
  export let active = false;
  export let onHandDetected;
  export let onHandLost;
  
  let videoElement;
  let canvasElement;
  let detector = null;
  let isDetecting = false;
  let handDetected = false;
  let error = '';
  let usesFallback = false;
  let detectionConfidence = 0;
  
  async function startDetection() {
    if (isDetecting || !videoElement) return;
    
    error = '';
    isDetecting = true;
    
    try {
      // Try MediaPipe first, fallback to simple detection
      try {
        detector = new HandDetector();
        await detector.startDetection(videoElement, handleDetectionResult);
        usesFallback = false;
      } catch (e) {
        console.log('MediaPipe not available, using fallback detection');
        detector = new FallbackHandDetector();
        await detector.startDetection(videoElement, handleDetectionResult);
        usesFallback = true;
      }
      
    } catch (e) {
      error = 'Failed to start hand detection. Please check camera permissions.';
      console.error('Detection error:', e);
      isDetecting = false;
    }
  }
  
  function stopDetection() {
    if (detector) {
      detector.stop();
      detector = null;
    }
    isDetecting = false;
    handDetected = false;
    detectionConfidence = 0;
  }
  
  function handleDetectionResult(result) {
    detectionConfidence = result.confidence;
    
    if (result.detected && !handDetected) {
      handDetected = true;
      onHandDetected();
    } else if (!result.detected && handDetected) {
      handDetected = false;
      onHandLost();
    }
    
    // Draw detection indicator on canvas
    if (canvasElement) {
      drawDetectionFeedback(result);
    }
  }
  
  function drawDetectionFeedback(result) {
    const ctx = canvasElement.getContext('2d');
    if (!ctx || !videoElement) return;
    
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    if (result.detected) {
      // Draw green overlay when hand is detected
      ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
      
      // Draw confidence indicator
      ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.fillRect(10, 10, 200 * result.confidence, 10);
      
      // Draw border
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, canvasElement.width, canvasElement.height);
    }
  }
  
  $: if (active && !isDetecting) {
    startDetection();
  } else if (!active && isDetecting) {
    stopDetection();
  }
  
  onMount(() => {
    if (canvasElement && videoElement) {
      canvasElement.width = 640;
      canvasElement.height = 480;
    }
  });
  
  onDestroy(() => {
    stopDetection();
  });
</script>

<div class="glass-card p-6">
  <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">Hand Detection Transfer</h3>
  
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{error}</p>
    </div>
  {/if}
  
  <div class="relative mx-auto w-full max-w-lg">
    <!-- Video Element -->
    <video
      bind:this={videoElement}
      class="w-full rounded-lg {handDetected ? 'ring-4 ring-green-400' : ''}"
      autoplay
      muted
      playsinline
    ></video>
    
    <!-- Canvas Overlay -->
    <canvas
      bind:this={canvasElement}
      class="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
    ></canvas>
    
    <!-- Detection Status -->
    <div class="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
      {#if isDetecting}
        {#if handDetected}
          <span class="text-green-400">✓ Hand Detected</span>
        {:else}
          <span class="text-yellow-400">⚡ Scanning...</span>
        {/if}
      {:else}
        <span class="text-gray-400">○ Inactive</span>
      {/if}
    </div>
    
    <!-- Confidence Meter -->
    {#if isDetecting && detectionConfidence > 0}
      <div class="absolute bottom-4 left-4 right-4">
        <div class="bg-black/70 rounded-lg p-2">
          <div class="text-white text-xs mb-1">Confidence: {Math.round(detectionConfidence * 100)}%</div>
          <div class="w-full bg-gray-700 rounded-full h-2">
            <div 
              class="bg-green-400 h-2 rounded-full transition-all duration-300"
              style="width: {detectionConfidence * 100}%"
            ></div>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Instructions -->
  <div class="mt-4 text-center">
    {#if usesFallback}
      <p class="text-sm text-blue-600 mb-2">
        💡 Fallback mode: Click on the video to simulate hand detection
      </p>
    {:else}
      <p class="text-sm text-blue-600 mb-2">
        👋 Show your open palm to the camera
      </p>
    {/if}
    
    {#if !active}
      <p class="text-sm text-gray-500">Complete currency conversion first to activate transfer</p>
    {:else if !isDetecting}
      <p class="text-sm text-orange-600">Starting camera...</p>
    {:else if !handDetected}
      <p class="text-sm text-blue-600">Position your hand in view of the camera</p>
    {:else}
      <p class="text-sm text-green-600 animate-pulse">Hand detected! Hold steady to complete transfer...</p>
    {/if}
  </div>
</div>