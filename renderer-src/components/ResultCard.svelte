<script>
  import { onDestroy } from 'svelte'
  import Button from '$components/Button.svelte'
  import AdjustmentsIcon from '$icons/solid/AdjustmentsIcon.svelte'
  import CollectionIcon from '$icons/solid/CollectionIcon.svelte'
  import RefreshIcon from '$icons/solid/RefreshIcon.svelte'
  import ExternalLinkIcon from '$icons/solid/ExternalLinkIcon.svelte'
  import LoadingSpinnerIcon from '$icons/animated/LoadingSpinnerIcon.svelte'

  export let video = null,
    onSplitClicked = null

  async function handleOpenStemsClicked() {
    const result = await window.openStemsPath(video)
    if (result === 'split') {
      onSplitClicked(video, true)
    }
  }

  let status = null,
    path = null
  $: {
    window.getVideoStatus(video.videoId).then((newStatus) => (status = newStatus))
    window.getVideoPath(video.videoId).then((newPath) => (path = newPath))
  }
  $: {
    window.setVideoStatusUpdateHandler(video.videoId, 'ResultCard', (message) => {
      status = message.status
      path = message.path
    })
  }

  onDestroy(() => {
    window.setVideoStatusUpdateHandler(video.videoId, 'ResultCard', null)
  })
</script>

<div
  class="overflow-hidden grow-0 shrink-0 flex flex-col p-4 space-y-2 rounded-md bg-slate-800 drop-shadow-lg"
>
  <div class="flex space-x-4 items-center">
    <div class="relative grow-0 shrink-0 rounded-md">
      <img class="h-16" src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} alt="" />
      <div class="absolute bottom-0 right-0 px-2 bg-black/75">{video.timestamp}</div>
    </div>
    <div class="overflow-hidden flex-1 flex flex-col justify-center leading-snug">
      <div class="whitespace-nowrap overflow-hidden text-ellipsis font-semibold">{video.title}</div>
      <div class="whitespace-nowrap overflow-hidden text-ellipsis text-slate-400">
        {video.author.name}
      </div>
    </div>
    {#if status !== null && status.step === 'processing'}
      <Button
        Icon={LoadingSpinnerIcon}
        text="Processing ({Math.floor(status.progress * 100)}%)"
        disabled={true}
      />
    {:else if status !== null && status.step === 'downloading'}
      <Button Icon={LoadingSpinnerIcon} text="Downloading" disabled={true} />
    {:else if status !== null && status.step === 'queued'}
      <Button Icon={CollectionIcon} text="Queued" disabled={true} />
    {:else if status !== null && status.step === 'error'}
      <Button Icon={RefreshIcon} text="Retry" onClick={() => onSplitClicked(video, true)} />
    {:else if status !== null && status.step === 'done'}
      <Button Icon={ExternalLinkIcon} text="Open" onClick={handleOpenStemsClicked} />
    {:else}
      <Button
        Icon={AdjustmentsIcon}
        text="Split"
        onClick={() => onSplitClicked({ mediaSource: 'youtube', ...video }, false)}
      />
    {/if}
  </div>
</div>
