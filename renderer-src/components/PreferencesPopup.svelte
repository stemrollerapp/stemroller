<script>
  import { onMount } from 'svelte'
  import Button from '$components/Button.svelte'
  import CogIcon from '$icons/outline/CogIcon.svelte'
  import XIcon from '$icons/outline/XIcon.svelte'
  import FolderOpenIcon from '$icons/solid/FolderOpenIcon.svelte'

  export let onCloseClick = null

  let pyTorchBackend = null
  let outputPath = null
  let outputFormat = null

  async function handleBrowseStems() {
    const newOutputPath = await window.browseOutputPath()
    if (newOutputPath) {
      outputPath = newOutputPath
    }
  }

  onMount(async () => {
    pyTorchBackend = await window.getPyTorchBackend()
    outputPath = await window.getOutputPath()
    outputFormat = await window.getOutputFormat()
  })

  $: {
    if (pyTorchBackend) {
      window.setPyTorchBackend(pyTorchBackend)
    }
    if (outputFormat) {
      window.setOutputFormat(outputFormat)
    }
  }
</script>

<div class="absolute flex flex-col left-2 bottom-12 z-[9999] w-[28rem] px-4 py-3 drop-shadow-lg bg-slate-800 text-slate-300 rounded-md border-solid border border-slate-700">

  <div class="space-x-2 flex flex-row items-center mb-2">
    <div class="w-6 h-6 grow-0 shrink-0">
      <CogIcon />
    </div>

    <div class="font-bold text-xl grow-0 shrink-0">Preferences</div>

    <div class="w-full grow-1 shrink-1"></div>

    <button class="w-6 h-6 grow-0 shrink-0" on:click={onCloseClick}>
      <XIcon />
    </button>
  </div>

  <div class="text-lg font-bold mb-1">Stems output path</div>

  <div class="flex flex-row space-x-2 mb-2">
    <div class="flex-1 w-full min-w-0 border-solid border border-slate-700 bg-slate-900 text-slate-300 px-2 py-2 rounded-md truncate">{outputPath || ''}</div>
    <Button Icon={FolderOpenIcon} text="Browse" onClick={handleBrowseStems} />
  </div>

  <div class="text-lg font-bold mb-1">Stems output format</div>

  <select class="border-solid border border-slate-700 bg-slate-900 text-slate-300 focus:outline-none focus:ring focus:ring-cyan-300 px-2 py-1 mb-2 rounded-md" bind:value={outputFormat}>
    <option value="wav" class="bg-slate-900 text-slate-300 px-2 py-1">WAV</option>
    <option value="mp3" class="bg-slate-900 text-slate-300 px-2 py-1">MP3</option>
  </select>

  <div class="text-lg font-bold mb-1">Backend</div>

  <p class="mb-2 italic">Try &quot;Always use CPU&quot; if splitting fails on your device.</p>

  <select class="border-solid border border-slate-700 bg-slate-900 text-slate-300 focus:outline-none focus:ring focus:ring-cyan-300 px-2 py-1 rounded-md" bind:value={pyTorchBackend}>
    <option value="auto" class="bg-slate-900 text-slate-300 px-2 py-1">Use CUDA (if available)</option>
    <option value="cpu" class="bg-slate-900 text-slate-300 px-2 py-1">Always use CPU</option>
  </select>
</div>
