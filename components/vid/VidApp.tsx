'use client'

import VidShell from './VidShell'
import CatalogView from './CatalogView'
import HomeView from './HomeView'
import LocalLibraryView from './LocalLibraryView'
import WatchView from './WatchView'

export type VidView = 'home' | 'watch' | 'results' | 'topic' | 'playlist' | 'library'

export default function VidApp({ initialView }: { initialView: VidView }) {
  const content = initialView === 'home'
    ? <HomeView />
    : initialView === 'library'
      ? <LocalLibraryView />
      : initialView === 'watch'
        ? <WatchView />
        : <CatalogView view={initialView} />

  return (
    <VidShell>
      {content}
    </VidShell>
  )
}
