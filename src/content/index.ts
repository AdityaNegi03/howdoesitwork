import type { Machine } from './types'
import { smartphone } from './smartphone'
import { dcMotor } from './dc-motor'

/** Adding a machine means adding a data file and one line here. */
export const MACHINES: Machine[] = [smartphone, dcMotor]

export function getMachine(id: string): Machine {
  return MACHINES.find((m) => m.id === id) ?? MACHINES[0]
}

export type { Machine, Part } from './types'
