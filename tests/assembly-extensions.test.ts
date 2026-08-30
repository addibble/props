import { expect, test } from "bun:test"
import {
  type AssemblyBoltPropsInput,
  type AssemblyCablePropsInput,
  type AssemblyScreenPropsInput,
  assemblyBoltProps,
  assemblyCableProps,
  assemblyProps,
  assemblyScreenProps,
  assemblyScrewProps,
} from "lib/assembly"
import { enclosureFdmHeatsetInsertProps } from "lib/enclosure"
import {
  getBossOuterDiameterMm,
  getMinimumBossOuterDiameterMm,
  resolveBoreEntryChamferMm,
  resolveBottomClearanceMm,
  resolveThreadFormingGeometryMm,
} from "lib/common/fastenerGeometry"

test("parses assembly.bolt props", () => {
  const input: AssemblyBoltPropsInput = {
    thread: "m3",
    length: "10mm",
    holeRef: ".B1 .H1",
    fastensLid: true,
  }

  expect(assemblyBoltProps.parse(input)).toEqual({
    thread: "m3",
    length: 10,
    holeRef: ".B1 .H1",
    fastensLid: true,
  })
})

test("assembly.bolt threads are lowercase only", () => {
  expect(() =>
    assemblyBoltProps.parse({
      thread: "M3",
      length: "8mm",
      holeRef: ".B1 .H1",
    }),
  ).toThrow()
})

/**
 * `holeRef` is optional on every fastener, because the RFC's primary syntax
 * nests the element inside the hole it fastens -- the selector form exists for
 * boards authored elsewhere. It is required exactly when the element is NOT a
 * child of a hole, which the schema cannot see; core validates that.
 *
 * This was wrong for `assembly.bolt` alone, which required it while
 * `assembly.screw` and `enclosure.fdm.heatsetinsert` did not. The inconsistency
 * only surfaced when a playground authored the RFC's own example.
 */
test("assembly.bolt accepts a nested hole, with no holeRef", () => {
  expect(assemblyBoltProps.parse({ thread: "m3", length: "8mm" })).toEqual({
    thread: "m3",
    length: 8,
  })
})

test("assembly.bolt length is optional; it is derived from the stack", () => {
  expect(assemblyBoltProps.parse({ thread: "m3", holeRef: ".B1 .H1" })).toEqual(
    { thread: "m3", holeRef: ".B1 .H1" },
  )
})

test("assembly.screen is a superset of assembly.device", () => {
  const input: AssemblyScreenPropsInput = {
    name: "SCREEN",
    connectsTo: ".B1 .J1",
    width: "2.3in",
    height: "1.8in",
  }
  const parsed = assemblyScreenProps.parse(input)

  expect(parsed.name).toBe("SCREEN")
  expect(parsed.connectsTo).toBe(".B1 .J1")
  // a screen can be drawn like any other device: cadModel is inherited from
  // assembly.device, so it accepts every model form a device's does
  expect(
    assemblyScreenProps.parse({
      name: "SCREEN",
      connectsTo: ".B1 .J1",
      cadModel: "flexscreen_w40mm",
    }),
  ).toEqual({
    name: "SCREEN",
    connectsTo: ".B1 .J1",
    cadModel: "flexscreen_w40mm",
  })
  // ...and, like a device, it can contain other assembly elements
  expect(
    assemblyScreenProps.parse({
      name: "SCREEN",
      connectsTo: ".B1 .J1",
      cadModel: "flexscreen_w40mm",
      children: null,
    }).children,
  ).toBe(null)
})

test("assembly.cable takes one or two endpoints", () => {
  const one: AssemblyCablePropsInput = { connectsTo: ".B1 .J1" }
  const two: AssemblyCablePropsInput = {
    connectsTo: [".B1 .J1", ".B2 .J4"],
    length: "200mm",
    color: "black",
  }

  expect(assemblyCableProps.parse(one).connectsTo).toBe(".B1 .J1")
  expect(assemblyCableProps.parse(two)).toEqual({
    connectsTo: [".B1 .J1", ".B2 .J4"],
    length: 200,
    color: "black",
  })
})

test("assembly.cable rejects a third endpoint", () => {
  expect(() =>
    assemblyCableProps.parse({
      connectsTo: [".B1 .J1", ".B2 .J4", ".B3 .J7"],
    }),
  ).toThrow()
})

test("exposes every element through the assembly namespace", () => {
  expect(Object.keys(assemblyProps).sort()).toEqual([
    "bolt",
    "cable",
    "device",
    "screen",
    "screw",
  ])
})

