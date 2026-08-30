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
