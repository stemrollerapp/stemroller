<script>
  import { onMount } from 'svelte'
  import Button from '$components/Button.svelte'
  import CogIcon from '$icons/outline/CogIcon.svelte'
  import XIcon from '$icons/outline/XIcon.svelte'
  import FolderOpenIcon from '$icons/solid/FolderOpenIcon.svelte'

  export let onCloseClick = null

  let pyTorchBackend = null
  let outputPath = null
  let modelName = null
  let outputFormat = null
  let localFileOutputToContainingDir = null
  let prefixStemFilenameWithSongName = null
  let preserveOriginalAudio = null

  async function handleBrowseStems() {
    const newOutputPath = await window.browseOutputPath()
    if (newOutputPath) {
      outputPath = newOutputPath
    }
  }

  onMount(async () => {
    pyTorchBackend = await window.getPyTorchBackend()
    outputPath = await window.getOutputPath()
    modelName = await window.getModelName()
    outputFormat = await window.getOutputFormat()
    localFileOutputToContainingDir = await window.getLocalFileOutputToContainingDir()
    prefixStemFilenameWithSongName = await window.getPrefixStemFilenameWithSongName()
    preserveOriginalAudio = await window.getPreserveOriginalAudio()
  })

  $: {
    if (pyTorchBackend) {
      window.setPyTorchBackend(pyTorchBackend)
    }
    if (modelName) {
      window.setModelName(modelName)
    }
    if (outputFormat) {
      window.setOutputFormat(outputFormat)
    }
    if (localFileOutputToContainingDir !== null) {
      window.setLocalFileOutputToContainingDir(localFileOutputToContainingDir)
    }
    if (prefixStemFilenameWithSongName !== null) {
      window.setPrefixStemFilenameWithSongName(prefixStemFilenameWithSongName)
    }
    if (preserveOriginalAudio !== null) {
      window.setPreserveOriginalAudio(preserveOriginalAudio)
    }
  }
</script>

<div
  class="absolute flex flex-col left-2 bottom-12 z-[9999] w-[28rem] px-4 py-3 drop-shadow-lg bg-slate-800 text-slate-300 rounded-md border-solid border border-slate-700"
>
  <div class="space-x-2 flex flex-row items-center mb-2">
    <div class="w-6 h-6 grow-0 shrink-0">
      <CogIcon />
    </div>

    <div class="font-bold text-xl grow-0 shrink-0">Preferences</div>

    <div class="w-full grow-1 shrink-1" />

    <button class="w-6 h-6 grow-0 shrink-0" on:click={onCloseClick}>
      <XIcon />
    </button>
  </div>

  <div class="text-lg font-bold mb-1">Stems output path</div>

  <div class="flex flex-row space-x-2 mb-2">
    <div
      class="flex-1 w-full min-w-0 border-solid border border-slate-700 bg-slate-900 text-slate-300 px-2 py-2 rounded-md truncate"
    >
      {outputPath || ''}
    </div>
    <Button Icon={FolderOpenIcon} text="Browse" onClick={handleBrowseStems} />
  </div>

  <div class="space-x-2 flex flex-row items-center justify-start mb-2">
    <input
      id="checkboxLocalFileOutputToContainingDir"
      type="checkbox"
      class="w-4 h-4 grow-0 shrink-0"
      bind:checked={localFileOutputToContainingDir}
    />

    <label for="checkboxLocalFileOutputToContainingDir" class="grow-0 shrink-0"
      >When splitting local files, use input file directory</label
    >
  </div>

  <div class="space-x-2 flex flex-row items-center justify-start mb-2">
    <input
      id="checkboxPrefixStemFilenameWithSongName"
      type="checkbox"
      class="w-4 h-4 grow-0 shrink-0"
      bind:checked={prefixStemFilenameWithSongName}
    />

    <label for="checkboxPrefixStemFilenameWithSongName" class="grow-0 shrink-0"
      >Prefix stem name with song name</label
    >
  </div>

  <div class="space-x-2 flex flex-row items-center justify-start mb-2">
    <input
      id="checkboxPreserveOriginalAudio"
      type="checkbox"
      class="w-4 h-4 grow-0 shrink-0"
      bind:checked={preserveOriginalAudio}
    />

    <label for="checkboxPreserveOriginalAudio" class="grow-0 shrink-0"
      >Preserve original audio</label
    >
  </div>

  <div class="text-lg font-bold mb-1">Stems output format</div>

  <select
    class="border-solid border border-slate-700 bg-slate-900 text-slate-300 focus:outline-none focus:ring focus:ring-cyan-300 px-2 py-1 mb-2 rounded-md"
    bind:value={outputFormat}
  >
    <option value="wav" class="bg-slate-900 text-slate-300 px-2 py-1">WAV</option>
    <option value="flac" class="bg-slate-900 text-slate-300 px-2 py-1">FLAC</option>
    <option value="mp3" class="bg-slate-900 text-slate-300 px-2 py-1">MP3</option>
  </select>

  <div class="text-lg font-bold mb-1">Demucs model</div>

  <select
    class="border-solid border border-slate-700 bg-slate-900 text-slate-300 focus:outline-none focus:ring focus:ring-cyan-300 px-2 py-1 mb-2 rounded-md"
    bind:value={modelName}
  >
    <option value="htdemucs" class="bg-slate-900 text-slate-300 px-2 py-1">4-channel (Fast)</option>
    <option value="htdemucs_ft" class="bg-slate-900 text-slate-300 px-2 py-1"
      >4-channel (Finetuned)</option
    >
    <option value="htdemucs_6s" class="bg-slate-900 text-slate-300 px-2 py-1"
      >6-channel (Experimental)</option
    >
  </select>

  <div class="text-lg font-bold mb-1">Backend</div>

  <p class="mb-2 italic">Try &quot;Always use CPU&quot; if splitting fails on your device.</p>

  <select
    class="border-solid border border-slate-700 bg-slate-900 text-slate-300 focus:outline-none focus:ring focus:ring-cyan-300 px-2 py-1 rounded-md"
    bind:value={pyTorchBackend}
  >
    <option value="auto" class="bg-slate-900 text-slate-300 px-2 py-1"
      >Use GPU (if available)</option
    >
    <option value="cpu" class="bg-slate-900 text-slate-300 px-2 py-1">Always use CPU</option>
  </select>
</div>
