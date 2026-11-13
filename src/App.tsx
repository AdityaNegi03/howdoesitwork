import { useEffect } from 'react'
import { getMachine } from './content'
import { MACHINE_CATEGORY_META } from './content/machine-categories'
import { useApp } from './store'
import { Viewer } from './scene/Viewer'
import { PartList } from './ui/PartList'
import { InfoPanel } from './ui/InfoPanel'
import { Toolbar } from './ui/Toolbar'
import { Catalogue } from './ui/Catalogue'
import { MachineSwitcher } from './ui/MachineSwitcher'

export default function App() {
  const view = useApp((s) => s.view)
  const machineId = useApp((s) => s.machineId)
  const showCatalogue = useApp((s) => s.showCatalogue)
  const select = useApp((s) => s.select)
  const toggleExplode = useApp((s) => s.toggleExplode)
  const machine = getMachine(machineId)
  const inViewer = view === 'viewer'

  useEffect(() => {
    if (!inViewer) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'Escape') select(null)
      if (e.key === 'e' || e.key === 'E') toggleExplode()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inViewer, select, toggleExplode])

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="brand" onClick={showCatalogue} title="Back to all machines">
          <span className="brand__mark" />
          <span className="brand__name">
            How<span>Does</span>ItWork
          </span>
        </button>

        {inViewer && (
          <>
            <button type="button" className="back-button" onClick={showCatalogue}>
              ← All machines
            </button>
            <span className="topbar__crumb" style={{ color: MACHINE_CATEGORY_META[machine.category].accent }}>
              {MACHINE_CATEGORY_META[machine.category].label}
            </span>
            <MachineSwitcher machine={machine} />
          </>
        )}
      </header>

      {inViewer ? (
        <main className="layout">
          <aside className="panel panel--left">
            <PartList machine={machine} />
          </aside>

          <section className="stage">
            <Viewer machine={machine} />
            <Toolbar />
          </section>

          <aside className="panel panel--right">
            <InfoPanel machine={machine} />
          </aside>
        </main>
      ) : (
        <main className="catalogue-scroll">
          <Catalogue />
        </main>
      )}
    </div>
  )
}
