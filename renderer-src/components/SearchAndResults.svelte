<script>
  import debounce from 'lodash.debounce'
  import ArrowUpIcon from '$icons/outline/ArrowUpIcon.svelte'
  import SearchIcon from '$icons/outline/SearchIcon.svelte'
  import LoadingSpinnerIcon from '$icons/animated/LoadingSpinnerIcon.svelte'
  import ResultCard from '$components/ResultCard.svelte'

  export let onSplitClicked = null
  export let onFileSelect = null

  let hasQuery = false
  let status = null
  let videos = null

  const debouncedSearch = debounce(async (query) => {
    try {
      const results = await window.youtubeSearch(query)
      if (results.videos.length > 0) {
        videos = results.videos
        status = null
      } else {
        throw new Error('No video results available')
      }
    } catch (err) {
      console.error(err)
      status = 'error'
      videos = null
    }
  }, 500)

  function handleFileSelectClick() {
    document.getElementById("file-select").click();
  }

  function onFileChange(event) {
    const { files } = event.target;
    const { path } = files[0];

    if (!path) {
      return;
    }
  
    onFileSelect({
      videoId: path,
      title: path,
      isLocalFile: true,
    })
  }

  function handleSearchInput(event) {
    const query = event.target.value.trim()

    if (query.length > 0) {
      status = 'loading'
      videos = null
      hasQuery = true
      debouncedSearch(query)
    } else {
      status = null
      videos = null
      hasQuery = false
    }
  }
</script>

<div class="grow shrink overflow-hidden flex flex-col bg-slate-900 text-slate-100">
  <div class="relative w-full flex-0 border-solid border-b border-slate-700">
    <input class="w-full px-14 py-4 border-none outline-none bg-slate-900 font-bold" placeholder="Search" on:input={handleSearchInput}>
    <div class="absolute top-4 left-4 w-6 h-6 text-slate-500 pointer-events-none">
      <SearchIcon />
    </div>
    {#if status === 'loading'}
      <div class="absolute top-4 right-4 w-5 h-5 text-slate-100 animate-pulse pointer-events-none">
        <LoadingSpinnerIcon />
      </div>
    {/if}
  </div>

  <div class="grow shrink overflow-x-hidden overflow-y-auto flex flex-col p-6 space-y-6">
    {#if videos && status === null}
      {#each videos as video}
        <ResultCard {video} {onSplitClicked} />
      {/each}
    {:else if status === 'error'}
      <p class="m-4 text-slate-400 text-center">An error occurred. Please make sure you&apos;re connected to the internet and try again.</p>
    {:else if !hasQuery}
      <div class="w-6 h-6 self-center animate-bounce text-slate-500 pointer-events-none">
        <ArrowUpIcon />
      </div>
      <p class="m-4 text-slate-400 text-center">Type a song title in the search bar above or <span on:click={handleFileSelectClick} class="border-solid underline cursor-pointer hover:opacity-75">select a local file</span>.</p>
      <input class="hidden" accept=".mp3,.wav" type="file" on:change={onFileChange} id="file-select">
    {/if}
  </div>
</div>
