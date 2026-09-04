import { z } from "zod"

/**
 * Head shapes an enclosure can cut a recess for.
 *
 * Lowercase and unspaced, matching the model-string vocabulary
 * (`screw_m3_l8mm_socketcap`) and the way `thread` is spelled here. As with
 * threads, `create-fdm-enclosure` uses its own spelling (`socket_cap`, `pan`,
 * `button`), and core converts at that boundary.
 *
 * These four are exactly the heads that work end to end: the geometry package
 * stocks dimensions for them and the enclosure solver knows which recess each
 * one needs. `modelprinter` also parses `flathead` and `hexflange`, but no
 * catalogue entry exists for either, so offering them here would let an author
 * write something that only fails once the solver runs.
 *
 * Drive type (phillips, torx, hex) is deliberately absent: it is chosen by
 * whoever assembles the device and changes no geometry.
 */
export const screwHeads = [
  "socketcap",
  "countersunk",
  "panhead",
  "buttonhead",
] as const

export type ScrewHeadName = (typeof screwHeads)[number]

export const screwHead = z.enum(screwHeads)

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
