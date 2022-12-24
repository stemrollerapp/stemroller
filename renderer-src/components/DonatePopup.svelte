<script>
  import SparklesIcon from '$icons/outline/SparklesIcon.svelte'
  import XIcon from '$icons/outline/XIcon.svelte'

  export let onDonateClick = null, onCloseClick = null
</script>

<div class="absolute flex flex-col space-y-2 right-2 bottom-12 z-[9999] max-w-md px-4 py-3 drop-shadow-lg bg-slate-800 text-slate-300 rounded-md border-solid border border-slate-700">

  <div class="space-x-2 flex flex-row items-center">
    <div class="w-6 h-6 grow-0 shrink-0">
      <SparklesIcon />
    </div>

    <div class="font-bold text-xl grow-0 shrink-0">Congratulations!</div>

    <div class="w-full grow-1 shrink-1"></div>

    <button class="w-6 h-6 grow-0 shrink-0" on:click={onCloseClick}>
      <XIcon />
    </button>
  </div>

  <p>Looks like you&apos;ve been using StemRoller a lot lately! If you find my app useful, please consider <button class="text-cyan-500 underline" on:click={onDonateClick}>buying me a coffee</button>. Your support motivates me to continue building great products!</p>

  <p class="text-slate-400 italic">...and even if you choose not to donate, I still want to thank you for using my app! StemRoller will always be free for anyone to enjoy - no strings attached. Sharing StemRoller via social media or word-of-mouth is always appreciated.</p>
</div>
