import type { Machine, MachineCategory } from './types'
import { MACHINE_CATEGORY_ORDER } from './machine-categories'
import { smartphone } from './smartphone'
import { dcMotor } from './dc-motor'
import { gpu } from './gpu'

/** Adding a machine means adding a data file and one line here. */
export const MACHINES: Machine[] = [smartphone, gpu, dcMotor]

export function getMachine(id: string): Machine {
  return MACHINES.find((m) => m.id === id) ?? MACHINES[0]
}

export function findMachine(id: string | null): Machine | undefined {
  return id ? MACHINES.find((m) => m.id === id) : undefined
}

/**
 * Every category in display order, each with its machines. Categories with no
 * machines are kept so the catalogue can show what is coming.
 */
export function machinesByCategory(): Array<{ category: MachineCategory; machines: Machine[] }> {
  return MACHINE_CATEGORY_ORDER.map((category) => ({
    category,
    machines: MACHINES.filter((m) => m.category === category),
  }))
}

export type { Machine, Part, MachineCategory } from './types'
