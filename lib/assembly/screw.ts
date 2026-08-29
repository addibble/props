import { type AssemblyThread, assemblyThread } from "lib/common/assemblyThread"
import { type Distance, distance } from "lib/common/distance"
import { expectTypesMatch } from "lib/typecheck"
import { z } from "zod"

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
   * Defaults to **2.5x the nominal diameter**, which suits a thread-forming
   * screw in a common thermoplastic. Families differ, and so does the plastic:
   * a glass-filled nylon needs less engagement than a soft polyolefin for the
   * same pull-out. Until a parts engine can look this up per family, it is
   * authored from the screw's own data sheet.
   */
  threadEngagement?: Distance

  /**
   * Diameter of the pilot bore the screw forms its thread in.
   *
   * Defaults to **0.8x the nominal diameter**. This is the single most
   * material-sensitive number here: too tight and the boss splits or the screw
   * shears, too loose and the thread strips. Every thread-forming family
   * publishes its own value per material.
   */
  pilotDiameter?: Distance

  /**
   * Space below the screw tip, so it clamps rather than bottoming out.
   *
   * Defaults to **1x the nominal diameter**, the same rule and the same number
   * a heat-set insert uses. A screw's tip pushes a slug of plastic ahead of it
   * and an insert displaces melt; the bore swallows the difference either way.
   */
  bottomClearance?: Distance

  /**
   * Outer diameter of the bore's entry chamfer, as a **ratio of the screw's
   * nominal diameter**. Defaults to **1.1**.
   *
   * The chamfer is always cut at 45 degrees, so its depth follows from this
   * diameter and the pilot bore rather than being authored separately. It
   * centres the tip so the first thread forms square, and stops the first turn
   * lifting a lip around the hole.
   *
   * A ratio rather than a distance because it scales with the screw, and
   * because the useful range is narrow -- much past 1.2 and the chamfer eats
   * the engagement it was meant to protect.
   */
  boreEntryChamfer?: number
}

export const assemblyScrewProps = z.object({
  name: z.string().optional(),
  thread: assemblyThread,
  designation: z.string().optional(),
  holeRef: z.string().optional(),
  threadEngagement: distance.optional(),
  pilotDiameter: distance.optional(),
  bottomClearance: distance.optional(),
  boreEntryChamfer: z.number().positive().optional(),
})

export type AssemblyScrewPropsInput = z.input<typeof assemblyScrewProps>

expectTypesMatch<AssemblyScrewProps, AssemblyScrewPropsInput>(true)
