import { expect, test } from "bun:test"
import {
  cutoutApertureProps,
  type CutoutApertureProps,
} from "lib/components/cutout-aperture"

test("cutout aperture element props parse tscircuit lengths", () => {
  const raw: CutoutApertureProps = {
    shape: "rounded_rect",
    widthMm: "3.66mm",
    heightMm: 8.34,
    cornerRadiusMm: "1.83mm",
    zCenterAboveBoardMm: 6.75,
  }

  expect(cutoutApertureProps.parse(raw)).toEqual({
    shape: "rounded_rect",
    widthMm: 3.66,
    heightMm: 8.34,
    cornerRadiusMm: 1.83,
    zCenterAboveBoardMm: 6.75,
  })
})
