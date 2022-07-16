<script>
  export let Icon = null, text = null, disabled = false, onClick = null

  let styles = null
  $: {
    styles = 'whitespace-nowrap flex items-center justify-center px-4 py-2 rounded-md text-slate-900 bg-cyan-500 outline-none focus:outline-none '
    if (disabled) {
      styles += 'cursor-auto opacity-50'
    } else {
      styles += 'drop-shadow-md hover:drop-shadow-lg hover:bg-cyan-600 active:bg-cyan-700 focus:ring focus:ring-cyan-300 transition-all'
    }
  }
</script>

<button class={styles} on:click={onClick || ((event) => event.preventDefault())}>
  <div class="w-5 h-5 mr-2">
    <svelte:component this={Icon} />
  </div>
  <span>{text}</span>
</button>
