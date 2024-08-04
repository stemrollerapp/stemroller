<script>
  import { onDestroy } from 'svelte'
  import Button from '$components/Button.svelte'
  import LoadingSpinnerIcon from '$icons/animated/LoadingSpinnerIcon.svelte'
  import CollectionIcon from '$icons/outline/CollectionIcon.svelte'
  import RefreshIcon from '$icons/outline/RefreshIcon.svelte'
  import ExclamationCircleIcon from '$icons/outline/ExclamationCircleIcon.svelte'
  import ExternalLinkIcon from '$icons/outline/ExternalLinkIcon.svelte'
  import XCircleIcon from '$icons/solid/XCircleIcon.svelte'

  export let video = null,
    onSplitClicked = null,
    onCancelClicked = null
  let hovered = false,
    cancelHovered = false

  function handleCancelClicked(event) {
    event.stopPropagation()
    onCancelClicked(video)
  }

  async function handleOpenStemsClicked() {
    const result = await window.openStemsPath(video)
    if (result === 'split') {
      onSplitClicked(video, true)
    }
  }

  let status = null,
    path = null,
    onClick = null
  $: {
    window.getVideoStatus(video.videoId).then((newStatus) => (status = newStatus))
    window.getVideoPath(video.videoId).then((newPath) => (path = newPath))
  }
  $: {
    window.setVideoStatusUpdateHandler(video.videoId, 'ProcessQueueCard', (message) => {
      status = message.status
      path = message.path
    })
  }
  $: {
    if (status !== null) {
      if (status.step === 'done') {
        onClick = handleOpenStemsClicked
      } else if (status.step === 'error') {
        onClick = () => onSplitClicked(video, true)
      }
    } else {
      onClick = undefined
    }
  }

  onDestroy(() => {
    window.setVideoStatusUpdateHandler(video.videoId, 'ProcessQueueCard', null)
  })
</script>

{#if status !== null}
  <button
    class="overflow-hidden grow-0 shrink-0 w-60 flex flex-row px-4 p-2 space-x-4 items-center rounded-md text-left bg-slate-800 drop-shadow-md"
    disabled={!onClick}
    on:click={onClick}
    on:mouseenter={() => (hovered = true)}
    on:mouseleave={() => (hovered = false)}
  >
    {#if status.step === 'processing' || status.step === 'downloading'}
      <div class="grow-0 shrink-0 w-5 h-5 text-slate-100 animate-pulse">
        <LoadingSpinnerIcon />
      </div>
    {:else if status.step === 'queued'}
      <div class="grow-0 shrink-0 w-6 h-6 text-slate-500">
        <CollectionIcon />
      </div>
    {:else if status.step === 'error'}
      <div class="grow-0 shrink-0 w-6 h-6 text-slate-500">
        {#if hovered}
          <RefreshIcon />
        {:else}
          <ExclamationCircleIcon />
        {/if}
      </div>
    {:else if status.step === 'done'}
      <div class="grow-0 shrink-0 w-6 h-6 text-slate-500">
        <ExternalLinkIcon />
      </div>
    {/if}
    <div class="overflow-hidden flex-1 flex flex-col justify-center leading-snug">
      <div class="whitespace-nowrap overflow-hidden text-ellipsis font-semibold">{video.title}</div>
      <div class="whitespace-nowrap overflow-hidden text-ellipsis text-slate-400">
        {#if cancelHovered}
          {#if status.step === 'processing' || status.step === 'downloading'}
            Cancel
          {:else}
            Remove
          {/if}
        {:else if status.step === 'processing'}
          Processing ({Math.floor(status.progress * 100)}%)
        {:else if status.step === 'downloading'}
          Downloading
        {:else if status.step === 'queued'}
          Queued
        {:else if status.step === 'error'}
          {#if hovered}
            Retry
          {:else}
            Failed
          {/if}
        {:else if status.step === 'done'}
          Open
        {/if}
      </div>
    </div>
    <button
      class="grow-0 shrink-0 w-5 h-5 text-slate-500 hover:text-slate-400 transition:color"
      on:click={handleCancelClicked}
      on:mouseenter={() => (cancelHovered = true)}
      on:mouseleave={() => (cancelHovered = false)}
    >
      <XCircleIcon />
    </button>
  </button>
{/if}
