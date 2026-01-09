<script>
  import { onMount } from 'svelte';

  // Number of money symbols to display
  export let count = 20;
  
  // Symbols to use (different currency symbols)
  const symbols = ['$', '€', '£', '¥', 'Rp', '₹', '₽', '₩'];
  
  let moneyItems = [];

  onMount(() => {
    // Generate random money items
    moneyItems = Array.from({ length: count }).map((_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      // Random position (left 0-100%)
      left: Math.random() * 100,
      // Random animation duration (3s - 8s)
      duration: 3 + Math.random() * 5,
      // Random delay (0s - 5s)
      delay: Math.random() * 5,
      // Random size (1rem - 3rem)
      size: 1 + Math.random() * 2,
      // Random rotation
      rotation: Math.random() * 360,
      // Random opacity for depth effect
      opacity: 0.1 + Math.random() * 0.3
    }));
  });
</script>

<div class="money-rain-container">
  {#each moneyItems as item (item.id)}
    <div 
      class="money-item"
      style="
        left: {item.left}%;
        animation-duration: {item.duration}s;
        animation-delay: {item.delay}s;
        font-size: {item.size}rem;
        opacity: {item.opacity};
        transform: rotate({item.rotation}deg);
      "
    >
      {item.symbol}
    </div>
  {/each}
</div>

<style>
  .money-rain-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: -1;
  }

  .money-item {
    position: absolute;
    top: -50px; /* Start above the screen */
    color: #7dd3fc; /* Tailwind sky-300 (Baby Blue) */
    text-shadow: 0 0 5px rgba(125, 211, 252, 0.5); /* Soft glow */
    font-weight: bold;
    user-select: none;
    animation-name: fall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  @keyframes fall {
    0% {
      transform: translateY(-50px) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 0.6;
    }
    90% {
      opacity: 0.6;
    }
    100% {
      transform: translateY(110vh) rotate(360deg); /* Fall below screen */
      opacity: 0;
    }
  }
</style>
