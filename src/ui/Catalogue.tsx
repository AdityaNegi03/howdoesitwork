import { machinesByCategory } from '../content'
import { MACHINE_CATEGORY_META } from '../content/machine-categories'
import { CATEGORY_META } from '../content/categories'
import { useApp } from '../store'

export function Catalogue() {
  const openMachine = useApp((s) => s.openMachine)
  const groups = machinesByCategory()
  const total = groups.reduce((n, g) => n + g.machines.length, 0)

  return (
    <div className="catalogue">
      <header className="catalogue__intro">
        <h1>Take machines apart.</h1>
        <p>
          Pick something, open it up, and pull out every component to find out what it actually does —
          in 3D, not in a diagram.
        </p>
        <span className="catalogue__count">
          {total} machine{total === 1 ? '' : 's'} available
        </span>
      </header>

      {groups.map(({ category, machines }) => {
        const meta = MACHINE_CATEGORY_META[category]
        return (
          <section key={category} className="catalogue__section">
            <div className="catalogue__section-head">
              <span className="catalogue__swatch" style={{ background: meta.accent }} />
              <h2>{meta.label}</h2>
              <span className="catalogue__blurb">{meta.blurb}</span>
            </div>

            {machines.length === 0 ? (
              <div className="catalogue__empty">{meta.placeholder}</div>
            ) : (
              <div className="catalogue__grid">
                {machines.map((machine) => {
                  // A few distinct part categories, as a quick visual fingerprint.
                  const swatches = [...new Set(machine.parts.map((p) => p.category))].slice(0, 6)
                  return (
                    <button
                      key={machine.id}
                      type="button"
                      className="machine-card"
                      onClick={() => openMachine(machine.id)}
                      style={{ ['--accent' as string]: meta.accent }}
                    >
                      <span className="machine-card__name">{machine.name}</span>
                      <span className="machine-card__tagline">{machine.tagline}</span>

                      <span className="machine-card__foot">
                        <span className="machine-card__swatches">
                          {swatches.map((c) => (
                            <span key={c} style={{ background: CATEGORY_META[c].color }} />
                          ))}
                        </span>
                        <span className="machine-card__parts">{machine.parts.length} parts</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
