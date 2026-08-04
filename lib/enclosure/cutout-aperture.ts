import {
  circleShapeProps,
  type CircleShapeProps,
  type CommonShapeProps,
  pillShapeProps,
  type PillShapeProps,
  rectShapeProps,
  type RectShapeProps,
} from "lib/common/commonShape"
import { distance, type Distance } from "lib/common/distance"
import { expectTypesMatch } from "lib/typecheck"
import { z } from "zod"

export const enclosureCutoutApertureShapes = ["pill", "rect", "circle"] as const

export type EnclosureCutoutApertureShape = CommonShapeProps["shape"]

/**
 * Describes the nominal enclosure opening required by a component.
 *
 * Numeric values are interpreted as mm.
 *
 * ## Frame of reference
 *
 * An aperture's `width`/`height`/`depth` are measured in the frame of the face
 * it pierces, never in board or enclosure axes. They are the same words the
 * enclosure itself uses for its own X/Y/Z spans, but they belong to different
 * objects and the face fixes which axes they mean:
 *
 * | Face | `width` | `height` | `depth` |
 * | --- | --- | --- | --- |
 * | `x_pos`, `x_neg` | Y | **Z** | X |
 * | `y_pos`, `y_neg` | X | **Z** | Y |
 * | `z_pos`, `z_neg` | part-local | part-local | Z |
 *
 * So on any side face `height` is the vertical (board Z) dimension and `width`
 * runs along the wall. On a horizontal face the pair follows the part's own
 * rotation rather than being pinned to board X and Y, so an opening stays
 * aligned with the part it serves.
 */
export interface CutoutApertureProps {
  /** Additional clearance around the nominal opening. */
  margin?: Distance
  /**
   * Move the opening's **center** across the face it pierces, along the same two
   * axes its `width` and `height` are measured in. Both may be negative.
   *
   * Sharing a frame with the dimensions is the point. These replace
   * `zExtentAboveBoard`, which only made sense on the four walls: on the lid and
   * the floor an opening does not move in Z at all, so a "Z extent" had no
   * meaning there.
   *
   * Zero means "wherever the part puts it", which is usually right. On a side
   * face the opening is centred on the part's body above the board, taken from
   * the model's measured bounds, so it lines up with the connector without
   * anyone computing a height. On the lid or the floor it is centred on the
   * part's own position, and both offsets turn with the part.
   *
   * `heightDimensionOffset` runs **outward** from the mounting surface on a side
   * face -- up for a top-mounted part, down for a bottom-mounted one -- so, like
   * the default it shifts, it describes the part rather than where the part was
   * placed. A negative value pulls the opening back toward and past the board,
   * which is what a cable jacket fatter than its connector needs; the binding
   * constraint is that the opening must not cut into the floor.
   */
  widthDimensionOffset?: Distance
  /** See `widthDimensionOffset`. */
  heightDimensionOffset?: Distance
  /**
   * Opening size along the normal of the face -- how far the cut is projected
   * inboard, so nothing behind the face (the lid lip today, mounting bosses
   * later) is left obstructing the part.
   *
   * Note this is the *third* aperture dimension, not a board-Z measurement: on a
   * side face it runs horizontally, along X or Y. The vertical dimension of a
   * side aperture is `height`.
   *
   * What it cuts is the material along that normal, which is generally not the
   * face it entered: a large `z_pos` opening in a corner is sized across the face
   * by `width`/`height`, and its depth relieves the side walls it
   * overlaps. It is cut as authored and never capped, so a depth greater than
   * the space behind the face reaches the shell on the far side and cuts that
   * too. Beware on a horizontal face, where that shell is the floor only a few
   * centimetres below: a tall pushbutton will bore straight through it.
   *
   * Usually unnecessary: the depth is otherwise derived from the part itself, by
   * rotating the `cadModel` body's x/y extent onto the face normal and taking
   * the PCB footprint as a floor. On a horizontal face the part's reach above
   * the board is used instead, measured from `cadModel.modelBounds` about the
   * point that sits on the board surface. Where those bounds were never
   * measured it falls back to `cadModel.size.z`, which over-reports because it
   * spans the pins and any through-board shell -- and since depth is not capped,
   * that surplus can drive a lid cut through the floor. Measure the model, or
   * set this explicitly.
   *
   * Set it to override that derivation where it is wrong for the purpose -- a
   * body that tapers, or an extent that includes something not really in the way
   * -- or to give a depth to a part that has no `cadModel`, which would
   * otherwise be sized from its footprint alone.
   */
  depth?: Distance
}

export interface PillEnclosureCutoutApertureProps
  extends PillShapeProps,
    CutoutApertureProps {}

export interface RectEnclosureCutoutApertureProps
  extends RectShapeProps,
    CutoutApertureProps {}

export interface CircleEnclosureCutoutApertureProps
  extends CircleShapeProps,
    CutoutApertureProps {}

export type EnclosureCutoutApertureProps =
  | PillEnclosureCutoutApertureProps
  | RectEnclosureCutoutApertureProps
  | CircleEnclosureCutoutApertureProps

export const cutoutApertureBaseProps = z.object({
  margin: distance.optional(),
  widthDimensionOffset: distance.optional(),
  heightDimensionOffset: distance.optional(),
  depth: distance.optional(),
})

const apertureOnlyProps = cutoutApertureBaseProps.shape

export const enclosureCutoutApertureProps = z.discriminatedUnion("shape", [
  pillShapeProps.extend(apertureOnlyProps),
  rectShapeProps.extend(apertureOnlyProps),
  circleShapeProps.extend(apertureOnlyProps),
])

export type ParsedEnclosureCutoutApertureProps = z.output<
  typeof enclosureCutoutApertureProps
>

type InferredEnclosureCutoutApertureProps = z.input<
  typeof enclosureCutoutApertureProps
>

expectTypesMatch<
  EnclosureCutoutApertureProps,
  InferredEnclosureCutoutApertureProps
>(true)
