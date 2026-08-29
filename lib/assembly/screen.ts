import { type Distance, distance } from "lib/common/distance"
import { expectTypesMatch } from "lib/typecheck"
import { z } from "zod"
import { type AssemblyDeviceProps, assemblyDeviceProps } from "./device"

/**
 * A display module fitted into the device.
 *
 * **A screen is a kind of `assembly.device`**, not a leaf beside one. It is a
 * subassembly somebody else manufactured: it has its own parts, its own model,
 * and it can be selected the same way a device can. Extending
 * `assemblyDeviceProps` is what makes `.SCREEN` behave like any other device in
 * a selector, and is what the RFC means by "`assembly.screen` is a subset of an
 * `assembly.device`".
 *
 * ```tsx
 * <assembly.screen name="SCREEN" connectsTo=".B1 .J1" width="2.3in" height="1.8in" />
 * ```
 *
 * `connectsTo` names the connector it plugs into, which is also where its cable
 * is inferred from -- see `assembly.cable`.
 *
 * Unlike a bare device, a screen must identify itself and say what it plugs
 * into: it is the endpoint an inferred cable is drawn to, and an unnamed screen
 * cannot be a BOM line.
 */
export interface AssemblyScreenProps extends AssemblyDeviceProps {
  /** Stable product-level identity for the screen assembly. */
  name: string
  /** Selector for the connector this screen plugs into. */
  connectsTo: string
  /**
   * Outer width of the screen body, including its bezel but excluding the flex
   * cable. When supplied, it must be provided together with `height`.
   */
  width?: Distance
  /**
   * Outer height of the screen body, including its bezel but excluding the flex
   * cable. When supplied, it must be provided together with `width`.
   */
  height?: Distance
}

const nonemptyString = (fieldName: "name" | "connectsTo") =>
  z.string().refine((value) => value.trim().length > 0, {
    message: `${fieldName} cannot be empty`,
  })

const positiveDistance = (fieldName: "width" | "height") =>
  distance.refine((value) => Number.isFinite(value) && value > 0, {
    message: `${fieldName} must be a positive finite distance`,
  })

export const assemblyScreenProps = assemblyDeviceProps
  .extend({
    name: nonemptyString("name"),
    connectsTo: nonemptyString("connectsTo"),
    width: positiveDistance("width").optional(),
    height: positiveDistance("height").optional(),
  })
  .superRefine((screen, context) => {
    const hasWidth = screen.width !== undefined
    const hasHeight = screen.height !== undefined

    if (hasWidth !== hasHeight) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "width and height must be provided together",
        path: hasWidth ? ["height"] : ["width"],
      })
      return
    }

    // `cadModel` is inherited from assembly.device, where it is a whole union of
    // model-file forms, so the emptiness rule cannot live on the field itself.
    if (
      typeof screen.cadModel === "string" &&
      screen.cadModel.trim().length === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "cadModel cannot be empty",
        path: ["cadModel"],
      })
      return
    }

    if (!hasWidth && screen.cadModel == null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "provide either width and height or cadModel",
        path: [],
      })
    }
  })

export type AssemblyScreenPropsInput = z.input<typeof assemblyScreenProps>

expectTypesMatch<AssemblyScreenProps, AssemblyScreenPropsInput>(true)
