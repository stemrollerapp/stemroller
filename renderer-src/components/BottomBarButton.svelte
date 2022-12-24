<script>
  export let Icon = null, text = null, disabled = false, highlighted = false, flashing = false, onClick = null

  let styles = null
  $: {
    styles = 'whitespace-nowrap flex items-center justify-center px-2 py-1 outline-none focus:outline-none '

    if (highlighted) {
      styles += 'bg-slate-600 '
    } else if (flashing) {
      styles += 'bottom-bar-button-flash '
    } else {
      styles += 'text-slate-300 bg-slate-900 '
    }

    if (disabled) {
      styles += 'cursor-auto opacity-50'
    } else if (!flashing) {
      styles += 'hover:bg-slate-700 active:bg-slate-600 transition-all'
    }
  }
</script>

<button class={styles} on:click={onClick || ((event) => event.preventDefault())}>
  <div class="w-5 h-5 mr-2">
    <svelte:component this={Icon} />
  </div>
  <span>{text}</span>
</button>
