import type { Machine } from '../content/types'
import { useApp } from '../store'
import { PartObject } from './PartObject'

export function MachineModel({ machine }: { machine: Machine }) {
  const selectedPartId = useApp((s) => s.selectedPartId)
  const hoveredPartId = useApp((s) => s.hoveredPartId)
  const explode = useApp((s) => s.explode)
  const ghostOthers = useApp((s) => s.ghostOthers)
  const showLabels = useApp((s) => s.showLabels)
  const select = useApp((s) => s.select)
  const hover = useApp((s) => s.hover)

  // Hover wins over selection for the floating label, so pointing at a part
  // always tells you what it is.
  const labelledId = hoveredPartId ?? selectedPartId

  return (
    <group>
      {machine.parts.map((part) => (
        <PartObject
          key={part.id}
          part={part}
          explode={explode}
          selected={part.id === selectedPartId}
          hovered={part.id === hoveredPartId}
          dimmed={ghostOthers && selectedPartId !== null && part.id !== selectedPartId}
          labelled={showLabels && part.id === labelledId}
          onSelect={select}
          onHover={hover}
        />
      ))}
    </group>
  )
}
