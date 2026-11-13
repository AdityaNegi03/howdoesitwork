import type { PartCategory } from './types'

export const CATEGORY_META: Record<PartCategory, { label: string; color: string }> = {
  structure: { label: 'Structure', color: '#8c93a3' },
  power: { label: 'Power', color: '#4ade80' },
  compute: { label: 'Compute', color: '#60a5fa' },
  display: { label: 'Display', color: '#c084fc' },
  imaging: { label: 'Imaging', color: '#f0abfc' },
  audio: { label: 'Audio', color: '#fbbf24' },
  haptics: { label: 'Haptics', color: '#fb923c' },
  connectivity: { label: 'Connectivity', color: '#22d3ee' },
  thermal: { label: 'Thermal', color: '#f87171' },
  mechanical: { label: 'Mechanical', color: '#a3e635' },
  magnetic: { label: 'Magnetic', color: '#f472b6' },
  electrical: { label: 'Electrical', color: '#facc15' },
}
