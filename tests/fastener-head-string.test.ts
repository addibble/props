import { expect, test } from "bun:test"
import { assemblyBoltProps, assemblyScrewProps } from "../lib/assembly"
import type { ScrewHeadName } from "../lib/common/screwHead"

test("fastener heads are nonempty authored strings, not a local supported-model enum", () => {
  const futureHead: ScrewHeadName = "future_head"
  for (const schema of [assemblyBoltProps, assemblyScrewProps]) {
    for (const head of [futureHead, "flathead", "socket_cap", " SocketCap "]) {
      expect(schema.parse({ thread: "m3", head }).head).toBe(head)
    }
    expect(schema.parse({ thread: "m3" }).head).toBeUndefined()
    for (const head of ["", null, 12, false, {}]) {
      expect(schema.safeParse({ thread: "m3", head }).success).toBe(false)
    }
  }
})
