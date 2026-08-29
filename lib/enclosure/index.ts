import { enclosureCutoutApertureProps } from "./cutout-aperture"
import { enclosureFdmBoxProps } from "./fdm/box"
import { enclosureFdmHeatsetInsertProps } from "./fdm/heat-set-insert"

export * from "./cutout-aperture"
export * from "./fdm"

export const enclosureProps = {
  cutoutaperture: enclosureCutoutApertureProps,
  fdm: {
    box: enclosureFdmBoxProps,
    heatsetinsert: enclosureFdmHeatsetInsertProps,
  },
} as const
