<script>
  import { onDestroy } from 'svelte'
  import Button from '$components/Button.svelte'
  import LoadingSpinnerIcon from '$icons/animated/LoadingSpinnerIcon.svelte'
  import CollectionIcon from '$icons/outline/CollectionIcon.svelte'
  import RefreshIcon from '$icons/outline/RefreshIcon.svelte'
  import ExclamationCircleIcon from '$icons/outline/ExclamationCircleIcon.svelte'
  import ExternalLinkIcon from '$icons/outline/ExternalLinkIcon.svelte'

  export let video = null, onSplitClicked = null
  let hovered = false

  async function handleOpenStemsClicked() {
    const result = await window.openStemsPath(video.videoId)
    if (result === 'split') {
      onSplitClicked(video, true)
    }
  }

  let status = null, path = null, onClick = null
  $: {
    window.getVideoStatus(video.videoId).then((newStatus) => status = newStatus)
    window.getVideoPath(video.videoId).then((newPath) => path = newPath)
  }
  $: {
    window.setVideoStatusUpdateHandler(video.videoId, 'ProcessQueueCard', (message) => {
      status = message.status
      path = message.path
    })
  }
  $: {
    if (status === 'done') {
      onClick = handleOpenStemsClicked
    } else if (status === 'error') {
      onClick = () => onSplitClicked(video, true)
    } else {
      onClick = undefined
    }
  }
  onDestroy(() => {
    window.setVideoStatusUpdateHandler(video.videoId, 'ProcessQueueCard', null)
  })
</script>

{#if status !== null}
  <button class="overflow-hidden grow-0 shrink-0 max-w-xs flex flex-row px-4 p-2 space-x-4 items-center rounded-md text-left bg-slate-800 drop-shadow-md" disabled={!onClick} on:click={onClick} on:mouseenter={() => hovered = true} on:mouseleave={() => hovered = false}>
    {#if status === 'processing'}
      <div class="grow-0 shrink-0 w-5 h-5 text-slate-100 animate-pulse">
        <LoadingSpinnerIcon />
      </div>
    {:else if status === 'queued'}
      <div class="grow-0 shrink-0 w-6 h-6 text-slate-500">
        <CollectionIcon />
      </div>
    {:else if status === 'error'}
      <div class="grow-0 shrink-0 w-6 h-6 text-slate-500">
        {#if hovered}
          <RefreshIcon />
        {:else}
          <ExclamationCircleIcon />
        {/if}
      </div>
    {:else if status === 'done'}
      <div class="grow-0 shrink-0 w-6 h-6 text-slate-500">
        <ExternalLinkIcon />
      </div>
    {/if}
    <div class="overflow-hidden flex-1 flex flex-col justify-center leading-snug">
      <div class="whitespace-nowrap overflow-hidden text-ellipsis font-semibold">{video.title}</div>
      <div class="whitespace-nowrap overflow-hidden text-ellipsis text-slate-400">
        {#if status === 'processing'}
          Processing
        {:else if status === 'queued'}
          Queued
        {:else if status === 'error'}
          {#if hovered}
            Retry
          {:else}
            Failed
          {/if}
        {:else if status === 'done'}
          Open
        {/if}
      </div>
    </div>
  </button>
{/if}
