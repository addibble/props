import { z } from "zod"
import { distance, type Distance } from "lib/common/distance"
import { pcbLayoutProps, type PcbLayoutProps } from "lib/common/layout"
import { expectTypesMatch } from "lib/typecheck"

/**
 * A hole hosts declarative children that describe what the hole is *for* --
 * today an `<enclosure.fdm.heatsetinsert>` or an `<assembly.screw>`, which turn
 * a mounting hole into a fastening point. The hole itself renders none of them; each child is read by
 * whatever owns that concern, exactly as `<enclosure.cutoutaperture>` is read
 * by the enclosure rather than by the connector it is declared in.
 */
interface HoleChildrenProps {
  children?: any
}

export interface CircleHoleProps extends PcbLayoutProps, HoleChildrenProps {
  name?: string
  shape?: "circle"
  diameter?: Distance
  radius?: Distance
  solderMaskMargin?: Distance
  coveredWithSolderMask?: boolean
}

export interface PillHoleProps extends PcbLayoutProps, HoleChildrenProps {
  name?: string
  shape: "pill"
  width: Distance
  height: Distance
  solderMaskMargin?: Distance
  coveredWithSolderMask?: boolean
}

export interface OvalHoleProps extends PcbLayoutProps, HoleChildrenProps {
  name?: string
  shape: "oval"
  width: Distance
  height: Distance
  solderMaskMargin?: Distance
  coveredWithSolderMask?: boolean
}

export interface RectHoleProps extends PcbLayoutProps, HoleChildrenProps {
  name?: string
  shape: "rect"
  width: Distance
  height: Distance
  solderMaskMargin?: Distance
  coveredWithSolderMask?: boolean
}

const holeChildrenProps = {
  children: z.any().optional(),
}

export type HoleProps =
  | CircleHoleProps
  | PillHoleProps
  | OvalHoleProps
  | RectHoleProps

const circleHoleProps = pcbLayoutProps
  .extend({
    name: z.string().optional(),
    shape: z.literal("circle").optional(),
    diameter: distance.optional(),
    radius: distance.optional(),
    solderMaskMargin: distance.optional(),
    coveredWithSolderMask: z.boolean().optional(),
    ...holeChildrenProps,
  })
  .transform((d) => ({
    ...d,
    diameter: d.diameter ?? 2 * d.radius!,
    radius: d.radius ?? d.diameter! / 2,
  }))

const pillHoleProps = pcbLayoutProps.extend({
  name: z.string().optional(),
  shape: z.literal("pill"),
  width: distance,
  height: distance,
  solderMaskMargin: distance.optional(),
  coveredWithSolderMask: z.boolean().optional(),
  ...holeChildrenProps,
})

const ovalHoleProps = pcbLayoutProps.extend({
  name: z.string().optional(),
  shape: z.literal("oval"),
  width: distance,
  height: distance,
  solderMaskMargin: distance.optional(),
  coveredWithSolderMask: z.boolean().optional(),
  ...holeChildrenProps,
})

const rectHoleProps = pcbLayoutProps.extend({
  name: z.string().optional(),
  shape: z.literal("rect"),
  width: distance,
  height: distance,
  solderMaskMargin: distance.optional(),
  coveredWithSolderMask: z.boolean().optional(),
  ...holeChildrenProps,
})

export const holeProps = z.union([
  circleHoleProps,
  pillHoleProps,
  ovalHoleProps,
  rectHoleProps,
])

export type InferredHoleProps = z.input<typeof holeProps>

expectTypesMatch<HoleProps, InferredHoleProps>(true)
