import { assertThrows } from "../testing/asserts.ts";
import { Definition } from "./definition.ts";
import { setOf } from "../data/set.ts";

Deno.test("Definition - add fragement", () => {
  const d = new Definition();

  d.addFragment("f1", setOf(0));

  assertThrows(
    () => d.addFragment("f1", setOf(1)),
    RangeError,
    "Definition: Duplicate fragment: f1",
  );
});
