import { type AssemblyThread, assemblyThread } from "lib/common/assemblyThread"
import { type Distance, distance } from "lib/common/distance"
import { expectTypesMatch } from "lib/typecheck"
import { z } from "zod"
import { boreEntryChamferRatio } from "../../common/fastenerGeometry"

/**
 * A heat-set insert melted into an enclosure boss so a bolt has metal threads
 * to bite.
 *
 * ## Two accepted spellings
 *
 * The insert can be declared as a child of the hole it sits under, or on its
 * own with a `holeRef` selector:
 *
 * ```tsx
 * <hole name="H1" pcbX={-15} pcbY={-8} diameter="3.2mm">
 *   <enclosure.fdm.heatsetinsert thread="m3" />
 * </hole>
 *
 * <enclosure.fdm.heatsetinsert thread="m3" holeRef=".B1 .H1" />
 * ```
 *
 * Both name the same relationship, and neither is preferred. Nesting reads
 * better when the hole exists for the insert; the selector reads better when a
 * board is authored elsewhere, or generated, and the enclosure hardware is
 * described beside the enclosure.
 *
 * `holeRef` is therefore required exactly when the element is not a child of a
 * hole, which the schema cannot see. Core validates it.
 */
export interface EnclosureFdmHeatsetInsertProps {
  /** Stable identity for selectors and generated part names. */
  name?: string
  /** Nominal thread the insert accepts. */
  thread: AssemblyThread
  /**
   * Selector for the hole this insert sits under. Omit it when the element is
   * declared as a child of that hole.
   */
  holeRef?: string

  /**
   * Depth kept below the insert so it seats rather than bottoming out.
   *
   * A nonnegative distance in mm (or a unit-bearing string). Omission delegates
   * installation policy to the enclosure solver; an authored zero stays zero.
   * This reserve accommodates the melt displaced as the iron seats the insert.
   */
  bottomClearance?: Distance

  /**
   * Outer diameter of the entry chamfer divided by the **installation bore
   * diameter**. The enclosure solver defaults to **1.2** when omitted, cut at
   * 45 degrees. Must be finite and at least 1; 1 requests no chamfer.
   *
   * An insert wants a lead-in for the same reason a screw does, but for a
   * different mechanism: it keeps the insert square to the bore as the iron
   * pushes it in, where a crooked start is what produces a proud or tilted
   * insert.
   *
   * `threadEngagement` and `pilotDiameter` have no insert equivalent: an insert
   * supplies its own thread, so engagement is its threaded length, and the bore
   * is its installation diameter.
   */
  boreEntryChamfer?: number
}

export const enclosureFdmHeatsetInsertProps = z.object({
  name: z.string().optional(),
  thread: assemblyThread,
  holeRef: z.string().optional(),
  bottomClearance: distance.pipe(z.number().finite().nonnegative()).optional(),
  boreEntryChamfer: boreEntryChamferRatio.optional(),
})

export type EnclosureFdmHeatsetInsertPropsInput = z.input<
  typeof enclosureFdmHeatsetInsertProps
>

expectTypesMatch<
  EnclosureFdmHeatsetInsertProps,
  EnclosureFdmHeatsetInsertPropsInput
>(true)
