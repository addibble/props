import { distance, type Distance } from "lib/common/distance"
import { expectTypesMatch } from "lib/typecheck"
import { z } from "zod"

export const cutoutApertureShapes = [
  "rect",
  "rounded_rect",
  "circle",
  "d_shape",
] as const

export type CutoutApertureShape = (typeof cutoutApertureShapes)[number]

export interface CutoutApertureProps {
  shape: CutoutApertureShape
  widthMm?: Distance
  heightMm?: Distance
  diameterMm?: Distance
  cornerRadiusMm?: Distance
  flatOffsetMm?: Distance
  zCenterAboveBoardMm?: Distance
  marginMm?: Distance
}

export const cutoutApertureProps = z.object({
  shape: z.enum(cutoutApertureShapes),
  widthMm: distance.optional(),
  heightMm: distance.optional(),
  diameterMm: distance.optional(),
  cornerRadiusMm: distance.optional(),
  flatOffsetMm: distance.optional(),
  zCenterAboveBoardMm: distance.optional(),
  marginMm: distance.optional(),
})

type InferredCutoutApertureProps = z.input<typeof cutoutApertureProps>
export type ParsedCutoutApertureProps = z.output<typeof cutoutApertureProps>

expectTypesMatch<CutoutApertureProps, InferredCutoutApertureProps>(true)
