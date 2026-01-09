<script>
  import '../app.css';
  import Navbar from '$lib/components/layout/Navbar.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import MoneyRain from '$lib/components/layout/MoneyRain.svelte';

  export let data;
</script>

<div class="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 relative overflow-hidden flex flex-col font-sans">
  
  <MoneyRain count={25} />

  <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div class="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-sky-200/30 rounded-full blur-3xl opacity-50 animate-blob"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-cyan-200/30 rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
    <div class="absolute top-[40%] left-[60%] w-[25vw] h-[25vw] bg-blue-200/20 rounded-full blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
  </div>

  <Navbar />

  <main class="flex-grow container mx-auto px-4 py-8 relative z-10 w-full max-w-7xl">
    <slot />
  </main>

  <Footer />
</div>

<style>
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 15s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
</style>