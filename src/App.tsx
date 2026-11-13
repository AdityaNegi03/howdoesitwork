import { useEffect } from 'react'
import { MACHINES, getMachine } from './content'
import { useApp } from './store'
import { Viewer } from './scene/Viewer'
import { PartList } from './ui/PartList'
import { InfoPanel } from './ui/InfoPanel'
import { Toolbar } from './ui/Toolbar'

export default function App() {
  const machineId = useApp((s) => s.machineId)
  const setMachine = useApp((s) => s.setMachine)
  const select = useApp((s) => s.select)
  const toggleExplode = useApp((s) => s.toggleExplode)
  const machine = getMachine(machineId)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'Escape') select(null)
      if (e.key === 'e' || e.key === 'E') toggleExplode()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [select, toggleExplode])

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark" />
          <span className="brand__name">
            How<span>Does</span>ItWork
          </span>
        </div>

        <nav className="machine-tabs">
          {MACHINES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`machine-tab${m.id === machineId ? ' is-active' : ''}`}
              onClick={() => setMachine(m.id)}
            >
              {m.name}
            </button>
          ))}
        </nav>
      </header>

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
    </div>
  )
}
