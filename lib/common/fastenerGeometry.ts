import { z } from "zod"

/**
 * Authored mouth diameter divided by the installation bore diameter.
 *
 * Props preserves omission. Installation defaults and mechanical resolution
 * belong to @tscircuit/create-fdm-enclosure, not to the authoring parser.
 * The former mechanical-default helpers are replaced by that package's
 * resolveFdmInstallationPolicy; importing the solver here would create a cycle.
 */
export const boreEntryChamferRatio = z.number().finite().min(1)
