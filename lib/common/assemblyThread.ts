import { z } from "zod"

/**
 * An authored thread designation, forwarded unchanged to the mechanical resolver.
 * Props requires a nonempty string; grammar and catalogue support are validated
 * downstream. No default, case normalization or whitespace trimming is applied.
 */
export const assemblyThread = z.string().min(1)
export type AssemblyThread = z.infer<typeof assemblyThread>
