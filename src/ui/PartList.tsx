import { useMemo } from 'react'
import type { Machine } from '../content/types'
import { CATEGORY_META } from '../content/categories'
import { useApp } from '../store'

export function PartList({ machine }: { machine: Machine }) {
  const selectedPartId = useApp((s) => s.selectedPartId)
  const hoveredPartId = useApp((s) => s.hoveredPartId)
  const select = useApp((s) => s.select)
  const hover = useApp((s) => s.hover)

  // Teardown order: the sequence a repair tech would actually remove them in.
  const ordered = useMemo(
    () => [...machine.parts].sort((a, b) => a.layer - b.layer || a.name.localeCompare(b.name)),
    [machine],
  )

  return (
    <div className="part-list">
      <div className="panel-heading">
        <h2>Components</h2>
        <span className="panel-heading__count">{machine.parts.length}</span>
      </div>
      <p className="panel-note">In teardown order — outside in.</p>

      <ul>
        {ordered.map((part) => {
          const meta = CATEGORY_META[part.category]
          const isSelected = part.id === selectedPartId
          const isHovered = part.id === hoveredPartId
          return (
            <li key={part.id}>
              <button
                type="button"
                className={`part-row${isSelected ? ' is-selected' : ''}${isHovered ? ' is-hovered' : ''}`}
                style={isSelected ? { borderLeftColor: meta.color } : undefined}
                onClick={() => select(isSelected ? null : part.id)}
                onMouseEnter={() => hover(part.id)}
                onMouseLeave={() => hover(null)}
              >
                <span className="part-row__dot" style={{ background: meta.color }} />
                <span className="part-row__text">
                  <span className="part-row__name">{part.name}</span>
                  <span className="part-row__tagline">{part.tagline}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
