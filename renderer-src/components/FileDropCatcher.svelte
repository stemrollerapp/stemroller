<script>
  export let onFileDropped = null

  let opaque = false

  function handleDragOver(event) {
    event.preventDefault()
    event.stopPropagation()
    opaque = true
  }

  function handleDragLeaveEnd(event) {
    event.preventDefault()
    event.stopPropagation()
    opaque = false
  }

  function handleDrop(event) {
    event.preventDefault()
    event.stopPropagation()
    opaque = false

    for (const file of event.dataTransfer.files) {
      onFileDropped(file.path)
    }
  }
</script>

<svelte:window on:dragover={handleDragOver} on:dragleave={handleDragLeaveEnd} on:dragend={handleDragLeaveEnd} on:drop={handleDrop} />

<div class={`pointer-events-none fixed top-0 left-0 w-full h-full flex items-center justify-center z-[999999] bg-cyan-500 text-white transition-opacity ${opaque ? 'opacity-100' : 'opacity-0'}`}>
  <p class="text-4xl">Drop files here</p>
</div>
