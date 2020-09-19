import { assertEquals, assertThrows } from "../testing/asserts.ts";
import {
  CharacterClassRegEx,
  Definition,
  LiteralStringRegEx,
  SequenceRegEx,
} from "./definition.ts";
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

Deno.test("definition - literalMatch", () => {
  assertEquals(new LiteralStringRegEx("hello").literalMatch("hello"), 5);
  assertEquals(new LiteralStringRegEx("hello").literalMatch("helloworld"), 5);

  assertEquals(
    new SequenceRegEx(
      [new LiteralStringRegEx("hel"), new LiteralStringRegEx("lo")],
    ).literalMatch("helloworld"),
    5,
  );

  assertEquals(
    new SequenceRegEx(
      [new LiteralStringRegEx("hel"), new LiteralStringRegEx("Lo")],
    ).literalMatch("helloworld"),
    undefined,
  );

  assertEquals(
    new SequenceRegEx(
      [
        new CharacterClassRegEx(setOf("h".charCodeAt(0))),
        new LiteralStringRegEx("el"),
        new CharacterClassRegEx(setOf("l".charCodeAt(0))),
        new LiteralStringRegEx("o"),
      ],
    ).literalMatch("helloworld"),
    5,
  );
});
