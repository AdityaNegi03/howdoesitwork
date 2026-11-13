import { useEffect, useState } from 'react'
import type { Machine } from '../content/types'
import { machinesByCategory } from '../content'
import { MACHINE_CATEGORY_META } from '../content/machine-categories'
import { useApp } from '../store'

/** Jump to another machine without going back through the catalogue. */
export function MachineSwitcher({ machine }: { machine: Machine }) {
  const [open, setOpen] = useState(false)
  const openMachine = useApp((s) => s.openMachine)
  const groups = machinesByCategory().filter((g) => g.machines.length > 0)
  const accent = MACHINE_CATEGORY_META[machine.category].accent

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="switcher">
      <button
        type="button"
        className={`switcher__trigger${open ? ' is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="switcher__dot" style={{ background: accent }} />
        <span className="switcher__name">{machine.name}</span>
        <span className="switcher__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="switcher__backdrop"
            aria-label="Close machine menu"
            onClick={() => setOpen(false)}
          />
          <div className="switcher__menu" role="menu">
            {groups.map(({ category, machines }) => (
              <div key={category} className="switcher__group">
                <span className="switcher__group-label" style={{ color: MACHINE_CATEGORY_META[category].accent }}>
                  {MACHINE_CATEGORY_META[category].label}
                </span>
                {machines.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="menuitem"
                    className={`switcher__item${m.id === machine.id ? ' is-current' : ''}`}
                    onClick={() => {
                      openMachine(m.id)
                      setOpen(false)
                    }}
                  >
                    <span className="switcher__item-name">{m.name}</span>
                    <span className="switcher__item-parts">{m.parts.length}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
