<script>
  export let size = 60;
  export let animated = true;
</script>

<div class="logo-container {animated ? 'logo-animated' : ''}" style="width: {size}px; height: {size}px;">
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 60 60" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    class="logo-svg"
  >
    <!-- Background circle with gradient -->
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:0.1" />
        <stop offset="50%" style="stop-color:#0284c7;stop-opacity:0.2" />
        <stop offset="100%" style="stop-color:#0891b2;stop-opacity:0.1" />
      </linearGradient>
      
      <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0ea5e9" />
        <stop offset="50%" style="stop-color:#0284c7" />
        <stop offset="100%" style="stop-color:#0891b2" />
      </linearGradient>
      
      <linearGradient id="handGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#06b6d4" />
        <stop offset="100%" style="stop-color:#0891b2" />
      </linearGradient>
    </defs>
    
    <!-- Background circle -->
    <circle cx="30" cy="30" r="28" fill="url(#bgGradient)" stroke="url(#iconGradient)" stroke-width="2" opacity="0.3"/>
    
    <!-- Currency exchange symbol -->
    <g transform="translate(12, 15)">
      <!-- Currency symbol 1 -->
      <circle cx="8" cy="8" r="6" fill="none" stroke="url(#iconGradient)" stroke-width="2"/>
      <text x="8" y="12" text-anchor="middle" fill="url(#iconGradient)" font-size="8" font-weight="bold">$</text>
      
      <!-- Currency symbol 2 -->
      <circle cx="28" cy="22" r="6" fill="none" stroke="url(#iconGradient)" stroke-width="2"/>
      <text x="28" y="26" text-anchor="middle" fill="url(#iconGradient)" font-size="8" font-weight="bold">€</text>
      
      <!-- Exchange arrows -->
      <path d="M14 10 L22 10 M20 8 L22 10 L20 12" stroke="url(#iconGradient)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M22 20 L14 20 M16 18 L14 20 L16 22" stroke="url(#iconGradient)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </g>
    
    <!-- Hand gesture icon -->
    <g transform="translate(38, 35)">
      <path d="M2 8 C2 6 3 5 4 5 C5 5 6 6 6 8 L6 12 C6 12 8 10 10 10 C12 10 13 11 13 13 L13 18 C13 20 11 22 9 22 L5 22 C3 22 2 20 2 18 L2 8 Z" 
            fill="url(#handGradient)" 
            stroke="url(#handGradient)" 
            stroke-width="0.5"/>
    </g>
    
    <!-- Decorative dots -->
    <circle cx="15" cy="45" r="1.5" fill="url(#iconGradient)" opacity="0.6"/>
    <circle cx="45" cy="15" r="1" fill="url(#iconGradient)" opacity="0.4"/>
    <circle cx="48" cy="48" r="1.5" fill="url(#iconGradient)" opacity="0.5"/>
  </svg>
</div>

<style>
  .logo-container {
    display: inline-block;
    filter: drop-shadow(0 4px 8px rgba(14, 165, 233, 0.2));
  }
  
  .logo-animated {
    animation: logoFloat 4s ease-in-out infinite;
  }
  
  .logo-svg {
    transition: transform 0.3s ease;
  }
  
  .logo-container:hover .logo-svg {
    transform: scale(1.05);
  }
  
  @keyframes logoFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-5px) rotate(2deg);
    }
  }
</style>