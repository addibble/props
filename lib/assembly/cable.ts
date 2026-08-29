import { type Distance, distance } from "lib/common/distance"
import { expectTypesMatch } from "lib/typecheck"
import { z } from "zod"

/**
 * A cable in the device assembly.
 *
 * ```tsx
 * <assembly.cable connectsTo=".B1 .J1" length="200mm" color="black" />
 * <assembly.cable connectsTo={[".B1 .J1", ".B2 .J4"]} length="200mm" />
 * ```
 *
 * `connectsTo` takes **at most two** selectors, because a cable has two ends.
 * One selector describes a cable whose far end is something the design does not
 * model -- a wall adapter, a panel-mount jack fitted by hand.
 *
 * A cable can also be **inferred** rather than declared: an `assembly.screen`
 * that plugs into a connector implies the flex between them, so the render can
 * produce the cable without the author writing this element. Declaring it is
 * how you pin a length, a colour or a specific part when the inferred one is
 * not what you are buying.
 *
 * The model is likewise inferred from the connectors at each end where it can
 * be, which is why no model string is required here.
 */
export interface AssemblyCableProps {
  /** Stable identity for selectors and generated part names. */
  name?: string
  /** One or two selectors naming the connectors this cable joins. */
  connectsTo: string | [string] | [string, string]
  /** Overall length. Inferred from the endpoints when omitted. */
  length?: Distance
  /** Jacket colour, for the model and the BOM line. */
  color?: string
}

export const assemblyCableProps = z.object({
  name: z.string().optional(),
  connectsTo: z.union([
    z.string(),
    z.tuple([z.string()]),
    z.tuple([z.string(), z.string()]),
  ]),
  length: distance.optional(),
  color: z.string().optional(),
})

export type AssemblyCablePropsInput = z.input<typeof assemblyCableProps>

expectTypesMatch<AssemblyCableProps, AssemblyCablePropsInput>(true)
