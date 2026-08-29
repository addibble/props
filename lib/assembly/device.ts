import { type CadModelProp, cadModelProp } from "lib/common/cadModel"
import { expectTypesMatch } from "lib/typecheck"
import { z } from "zod"

/**
 * A product-level assembly.
 *
 * A device can contain boards, enclosures, assembly hardware, and **other
 * devices** -- a keyboard holds a controller board and a display module, and
 * the display module is itself a device somebody manufactured. Nesting is what
 * lets a BOM be taken at any level (see the BOM selector rules in the RFC).
 *
 * `cadModel` exists because a device that is not a board still has a shape. A
 * purchased subassembly is drawn from a model string or a model file, in
 * exactly the way a component is:
 *
 * ```tsx
 * <assembly.device name="SCREEN" cadModel="flexscreen_w40mm_h22.5mm" />
 * ```
 */
export interface AssemblyDeviceProps {
  /** Product-level assembly identity. */
  name?: string
  /**
   * How to draw this device. A footprinter or modelprinter string, or any of
   * the model-file forms a component's `cadModel` accepts.
   */
  cadModel?: CadModelProp
  children?: any
}

export const assemblyDeviceProps = z.object({
  name: z.string().optional(),
  cadModel: cadModelProp.optional(),
  children: z.any().optional(),
})

export type AssemblyDevicePropsInput = z.input<typeof assemblyDeviceProps>

expectTypesMatch<AssemblyDeviceProps, AssemblyDevicePropsInput>(true)
