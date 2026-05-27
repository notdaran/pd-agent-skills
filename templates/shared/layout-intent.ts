import type React from 'react'
import type { AssetSpec, BrandTokens } from '../../types'

// LayoutIntent = intermediate contract giua template va renderer.
// Playwright renderer ignore va render React thang.
// Figma renderer doc intent de map sang Plugin API node tree.

export type RegionType =
  | 'text'
  | 'image'
  | 'rect'
  | 'glow'
  | 'decor-bg'
  | 'pill'
  | 'screenshot-frame'

export interface RegionBounds {
  x: number
  y: number
  w: number
  h: number
}

export interface RegionStyle {
  fontSize?: number
  fontWeight?: 200 | 400 | 500 | 700
  color?: string
  fill?: string
  radius?: number
  rotation?: number
  align?: 'left' | 'center' | 'right'
  blur?: number
  dotColor?: string
  framePadding?: number
}

// Anchor edge for overlay regions. Phase 3 (Recipe A) uses this to position
// overlay chips relative to a screenshot-frame region. Phase 1 reserves the
// schema; renderer ignores anchor (treats bounds as absolute) until Phase 3
// adds anchor resolution logic in figma-renderer.tsx.
export type AnchorEdge = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

export interface RegionAnchor {
  ref: string
  edge: AnchorEdge
  offset: [number, number]
}

export interface Region {
  id: string
  type: RegionType
  bounds: RegionBounds
  content?: string
  style?: RegionStyle
  z?: number
  anchor?: RegionAnchor
}

export interface LayoutIntent {
  background: {
    type: 'solid' | 'gradient'
    value: string
  }
  regions: Region[]
}

export interface TemplateProps {
  spec: AssetSpec
  brand: BrandTokens
}

export interface TemplateModule {
  id: string
  label: string
  variations: string[]
  Component: React.FC<TemplateProps>
  buildIntent: (spec: AssetSpec, brand: BrandTokens) => LayoutIntent
}
