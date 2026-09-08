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

test("insert thread spelling is preserved for downstream validation", () => {
  expect(enclosureFdmHeatsetInsertProps.parse({ thread: "M3" })).toEqual({
    thread: "M3",
  })
})

test("exposes the insert through the enclosure namespace", () => {
  expect(enclosureProps.fdm.heatsetinsert).toBe(enclosureFdmHeatsetInsertProps)
})
