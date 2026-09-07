import { expect, test } from "bun:test"
import { assemblyScrewProps } from "lib/assembly"
import { enclosureFdmHeatsetInsertProps } from "lib/enclosure"

test("fastener parsing preserves omission, SI distances and bore-relative ratios without mechanical defaults", () => {
  for (const schema of [assemblyScrewProps, enclosureFdmHeatsetInsertProps]) {
    expect(schema.parse({ thread: "m3" })).toEqual({ thread: "m3" })
    expect(
      schema.parse({
        thread: "m3",
        bottomClearance: "0.2cm",
        boreEntryChamfer: 1.2,
      }),
    ).toEqual({ thread: "m3", bottomClearance: 2, boreEntryChamfer: 1.2 })
    expect(schema.parse({ thread: "m3", bottomClearance: 0 })).toEqual({
      thread: "m3",
      bottomClearance: 0,
    })
    for (const ratio of [0.9, 0, -1, Infinity, NaN]) {
      expect(
        schema.safeParse({ thread: "m3", boreEntryChamfer: ratio }).success,
      ).toBe(false)
    }
    expect(
      schema.safeParse({ thread: "m3", bottomClearance: "-1mm" }).success,
    ).toBe(false)
  }
  const screw = assemblyScrewProps.parse({
    thread: "m3",
    threadEngagement: "0.6cm",
    pilotDiameter: "2800um",
  })
  expect(screw.threadEngagement).toBe(6)
  expect(screw.pilotDiameter).toBeCloseTo(2.8)
  for (const field of ["threadEngagement", "pilotDiameter"]) {
    for (const value of [0, -1, Infinity, NaN]) {
      expect(
        assemblyScrewProps.safeParse({ thread: "m3", [field]: value }).success,
      ).toBe(false)
    }
  }
})
