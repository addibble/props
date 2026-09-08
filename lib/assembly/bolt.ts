import { type AssemblyThread, assemblyThread } from "lib/common/assemblyThread"
import { type Distance, distance } from "lib/common/distance"
import { expectTypesMatch } from "lib/typecheck"
import { z } from "zod"
import { screwHead, type ScrewHeadName } from "../common/screwHead"

/**
 * A bolt that fastens the assembly together.
 *
 * Unlike the heat-set insert it sits in, a bolt spans parts -- it passes
 * through the lid, across the headroom and into the insert -- so it belongs to
 * the device rather than to any one hole. It is therefore declared at assembly
 * level and points at the hole it passes through with `holeRef`:
 *
 * ```tsx
 * <assembly.bolt thread="m3" length="10mm" holeRef=".B1 .H1" fastensLid />
 * ```
 *
 * You do not normally give a length. The stack is known -- lid, headroom,
 * board, insert -- so the length is derived from it and rounded up to a size a
 * supplier stocks. Author one only to pin a specific bolt, and expect to be
 * told when it does not fit.
 */
export interface AssemblyBoltProps {
  /** Stable identity for selectors and generated part names. */
  name?: string
  /** Nominal thread. */
  thread: AssemblyThread
  /**
   * Head shape, which decides the recess the enclosure cuts for it.
   *
   * Any nonempty string is preserved; supported names are validated downstream.
   * The mechanical resolver defaults to `socketcap`, which uses a plain
   * counterbore when recessed. Choose `countersunk` when the head must finish
   * flush with the surface.
   */
  head?: ScrewHeadName
  /**
   * Sink the head into the part it bears on, rather than letting it sit proud.
   *
   * The kind of recess follows from the head -- a cone for a countersunk head, a
   * flat-bottomed bore for a cap, pan or button -- so this is only whether, not
   * which. A countersunk head is recessed whether or not you ask, because it
   * cannot seat on a flat face.
   */
  headRecess?: boolean
  /**
   * Length under the head. **Normally omitted and derived.**
   *
   * When authored, it is checked rather than trusted: a bolt that engages too
   * little thread, or that bottoms out before it clamps, is reported against
   * the same bounds the derivation would have used.
   */
  length?: Distance
  /**
   * Selector for the hole this bolt passes through. Omit it when the element is
   * declared as a child of that hole.
   *
   * Optional for the same reason it is optional on `<assembly.screw />` and
   * `<enclosure.fdm.heatsetinsert />`: nesting reads better when the hole
   * exists for the fastener, and the selector reads better when the board is
   * authored elsewhere. It is required exactly when the element is not a child
   * of a hole, which the schema cannot see -- core validates it.
   */
  holeRef?: string
  /**
   * The bolt reaches through the lid and holds it down, rather than stopping at
   * the board. A lid bolt costs no floor area, because it reuses a hole the
   * board already has.
   */
  fastensLid?: boolean
  /**
   * Print a column down from the lid to the board, so the bolt clamps the board
   * between it and the floor boss.
   *
   * This is what retains the PCB on a lid bolt: without it the bolt passes the
   * board freely and only the floor boss holds it. The column is printed on the
   * **lid**, hanging down -- standing it up from the floor would occupy the hole
   * the board has to be lowered over, so it would block assembly.
   *
   * Absent means no column, so retention is something you ask for rather than
   * something that appears. Only meaningful with `fastensLid`.
   */
  lidColumn?: boolean
}

export const assemblyBoltProps = z.object({
  name: z.string().optional(),
  thread: assemblyThread,
  head: screwHead.optional(),
  headRecess: z.boolean().optional(),
  length: distance.optional(),
  holeRef: z.string().optional(),
  fastensLid: z.boolean().optional(),
  lidColumn: z.boolean().optional(),
})

export type AssemblyBoltPropsInput = z.input<typeof assemblyBoltProps>

expectTypesMatch<AssemblyBoltProps, AssemblyBoltPropsInput>(true)
