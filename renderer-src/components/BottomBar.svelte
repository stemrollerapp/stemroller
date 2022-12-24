<script>
  import { onMount, onDestroy } from 'svelte'

  import BottomBarButton from '$components/BottomBarButton.svelte'
  import DonatePopup from '$components/DonatePopup.svelte'
  import PreferencesPopup from '$components/PreferencesPopup.svelte'

  import CogIcon from '$icons/solid/CogIcon.svelte'
  import HeartIcon from '$icons/solid/HeartIcon.svelte'
  import CodeIcon from '$icons/solid/CodeIcon.svelte'
  import ChatAlt2Icon from '$icons/solid/ChatAlt2Icon.svelte'

  let showDonatePopup = false
  let showPreferencesPopup = false

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.setDonateUpdateHandler((message) => {
        showDonatePopup = message.showDonatePopup
      })
    }
  })
  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.setDonateUpdateHandler(null)
    }
  })
</script>

<div class="relative grow-0 shrink-0 overflow-hidden flex flex-row bg-slate-900 text-slate-100 border-solid border-t border-slate-700">
  <BottomBarButton Icon={CogIcon} text="Preferences" highlighted={showPreferencesPopup} onClick={() => (showPreferencesPopup = true)} />

  <div class="w-full grow-1 shrink-1 border-solid border-l border-r border-slate-700"></div>

  <BottomBarButton Icon={CodeIcon} text="Open Source" onClick={() => window.openSource()} />
  <BottomBarButton Icon={ChatAlt2Icon} text="Support" onClick={() => window.openChat()} />
  <BottomBarButton Icon={HeartIcon} text="Donate" flashing={showDonatePopup} onClick={() => window.openDonate()} />
</div>

{#if showPreferencesPopup}
  <PreferencesPopup onCloseClick={() => (showPreferencesPopup = false)} />
{:else if showDonatePopup}
  <DonatePopup onDonateClick={() => window.openDonate()} onCloseClick={() => window.disableDonatePopup()} />
{/if}
