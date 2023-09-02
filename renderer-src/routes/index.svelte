<script>
  import { onMount, onDestroy } from 'svelte'
  import SearchAndResults from '$components/SearchAndResults.svelte'
  import FileDropCatcher from '$components/FileDropCatcher.svelte'
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

  async function handleCancelClicked(video) {
    processQueueItems = processQueueItems.filter(item => item.videoId !== video.videoId)
    const status = await window.getVideoStatus(video.videoId)
    if (status.step !== 'done') {
      await window.deleteVideoStatusAndPath(video.videoId)
    }
  }

  function filePathToTitle(path) {
    const pathParts = path.split(/\/|\\/g).filter((s) => !!s)
    if (pathParts.length === 0) {
      return null
    }

    const fileNamePart = pathParts[pathParts.length - 1]

    const dotParts = fileNamePart.split('.').filter((s) => !!s)
    if (dotParts.length > 1) {
      dotParts.pop()
      return dotParts.join('.')
    } else {
      return fileNamePart
    }
  }

  async function handleFileSelected(path) {
    try {
      await handleSplitClicked({
        mediaSource: 'local',
        videoId: await window.computeLocalFileHash(path),
        localInputPath: path,
        title: filePathToTitle(path),
      })
    } catch (err) {
      window.alert('Unable to process this file. Please ensure that you dropped an audio file, not a folder or other item.')
    }
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
  <SearchAndResults onSplitClicked={handleSplitClicked} onFileSelected={handleFileSelected} />

  {#if processQueueItems.length > 0}
    <ProcessQueue items={processQueueItems} onSplitClicked={handleSplitClicked} onCancelClicked={handleCancelClicked} />
  {/if}

  <BottomBar />
</div>

<FileDropCatcher onFileDropped={handleFileSelected} />
