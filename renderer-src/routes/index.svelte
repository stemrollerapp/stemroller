<script>
  import { onMount, onDestroy } from 'svelte'
  import SearchAndResults from '$components/SearchAndResults.svelte'
  import ProcessQueue from '$components/ProcessQueue.svelte'
  import BottomBar from '$components/BottomBar.svelte'

  let processQueueItems = []

  async function handleSplitClicked(video, retry) {
    if (retry) {
      await window.deleteVideoStatusAndPath(video.videoId)
    }
    const items = processQueueItems.filter(item => item.videoId !== video.videoId)
    items.push(video)
    processQueueItems = items
  }

  $: {
    if (typeof window !== 'undefined') {
      window.setProcessQueueItems(processQueueItems)
    }
  }
  onMount(() => {
    if (typeof window !== 'undefined') {
      window.setVideoStatusUpdateHandler('__global', 'IndexRoute', (message) => {
        if (message.status === null) {
          processQueueItems = processQueueItems.filter(item => item.videoId !== message.videoId)
        }
      })
    }
  })
  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.setVideoStatusUpdateHandler('__global', 'IndexRoute', null)
    }
  })
</script>

<div class="w-full h-full overflow-hidden flex flex-col">
  <SearchAndResults onSplitClicked={handleSplitClicked} />

  {#if processQueueItems.length > 0}
    <ProcessQueue items={processQueueItems} onSplitClicked={handleSplitClicked} />
  {/if}

  <BottomBar />
</div>
