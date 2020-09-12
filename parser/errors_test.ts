import * as Assert from "../testing/asserts.ts";

import * as PP from "https://raw.githubusercontent.com/littlelanguages/deno-lib-text-prettyprint/0.3.0/mod.ts";
import {
  range,
} from "https://raw.githubusercontent.com/littlelanguages/scanpiler-deno-lib/0.1.0/location.ts";
import { asDoc } from "./errors.ts";
import { TToken } from "./scanner.ts";

Deno.test("errors - StaticSyntaxError", () => {
  assertRenderEquals(
    asDoc({
      tag: "StaticSyntaxError",
      found: [TToken.Bang, range(0, 1, 2, 3, 4, 5), "!"],
      expected: [TToken.Bar, TToken.Comments],
    }),
    'Unexpected token "!". Expected "|" or comments at 1:2-4:5',
  );
});

Deno.test("errors - ChrOutOfRangeError", () => {
  assertRenderEquals(
    asDoc({
      tag: "ChrOutOfRangeError",
      location: range(0, 1, 2, 3, 4, 5),
      code: 310,
    }, "x.ll"),
    "chr argument of 310 must be in the range 0..255 at x.ll 1:2-4:5",
  );
});

Deno.test("errors - CommentNotCharacterClassError", () => {
  assertRenderEquals(
    asDoc({
      tag: "CommentNotCharacterClassError",
      location: range(0, 1, 2, 3, 4, 5),
    }, "x.ll"),
    "whitespace must be a character class rather than a regular expression at x.ll 1:2-4:5",
  );
});

Deno.test("errors - DuplicateFragmentNameError", () => {
  assertRenderEquals(
    asDoc({
      tag: "DuplicateFragmentNameError",
      location: range(0, 1, 2, 3, 4, 5),
      name: "alpha",
    }, "x.ll"),
    "Fragment alpha is already defined at x.ll 1:2-4:5",
  );
});

Deno.test("errors - UnknownFragmentIdentifierError", () => {
  assertRenderEquals(
    asDoc({
      tag: "UnknownFragmentIdentifierError",
      location: range(0, 1, 2, 3, 4, 5),
      name: "alpha",
    }, "x.ll"),
    "Unknown fragment alpha at x.ll 1:2-4:5",
  );
});

Deno.test("errors - DuplicateTokenNameError", () => {
  assertRenderEquals(
    asDoc({
      tag: "DuplicateTokenNameError",
      location: range(0, 1, 2, 3, 4, 5),
      name: "alpha",
    }, "x.ll"),
    "Token alpha is already defined at x.ll 1:2-4:5",
  );
});

Deno.test("errors - FeatureNotImplementedError", () => {
  assertRenderEquals(
    asDoc({
      tag: "FeatureNotImplementedError",
      location: range(0, 1, 2, 3, 4, 5),
      nature: "Extending a lexical definition",
    }, "x.ll"),
    'Feature "Extending a lexical definition" it not yet implemented at x.ll 1:2-4:5',
  );
});

Deno.test("errors - MinusOperandNotCharacterClassError", () => {
  assertRenderEquals(
    asDoc({
      tag: "MinusOperandNotCharacterClassError",
      location: range(0, 1, 2, 3, 4, 5),
    }, "x.ll"),
    "Minus operator applies only to character class expressions rather than regular expressions at x.ll 1:2-4:5",
  );
});

Deno.test("errors - NotExpectsCharacterClassError", () => {
  assertRenderEquals(
    asDoc({
      tag: "NotExpectsCharacterClassError",
      location: range(0, 1, 2, 3, 4, 5),
    }, "x.ll"),
    "Not operator applies only to a character class expression rather than to a regular expression at x.ll 1:2-4:5",
  );
});

Deno.test("errors - RangeOperandNotCharactersError", () => {
  assertRenderEquals(
    asDoc({
      tag: "RangeOperandNotCharactersError",
      location: range(0, 1, 2, 3, 4, 5),
    }, "x.ll"),
    "Range operator applies only to character class expressions rather than regular expressions at x.ll 1:2-4:5",
  );
});

Deno.test("errors - UnionOperandNotCharactersError", () => {
  assertRenderEquals(
    asDoc({
      tag: "UnionOperandNotCharacterClassError",
      location: range(0, 1, 2, 3, 4, 5),
    }, "x.ll"),
    "Union operator applies only to character class expressions rather than regular expressions at x.ll 1:2-4:5",
  );
});

async function assertRenderEquals(doc: PP.Doc, text: string) {
  const sw = new StringWriter();

  await PP.render(doc, sw);

  Assert.assertEquals(sw.str, text);
}

class StringWriter implements Deno.Writer {
  decoder = new TextDecoder();
  str = "";

  write(p: Uint8Array): Promise<number> {
    this.str = this.str + this.decoder.decode(p);
    return Promise.resolve(p.length);
  }
}
