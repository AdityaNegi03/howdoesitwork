import type { MachineCategory } from './types'

interface MachineCategoryMeta {
  label: string
  blurb: string
  accent: string
  /** Shown in a category that has no machines yet. */
  placeholder: string
}

/** Display order in the catalogue. */
export const MACHINE_CATEGORY_ORDER: MachineCategory[] = [
  'electronics',
  'computer-accessories',
  'machines',
  'software',
]

export const MACHINE_CATEGORY_META: Record<MachineCategory, MachineCategoryMeta> = {
  electronics: {
    label: 'Electronics',
    blurb: 'Consumer devices — the things you carry, wear and plug in.',
    accent: '#60a5fa',
    placeholder: 'Phones, TVs, cameras and headphones will live here.',
  },
  'computer-accessories': {
    label: 'Computer Accessories',
    blurb: 'The parts inside and around a computer.',
    accent: '#a855f7',
    placeholder: 'Graphics cards, drives, keyboards and monitors will live here.',
  },
  machines: {
    label: 'Machines',
    blurb: 'Mechanical systems — things that move, pump, spin and drive.',
    accent: '#4ade80',
    placeholder: 'Motors, engines, pumps and gearboxes will live here.',
  },
  software: {
    label: 'Software',
    blurb: 'Systems with no moving parts, taken apart the same way.',
    accent: '#fbbf24',
    placeholder:
      'Nothing here yet. Software stacks explode into layers too — a browser, a compiler, a database.',
  },
}
