import { z } from "zod"
import type { AssemblyThread } from "./assemblyThread"

/**
 * Nominal major diameter, in millimetres, for each thread designation.
 *
 * The thread-forming defaults below are ratios of this rather than a table of
 * absolute values, so a thread the fastener catalogue has never heard of still
 * gets a sane pilot bore.
 */
export const assemblyThreadNominalDiameterMm: Record<AssemblyThread, number> = {
  m2: 2,
  "m2.5": 2.5,
  m3: 3,
  m4: 4,
  m5: 5,
}

/**
 * Default fastener geometry, as multiples of the nominal diameter.
 *
 * These are generic values for a thread-forming screw in a common
 * thermoplastic. **They are a starting point, not a specification.** Real
 * families (Plastite, Delta PT, Remform, ...) publish their own numbers, and
 * those numbers change with the plastic -- a glass-filled nylon and a soft
 * polyolefin want different pilots for the same screw. Every one is
 * overridable on `<assembly.screw>` for that reason, and a parts engine that
 * knows the family should eventually supply them.
 */
export const threadFormingDefaults = {
  /** Depth of thread the boss must provide. */
  threadEngagementRatio: 2.5,
  /** Pilot bore the screw forms its thread in. */
  pilotDiameterRatio: 0.8,
  /**
   * Space below the fastener, where displaced material goes.
   *
   * One value for both fastening methods. A screw's tip pushes a slug of
   * plastic ahead of it and an insert displaces melt as the iron drives it in;
   * the bore has to swallow the difference either way, and the enclosure does
   * the same thing with the number in both cases -- deepen the bore and keep
   * that much back from the floor.
   */
  bottomClearanceRatio: 1,
  /** Outer diameter of the bore's entry chamfer. */
  boreEntryChamferRatio: 1.1,
} as const

export interface ThreadFormingGeometryMm {
  threadEngagementMm: number
  pilotDiameterMm: number
  bottomClearanceMm: number
}

/**
 * A 45-degree lead-in cut at the mouth of a bore.
 *
 * It centres the screw tip so the first thread forms square, and it stops the
 * first turn lifting a lip of material around the hole. At 45 degrees the cone
 * descends one millimetre per millimetre of radius, so the depth follows from
 * the two diameters and is never authored separately.
 */
export interface BoreEntryChamferMm {
  /** Diameter at the surface. */
  outerDiameterMm: number
  /** How far down the cone reaches before it meets the bore. */
  depthMm: number
}

export const resolveBoreEntryChamferMm = ({
  thread,
  boreDiameterMm,
  ratio,
}: {
  thread: AssemblyThread
  /** The bore the chamfer leads into: a pilot for a screw, an install bore for an insert. */
  boreDiameterMm: number
  ratio?: number
}): BoreEntryChamferMm => {
  const outerDiameterMm =
    assemblyThreadNominalDiameterMm[thread] *
    (ratio ?? threadFormingDefaults.boreEntryChamferRatio)
  return {
    outerDiameterMm,
    // 45 degrees: the cone drops by the radial difference it spans.
    depthMm: Math.max(0, (outerDiameterMm - boreDiameterMm) / 2),
  }
}

/**
 * Resolve thread-forming geometry, preferring authored values.
 *
 * Kept in props rather than in the enclosure package because the defaults are
 * part of what `<assembly.screw>` *means*: an author reading the prop docs and
 * a solver reading the geometry must not be able to disagree about what
 * omitting a prop implies.
 */
/**
 * Depth kept below a fastener so it clamps rather than bottoming out.
 *
 * **Converges two rules that were doing the same job.** `create-fdm-enclosure`
 * carries `insertMeltReliefMm` (0.5mm) for inserts and `selfTapPilotReliefMm`
 * (1mm) for screws -- two names, two numbers, one meaning. Both become this.
 *
 * Note the magnitude changes: 1x nominal is 3mm for an M3, against 0.5-1mm
 * before, so bosses get deeper. That is the conservative direction -- extra
 * clearance costs boss depth and never causes a bottoming failure -- and if the
 * insert case proves wasteful in practice the fix is this default, not a second
 * branch.
 */
export const resolveBottomClearanceMm = ({
  thread,
  bottomClearanceMm,
}: {
  thread: AssemblyThread
  bottomClearanceMm?: number
}): number =>
  bottomClearanceMm ??
  assemblyThreadNominalDiameterMm[thread] *
    threadFormingDefaults.bottomClearanceRatio

export const resolveThreadFormingGeometryMm = ({
  thread,
  threadEngagementMm,
  pilotDiameterMm,
  bottomClearanceMm,
}: {
  thread: AssemblyThread
  threadEngagementMm?: number
  pilotDiameterMm?: number
  bottomClearanceMm?: number
}): ThreadFormingGeometryMm => {
  const d = assemblyThreadNominalDiameterMm[thread]
  return {
    threadEngagementMm:
      threadEngagementMm ?? d * threadFormingDefaults.threadEngagementRatio,
    pilotDiameterMm:
      pilotDiameterMm ?? d * threadFormingDefaults.pilotDiameterRatio,
    bottomClearanceMm: resolveBottomClearanceMm({ thread, bottomClearanceMm }),
  }
}

/**
 * Minimum outer diameter of a printed boss, whatever goes in it.
 *
 * **One derivation, not one per fastening method.** Two terms compete and the
 * larger wins:
 *
 * - `boreDiameterMm + 2 * minWallMm` -- enough material around whatever is
 *   bored, which is what governs a heat-set insert, whose install bore is wide
 *   (4.0mm for an M3) and leaves the wall as the binding constraint;
 * - `2 * nominalDiameter` -- enough material to resist the hoop stress a
 *   thread-forming screw generates, which is what governs a screw, whose pilot
 *   is narrow (2.4mm for an M3) and would otherwise permit a boss too thin to
 *   survive the first turn.
 *
 * Taking the max means neither case needs its own branch, and neither can be
 * forgotten when the other is changed. Worked for an M3 at a 1.2mm minimum
 * wall:
 *
 * | | bore | wall term | floor term | result |
 * | --- | --- | --- | --- | --- |
 * | thread-forming screw | 2.4 | 4.8 | 6.0 | **6.0** |
 * | heat-set insert | 4.0 | 6.4 | 6.0 | **6.4** |
 */
export const getBossOuterDiameterMm = ({
  thread,
  boreDiameterMm,
  minWallMm,
}: {
  thread: AssemblyThread
  boreDiameterMm: number
  minWallMm: number
}): number =>
  Math.max(
    boreDiameterMm + 2 * minWallMm,
    2 * assemblyThreadNominalDiameterMm[thread],
  )

/** The floor term of {@link getBossOuterDiameterMm}, on its own. */
export const getMinimumBossOuterDiameterMm = (thread: AssemblyThread): number =>
  2 * assemblyThreadNominalDiameterMm[thread]

export const assemblyThreadNominalDiameter = z.number().positive()
