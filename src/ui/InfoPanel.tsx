import type { Machine } from '../content/types'
import { CATEGORY_META } from '../content/categories'
import { useApp } from '../store'

export function InfoPanel({ machine }: { machine: Machine }) {
  const selectedPartId = useApp((s) => s.selectedPartId)
  const select = useApp((s) => s.select)
  const part = machine.parts.find((p) => p.id === selectedPartId)

  if (!part) {
    return (
      <div className="info-panel info-panel--empty">
        <div className="panel-heading">
          <h2>{machine.name}</h2>
        </div>
        <p className="info-panel__tagline">{machine.tagline}</p>
        <p className="info-panel__body">{machine.description}</p>

        <div className="hint-list">
          <h3>How to use this</h3>
          <ul>
            <li>
              <kbd>Drag</kbd> to orbit, <kbd>scroll</kbd> to zoom
            </li>
            <li>
              Press <strong>Open it up</strong> to separate the layers
            </li>
            <li>Click any component to isolate and read about it</li>
          </ul>
        </div>
      </div>
    )
  }

  const meta = CATEGORY_META[part.category]

  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <span className="chip" style={{ background: `${meta.color}1f`, color: meta.color, borderColor: `${meta.color}55` }}>
          {meta.label}
        </span>
        <button type="button" className="icon-button" onClick={() => select(null)} aria-label="Close component details">
          ✕
        </button>
      </div>

      <h2 className="info-panel__title">{part.name}</h2>
      <p className="info-panel__tagline">{part.tagline}</p>

      {part.body.map((paragraph, i) => (
        <p key={i} className="info-panel__body">
          {paragraph}
        </p>
      ))}

      {part.analogy && (
        <div className="analogy">
          <h3>Think of it as</h3>
          <p>{part.analogy}</p>
        </div>
      )}

      {part.specs && part.specs.length > 0 && (
        <dl className="specs">
          {part.specs.map((spec) => (
            <div key={spec.label} className="specs__row">
              <dt>{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
