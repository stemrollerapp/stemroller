<script>
  import debounce from 'lodash.debounce'
  import ArrowUpIcon from '$icons/outline/ArrowUpIcon.svelte'
  import SearchIcon from '$icons/outline/SearchIcon.svelte'
  import CursorClickIcon from '$icons/outline/CursorClickIcon.svelte'
  import LoadingSpinnerIcon from '$icons/animated/LoadingSpinnerIcon.svelte'
  import ResultCard from '$components/ResultCard.svelte'

  export let onSplitClicked = null
  export let onFileSelected = null

  let hasQuery = false
  let status = null
  let videos = null

  let dndFileExplorerName = 'File Explorer'
  let dndTipVisible = false

  const debouncedSearch = debounce(async (query) => {
    try {
      const results = await window.youtubeSearch(query)
      if (results.videos.length > 0) {
        videos = results.videos
      }
      status = null
    } catch (err) {
      console.error(err)
      status = { step: 'error' }
      videos = null
    }
  }, 500)

  function handleSearchInput(event) {
    const query = event.target.value.trim()

    if (query.length > 0) {
      status = { step: 'loading' }
      videos = null
      hasQuery = true
      debouncedSearch(query)
    } else {
      status = null
      videos = null
      hasQuery = false
    }
  }

  function handleSelectFile() {
    const input = document.createElement('input')
    input.accept = 'audio/*'
    input.type = 'file'
    input.addEventListener('change', (event) => {
      for (const file of event.target.files) {
        onFileSelected(file.path)
      }
    })
    input.click()
  }

  $: {
    if (
      typeof navigator !== 'undefined' &&
      navigator.platform.toLowerCase().indexOf('mac') !== -1
    ) {
      dndFileExplorerName = 'Finder'
    }
  }
</script>

<div class="grow shrink overflow-hidden flex flex-col bg-slate-900 text-slate-100">
  <div class="relative w-full flex-0 border-solid border-b border-slate-700">
    <input
      class="w-full px-14 py-4 border-none outline-none bg-slate-900 font-bold"
      placeholder="Search"
      on:input={handleSearchInput}
    />
    <div class="absolute top-4 left-4 w-6 h-6 text-slate-500 pointer-events-none">
      <SearchIcon />
    </div>
    {#if status !== null && status.step === 'loading'}
      <div class="absolute top-4 right-4 w-5 h-5 text-slate-100 animate-pulse pointer-events-none">
        <LoadingSpinnerIcon />
      </div>
    {/if}
  </div>

  <div class="grow shrink overflow-x-hidden overflow-y-auto flex flex-col p-6 space-y-6">
    {#if !hasQuery}
      <div class="w-6 h-6 self-center animate-bounce text-slate-500 pointer-events-none">
        <ArrowUpIcon />
      </div>
      <p class="m-4 text-slate-400 text-center">
        Type any song title in the search bar above,<br />or
        <button
          class="text-cyan-500 underline"
          on:click={handleSelectFile}
          on:mouseenter={() => (dndTipVisible = true)}
          on:mouseleave={() => (dndTipVisible = false)}>select a local file</button
        > stored on your device.
      </p>

      <div
        class={`m-auto max-w-md flex flex-row space-x-2 px-4 py-3 drop-shadow-lg bg-slate-800 text-slate-300 rounded-md border-solid border border-slate-700 transition-opacity ${
          dndTipVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div class="grow-0 shrink-0 w-6 h-6">
          <CursorClickIcon />
        </div>
        <p>
          <span class="font-bold">Pro tip</span>: you can also drag local files from {dndFileExplorerName}
          and drop them onto this window to split them.
        </p>
      </div>
    {:else if videos && status === null}
      {#each videos as video}
        <ResultCard {video} {onSplitClicked} />
      {/each}
    {:else if (!videos || videos.length === 0) && status === null}
      <p class="m-4 text-slate-400 text-center">No video results available.</p>
    {:else if status !== null && status.step === 'error'}
      <p class="m-4 text-slate-400 text-center">
        An error occurred. Please make sure you&apos;re connected to the internet and try again.
      </p>
    {/if}
  </div>
</div>
