import { create } from 'zustand'
import { MACHINES } from './content'

export interface AppState {
  machineId: string
  selectedPartId: string | null
  hoveredPartId: string | null
  /** 0 = assembled, 1 = fully exploded. */
  explode: number
  /** Fade everything except the selected part. */
  ghostOthers: boolean
  /** Show the floating label on the active part. */
  showLabels: boolean
  /** Bumped to ask the camera to return to the machine's default framing. */
  resetNonce: number

  setMachine: (id: string) => void
  select: (id: string | null) => void
  hover: (id: string | null) => void
  setExplode: (v: number) => void
  toggleExplode: () => void
  toggleGhost: () => void
  toggleLabels: () => void
  resetView: () => void
}

export const useApp = create<AppState>((set, get) => ({
  machineId: MACHINES[0].id,
  selectedPartId: null,
  hoveredPartId: null,
  explode: 0,
  ghostOthers: true,
  showLabels: true,
  resetNonce: 0,

  setMachine: (id) =>
    set({ machineId: id, selectedPartId: null, hoveredPartId: null, explode: 0, resetNonce: get().resetNonce + 1 }),
  select: (id) => set({ selectedPartId: id }),
  hover: (id) => set({ hoveredPartId: id }),
  setExplode: (v) => set({ explode: Math.min(1, Math.max(0, v)) }),
  toggleExplode: () => set({ explode: get().explode > 0.5 ? 0 : 1 }),
  toggleGhost: () => set({ ghostOthers: !get().ghostOthers }),
  toggleLabels: () => set({ showLabels: !get().showLabels }),
  resetView: () => set({ selectedPartId: null, resetNonce: get().resetNonce + 1 }),
}))
