import { z } from "zod"

/**
 * Nominal metric thread designations used by assembly hardware.
 *
 * Lowercase, matching how the RFC spells them (`thread="m3"`) and how the
 * footprinter / modelprinter string vocabularies do (`screw_m3_l8mm`).
 *
 * This is the authoring vocabulary only. `create-fdm-enclosure` spells the same
 * threads uppercase (`FastenerThread = "M2" | "M2.5" | "M3" | ...`), so core
 * converts at that boundary. Two layers legitimately have two canonical forms;
 * normalizing case here would only hide which one you are holding.
 */
export const assemblyThreads = ["m2", "m2.5", "m3", "m4", "m5"] as const

export type AssemblyThread = (typeof assemblyThreads)[number]

export const assemblyThread = z.enum(assemblyThreads)