test("assembly.screw has no length: it is always derived", () => {
  expect(assemblyScrewProps.parse({ thread: "m2.5" })).toEqual({
    thread: "m2.5",
  })
  // designation is a procurement query, never parsed by the render
  expect(
    assemblyScrewProps.parse({
      thread: "m2.5",
      designation: "phillips pan-head plastite thread-forming screw",
      holeRef: ".B1 .H1",
    }).designation,
  ).toBe("phillips pan-head plastite thread-forming screw")
})

test("thread-forming geometry defaults to ratios of the nominal diameter", () => {
  // 2.5x / 0.8x / 1x of 3mm
  expect(resolveThreadFormingGeometryMm({ thread: "m3" })).toEqual({
    threadEngagementMm: 7.5,
    pilotDiameterMm: 2.4000000000000004,
    bottomClearanceMm: 3,
  })
})

test("thread-forming geometry is overridable per family and per plastic", () => {
  expect(
    resolveThreadFormingGeometryMm({
      thread: "m3",
      pilotDiameterMm: 2.6,
      threadEngagementMm: 6,
    }),
  ).toEqual({
    threadEngagementMm: 6,
    pilotDiameterMm: 2.6,
    bottomClearanceMm: 3,
  })
})

test("a boss must be at least twice the screw diameter", () => {
  expect(getMinimumBossOuterDiameterMm("m3")).toBe(6)
  expect(getMinimumBossOuterDiameterMm("m2.5")).toBe(5)
})

test("assembly.screw carries the thread-forming overrides", () => {
  const parsed = assemblyScrewProps.parse({
    thread: "m3",
    threadEngagement: "6mm",
    pilotDiameter: "2.6mm",
    bottomClearance: "2mm",
  })
  expect(parsed.threadEngagement).toBe(6)
  expect(parsed.pilotDiameter).toBe(2.6)
  expect(parsed.bottomClearance).toBe(2)
})

test("bore entry chamfer is 45 degrees, so depth follows from the diameters", () => {
  // M3: chamfer OD 1.1 x 3 = 3.3, pilot 2.4 -> depth (3.3-2.4)/2 = 0.45
  const c = resolveBoreEntryChamferMm({ thread: "m3", boreDiameterMm: 2.4 })
  expect(c.outerDiameterMm).toBeCloseTo(3.3, 5)
  expect(c.depthMm).toBeCloseTo(0.45, 5)
})

test("an insert bore is wider, so the same chamfer ratio is shallower", () => {
  const c = resolveBoreEntryChamferMm({ thread: "m3", boreDiameterMm: 4.0 })
  // the bore is already wider than the chamfer, so there is nothing to cut
  expect(c.depthMm).toBe(0)
})

test("one boss derivation serves both fastening methods", () => {
  // screw: the 2x floor binds
  expect(
    getBossOuterDiameterMm({
      thread: "m3",
      boreDiameterMm: 2.4,
      minWallMm: 1.2,
    }),
  ).toBeCloseTo(6, 5)
  // insert: the wall term binds
  expect(
    getBossOuterDiameterMm({
      thread: "m3",
      boreDiameterMm: 4.0,
      minWallMm: 1.2,
    }),
  ).toBeCloseTo(6.4, 5)
})

test("assembly.screw and the insert both take a chamfer ratio", () => {
  expect(
    assemblyScrewProps.parse({ thread: "m3", boreEntryChamfer: 1.2 })
      .boreEntryChamfer,
  ).toBe(1.2)
  expect(
    enclosureFdmHeatsetInsertProps.parse({
      thread: "m3",
      boreEntryChamfer: 1.15,
    }).boreEntryChamfer,
  ).toBe(1.15)
})

test("bottom clearance is one rule for both fastening methods", () => {
  expect(resolveBottomClearanceMm({ thread: "m3" })).toBe(3)
  expect(resolveBottomClearanceMm({ thread: "m2.5" })).toBe(2.5)
  expect(resolveBottomClearanceMm({ thread: "m3", bottomClearanceMm: 1 })).toBe(
    1,
  )

  // and both elements accept it
  expect(
    assemblyScrewProps.parse({ thread: "m3", bottomClearance: "2mm" })
      .bottomClearance,
  ).toBe(2)
  expect(
    enclosureFdmHeatsetInsertProps.parse({
      thread: "m3",
      bottomClearance: "2mm",
    }).bottomClearance,
  ).toBe(2)
})
