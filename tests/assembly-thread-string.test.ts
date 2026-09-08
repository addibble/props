import { expect, test } from "bun:test"
import { assemblyBoltProps, assemblyScrewProps } from "../lib/assembly"
import { enclosureFdmHeatsetInsertProps } from "../lib/enclosure"
import type { AssemblyThread } from "../lib/common/assemblyThread"

test("screws, bolts and inserts require a thread string but defer vocabulary validation", () => {
  const futureThread: AssemblyThread = "future_thread"
  for (const schema of [
    assemblyBoltProps,
    assemblyScrewProps,
    enclosureFdmHeatsetInsertProps,
  ]) {
    for (const thread of ["m3", "m2.5", "m6", "M3", " m3 ", futureThread]) {
      expect(schema.parse({ thread }).thread).toBe(thread)
    }
    expect(schema.safeParse({}).success).toBe(false)
    for (const thread of ["", undefined, null, 3, false, {}]) {
      expect(schema.safeParse({ thread }).success).toBe(false)
    }
  }
})
