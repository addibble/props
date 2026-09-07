import { type AssemblyThread, assemblyThread } from "lib/common/assemblyThread"
import { type Distance, distance } from "lib/common/distance"
import { expectTypesMatch } from "lib/typecheck"
import { z } from "zod"
import { screwHead, type ScrewHeadName } from "../common/screwHead"
import { boreEntryChamferRatio } from "../common/fastenerGeometry"

/**
 * A self-tapping (thread-forming) screw driven straight into a printed boss.
 *
 * ```tsx
 * <hole name="H1" pcbX={-15} pcbY={-8} diameter="3.2mm">
 *   <assembly.screw thread="m2.5" designation="phillips pan-head plastite thread-forming screw for thermoplastic" />
 * </hole>
 *
 * <assembly.screw thread="m2.5" designation="..." holeRef=".B1 .H1" />
 * ```
 *
 * ## Why there is no `length`
 *
 * The stack is known -- board thickness, standoff, and the engagement the boss
 * has to provide -- so the length is derived and rounded up to a size a
 * supplier stocks. Authoring it would mean maintaining by hand a number the
 * solver already computes, and getting it wrong is not a typo but a screw that
 * bottoms out or strips the boss.
 *
 * ## Why the element carries the fastening method
 *
 * A screw declared on a hole threads into the plastic itself, where a bolt
 * threads into an insert. That difference decides what is bored into the boss:
 * a self-tap pilot (2.1mm for M2.5) rather than an insert's installation
 * diameter. It is carried by *which element you used* rather than by a flag,
 * so it cannot be set to a value that contradicts the hardware present.
 */
export interface AssemblyScrewProps {
  /** Stable identity for selectors and generated part names. */
  name?: string
  /** Nominal thread. */
  thread: AssemblyThread
  /**
   * Head shape, which decides the recess the enclosure cuts for it.
   *
   * Defaults to `socketcap`: it is the commonest fastener in this class and
   * needs only a plain counterbore, so an author who has not thought about
   * heads gets one that fits. Choose `countersunk` when the head must finish
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
   * What kind of screw to buy, in the terms a supplier catalogue uses --
   * "phillips pan-head plastite thread-forming screw for thermoplastic".
   *
   * This is a **procurement query, not an identity**. It is passed to the parts
   * engine to resolve a real part; it is never parsed by the render, and it is
   * never used to group BOM lines, because two authors describe one screw two
   * ways and that would split a line in half. Identity comes back from the
   * engine as a manufacturer part number.
   *
   * Nothing the geometry depends on belongs in here. The thread, the
   * engagement, the pilot bore and the bottom clearance are each their own
   * prop, the length is derived, and the fastening method is the element.
   */
  designation?: string
  /**
   * Selector for the hole this screw goes through. Omit it when the element is
   * declared as a child of that hole.
   */
  holeRef?: string

  /**
   * Depth of thread the boss must provide.
   *
   * A positive distance in mm (or a unit-bearing string). Omission delegates
   * installation policy to the enclosure solver. Families differ, as does plastic:
   * a glass-filled nylon needs less engagement than a soft polyolefin for the
   * same pull-out. Until a parts engine can look this up per family, it is
   * authored from the screw's own data sheet.
   */
  threadEngagement?: Distance

  /**
   * Diameter of the pilot bore the screw forms its thread in.
   *
   * A positive distance in mm (or a unit-bearing string). Omission delegates
   * installation policy to the enclosure solver. This is the most
   * material-sensitive number here: too tight and the boss splits or the screw
   * shears, too loose and the thread strips. Every thread-forming family
   * publishes its own value per material.
   */
  pilotDiameter?: Distance

  /**
   * Space below the screw tip, so it clamps rather than bottoming out.
   *
   * A nonnegative distance in mm (or a unit-bearing string). Omission delegates
   * installation policy to the enclosure solver; an authored zero stays zero.
   */
  bottomClearance?: Distance

  /**
   * Outer diameter of the entry chamfer divided by the **pilot bore diameter**.
   * The enclosure solver defaults to **1.2** when omitted. Must be finite and
   * at least 1; 1 requests no chamfer.
   *
   * The chamfer is always cut at 45 degrees, so its depth follows from this
   * diameter and the pilot bore rather than being authored separately. It
   * centres the tip so the first thread forms square, and stops the first turn
   * lifting a lip around the hole.
   *
   * A ratio rather than a distance because it scales with the actual bore.
   * Large mouths consume engagement and boss wall; the solver diagnoses
   * infeasible authored geometry rather than clamping it.
   */
  boreEntryChamfer?: number
}

export const assemblyScrewProps = z.object({
  name: z.string().optional(),
  thread: assemblyThread,
  head: screwHead.optional(),
  headRecess: z.boolean().optional(),
  designation: z.string().optional(),
  holeRef: z.string().optional(),
  threadEngagement: distance.pipe(z.number().finite().positive()).optional(),
  pilotDiameter: distance.pipe(z.number().finite().positive()).optional(),
  bottomClearance: distance.pipe(z.number().finite().nonnegative()).optional(),
  boreEntryChamfer: boreEntryChamferRatio.optional(),
})

export type AssemblyScrewPropsInput = z.input<typeof assemblyScrewProps>

expectTypesMatch<AssemblyScrewProps, AssemblyScrewPropsInput>(true)
