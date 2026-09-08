import { z } from "zod"

/**
 * An authored head name, forwarded unchanged to the mechanical resolver.
 * Props checks only that it is a nonempty string. Downstream model vocabulary,
 * catalogue support and assembly feasibility are separate validations.
 *
 * Drive type (phillips, torx, hex) is deliberately absent: it is chosen by
 * whoever assembles the device and changes no geometry.
 */
export const screwHead = z.string().min(1)
export type ScrewHeadName = z.infer<typeof screwHead>

/**
 * Whether to cut a recess for the head in the part it bears on.
 *
 * A boolean, not a choice of recess, because the KIND of recess is not an
 * independent decision -- it follows from the head. A countersunk head needs a
 * cone; a cap, pan or button head needs a flat-bottomed bore. The crossed
 * combinations are not options, they are mistakes: a flat head bearing on a
 * cone touches only at the rim, and a cone in a flat bore does the same.
 *
 * Offering the kind separately made both of those spellable, and only one of
 * them was checked -- `socketcap` with a countersink was silently accepted.
 * With one boolean, neither is expressible.
 *
 * The default differs by head, which is why this is optional rather than
 * defaulted to false: a countersunk head is always recessed, because it cannot
 * seat otherwise, while every other head sits proud until asked.
 */
export type HeadRecessed = boolean
