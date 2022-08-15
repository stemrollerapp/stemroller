<script>
  import ProcessQueueCard from '$components/ProcessQueueCard.svelte'

  export let items = null, onSplitClicked = null, onCancelClicked = null
</script>

<div class="grow-0 shrink-0 overflow-x-auto overflow-y-hidden flex flex-row p-2 space-x-2 bg-slate-900 text-slate-100 border-solid border-t border-slate-700">
  {#each items as video}
    <ProcessQueueCard {video} {onSplitClicked} {onCancelClicked} />
  {/each}
</div>
