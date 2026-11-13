import { useApp } from '../store'

export function Toolbar() {
  const explode = useApp((s) => s.explode)
  const setExplode = useApp((s) => s.setExplode)
  const toggleExplode = useApp((s) => s.toggleExplode)
  const ghostOthers = useApp((s) => s.ghostOthers)
  const toggleGhost = useApp((s) => s.toggleGhost)
  const showLabels = useApp((s) => s.showLabels)
  const toggleLabels = useApp((s) => s.toggleLabels)
  const resetView = useApp((s) => s.resetView)

  const isOpen = explode > 0.5

  return (
    <div className="toolbar">
      <button type="button" className={`primary-button${isOpen ? ' is-active' : ''}`} onClick={toggleExplode}>
        {isOpen ? 'Close it up' : 'Open it up'}
      </button>

      <label className="slider">
        <span className="slider__label">Explode</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={explode}
          onChange={(e) => setExplode(Number(e.target.value))}
          aria-label="Explode amount"
        />
        <span className="slider__value">{Math.round(explode * 100)}%</span>
      </label>

      <div className="toolbar__divider" />

      <button
        type="button"
        className={`toggle-button${ghostOthers ? ' is-active' : ''}`}
        onClick={toggleGhost}
        title="Fade everything except the selected component"
      >
        Isolate
      </button>
      <button
        type="button"
        className={`toggle-button${showLabels ? ' is-active' : ''}`}
        onClick={toggleLabels}
        title="Show the floating name label"
      >
        Labels
      </button>
      <button type="button" className="toggle-button" onClick={resetView} title="Return to the default view">
        Reset
      </button>
    </div>
  )
}
