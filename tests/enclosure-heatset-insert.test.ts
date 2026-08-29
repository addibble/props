import { expect, test } from "bun:test"
import {
  type EnclosureFdmHeatsetInsertPropsInput,
  enclosureFdmHeatsetInsertProps,
  enclosureProps,
} from "lib/enclosure"

test("parses enclosure.fdm.heatsetinsert nested in a hole", () => {
  const input: EnclosureFdmHeatsetInsertPropsInput = { thread: "m3" }

  expect(enclosureFdmHeatsetInsertProps.parse(input)).toEqual({ thread: "m3" })
})

test("parses enclosure.fdm.heatsetinsert with a holeRef", () => {
  expect(
    enclosureFdmHeatsetInsertProps.parse({
      thread: "m3",
      holeRef: ".B1 .H1",
    }),
  ).toEqual({ thread: "m3", holeRef: ".B1 .H1" })
})

test("threads are lowercase; the uppercase spelling is a different layer", () => {
  expect(() => enclosureFdmHeatsetInsertProps.parse({ thread: "M3" })).toThrow()
})

test("exposes the insert through the enclosure namespace", () => {
  expect(enclosureProps.fdm.heatsetinsert).toBe(enclosureFdmHeatsetInsertProps)
})
