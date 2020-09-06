import { assertEquals } from "https://deno.land/std@0.63.0/testing/asserts.ts";
import { parseExpr, parseDefinition } from "./parser.ts";
import {
  Expr,
  LiteralString,
  IdentifierReference,
  Comment,
  Definition,
  ChrExpr,
  LiteralCharacterExpr,
  ParenExpr,
  ManyExpr,
  OptionalExpr,
  RangeExpr,
  NotExpr,
  MinusExpr,
  UnionExpr,
  locationOf,
  SequenceExpr,
  AlternativeExpr,
  BlockComment,
  LineComment,
} from "./ast.ts";
import { mkCoordinate, range, Location, combine } from "./location.ts";
import { right } from "../data/either.ts";

testExprEquals(
  "chr(123)",
  { tag: "ChrExpr", location: range(4, 1, 5, 6, 1, 7), value: "123" },
);

testExprEquals(
  "'x'",
  {
    tag: "LiteralCharacterExpr",
    location: range(0, 1, 1, 2, 1, 3),
    value: "'x'",
  },
);

testExprEquals(
  "x",
  { tag: "ID", location: mkCoordinate(0, 1, 1), id: "x" },
);

testExprEquals(
  "'0'-'9'",
  {
    tag: "RangeExpr",
    location: range(0, 1, 1, 6, 1, 7),
    from: {
      tag: "LiteralCharacterExpr",
      location: range(0, 1, 1, 2, 1, 3),
      value: "'0'",
    },
    to: {
      tag: "LiteralCharacterExpr",
      location: range(4, 1, 5, 6, 1, 7),
      value: "'9'",
    },
  },
);

testExprEquals(
  "('0')",
  mkParenExpr(
    range(0, 1, 1, 4, 1, 5),
    mkLiteralCharacterExpr(range(1, 1, 2, 3, 1, 4), "'0'"),
  ),
);

testExprEquals(
  "!x",
  mkNotExpr(
    range(0, 1, 1, 1, 1, 2),
    mkIdentifierReference(mkCoordinate(1, 1, 2), "x"),
  ),
);

testExprEquals(
  "x \\ y \\ z",
  mkMinusExpr(
    mkMinusExpr(
      mkIdentifierReference(mkCoordinate(0, 1, 1), "x"),
      mkIdentifierReference(mkCoordinate(4, 1, 5), "y"),
    ),
    mkIdentifierReference(mkCoordinate(8, 1, 9), "z"),
  ),
);

testExprEquals(
  "x + y + z",
  mkUnionExpr([
    mkIdentifierReference(mkCoordinate(0, 1, 1), "x"),
    mkIdentifierReference(mkCoordinate(4, 1, 5), "y"),
    mkIdentifierReference(mkCoordinate(8, 1, 9), "z"),
  ]),
);

testExprEquals(
  "x + y \\ z",
  mkUnionExpr([
    mkIdentifierReference(mkCoordinate(0, 1, 1), "x"),
    mkMinusExpr(
      mkIdentifierReference(mkCoordinate(4, 1, 5), "y"),
      mkIdentifierReference(mkCoordinate(8, 1, 9), "z"),
    ),
  ]),
);

testExprEquals(
  "x \\ y + z",
  mkUnionExpr([
    mkMinusExpr(
      mkIdentifierReference(mkCoordinate(0, 1, 1), "x"),
      mkIdentifierReference(mkCoordinate(4, 1, 5), "y"),
    ),
    mkIdentifierReference(mkCoordinate(8, 1, 9), "z"),
  ]),
);

testExprEquals('"hello"', mkLiteralString(range(0, 1, 1, 6, 1, 7), '"hello"'));

testExprEquals("cc", mkIdentifierReference(range(0, 1, 1, 1, 1, 2), "cc"));

testExprEquals(
  "(xx)",
  mkParenExpr(
    range(0, 1, 1, 3, 1, 4),
    mkIdentifierReference(range(1, 1, 2, 2, 1, 3), "xx"),
  ),
);

testExprEquals(
  "{xx}",
  mkManyExpr(
    range(0, 1, 1, 3, 1, 4),
    mkIdentifierReference(range(1, 1, 2, 2, 1, 3), "xx"),
  ),
);

testExprEquals(
  "[xx]",
  mkOptionalExpr(
    range(0, 1, 1, 3, 1, 4),
    mkIdentifierReference(range(1, 1, 2, 2, 1, 3), "xx"),
  ),
);

testExprEquals(
  "ab cd ef",
  mkSequenceExpr(
    [
      mkIdentifierReference(range(0, 1, 1, 1, 1, 2), "ab"),
      mkIdentifierReference(range(3, 1, 4, 4, 1, 5), "cd"),
      mkIdentifierReference(range(6, 1, 7, 7, 1, 8), "ef"),
    ],
  ),
);

testExprEquals(
  "ab|cd|ef",
  mkAlternativeExpr(
    [
      mkIdentifierReference(range(0, 1, 1, 1, 1, 2), "ab"),
      mkIdentifierReference(range(3, 1, 4, 4, 1, 5), "cd"),
      mkIdentifierReference(range(6, 1, 7, 7, 1, 8), "ef"),
    ],
  ),
);

Deno.test("Empty definition", () => {
  assertEquals(
    parseDefinition(""),
    right(mkDefinition(undefined, [], [], undefined, [])),
  );
});

Deno.test("Complete definition", () => {
  const input = 'extend "something";\n' +
    "\n" +
    "tokens LiteralCharacter = chr(39) !chr(39) chr(39);\n" +
    "LiteralInt = digit {digit};\n" +
    "comments\n" +
    '    "/*" to "*/" nested;\n' +
    '    "//" {!cr};' +
    "whitespace\n" +
    "    chr(0)-' ';\n" +
    "fragments\n" +
    "    digit = '0'-'9';\n" +
    "    alpha = 'a'-'z' + 'A'-'Z';";

  assertEquals(
    parseDefinition(input),
    right(mkDefinition(
      mkLiteralString(range(7, 1, 8, 17, 1, 18), '"something"'),
      [
        [
          mkIdentifierReference(range(28, 3, 8, 43, 3, 23), "LiteralCharacter"),
          mkSequenceExpr([
            mkChrExpr(range(51, 3, 31, 52, 3, 32), "39"),
            mkNotExpr(
              range(55, 3, 35, 61, 3, 41),
              mkChrExpr(range(60, 3, 40, 61, 3, 41), "39"),
            ),
            mkChrExpr(range(68, 3, 48, 69, 3, 49), "39"),
          ]),
        ],
        [
          mkIdentifierReference(range(73, 4, 1, 82, 4, 10), "LiteralInt"),
          mkSequenceExpr([
            mkIdentifierReference(range(86, 4, 14, 90, 4, 18), "digit"),
            mkManyExpr(
              range(92, 4, 20, 98, 4, 26),
              mkIdentifierReference(range(93, 4, 21, 97, 4, 25), "digit"),
            ),
          ]),
        ],
      ],
      [
        mkBlockComment(
          range(114, 6, 5, 132, 6, 23),
          mkLiteralString(range(114, 6, 5, 117, 6, 8), '"/*"'),
          mkLiteralString(range(122, 6, 13, 125, 6, 16), '"*/"'),
          true,
        ),
        mkLineComment(
          mkSequenceExpr(
            [
              mkLiteralString(range(139, 7, 5, 142, 7, 8), '"//"'),
              mkManyExpr(
                range(144, 7, 10, 148, 7, 14),
                mkNotExpr(
                  range(145, 7, 11, 147, 7, 13),
                  mkIdentifierReference(range(146, 7, 12, 147, 7, 13), "cr"),
                ),
              ),
            ],
          ),
        ),
      ],
      mkRangeExpr(
        mkChrExpr(mkCoordinate(169, 8, 9), "0"),
        mkLiteralCharacterExpr(range(172, 8, 12, 174, 8, 14), "' '"),
      ),
      [
        [
          mkIdentifierReference(range(191, 10, 5, 195, 10, 9), "digit"),
          mkRangeExpr(
            mkLiteralCharacterExpr(range(199, 10, 13, 201, 10, 15), "'0'"),
            mkLiteralCharacterExpr(range(203, 10, 17, 205, 10, 19), "'9'"),
          ),
        ],
        [
          mkIdentifierReference(range(212, 11, 5, 216, 11, 9), "alpha"),
          mkUnionExpr([
            mkRangeExpr(
              mkLiteralCharacterExpr(range(220, 11, 13, 222, 11, 15), "'a'"),
              mkLiteralCharacterExpr(range(224, 11, 17, 226, 11, 19), "'z'"),
            ),
            mkRangeExpr(
              mkLiteralCharacterExpr(range(230, 11, 23, 232, 11, 25), "'A'"),
              mkLiteralCharacterExpr(range(234, 11, 27, 236, 11, 29), "'Z'"),
            ),
          ]),
        ],
      ],
    )),
  );
});

function testExprEquals(input: string, cc: Expr): void {
  Deno.test(`expr - ${input}`, () => {
    assertEquals(
      parseExpr(input),
      cc,
    );
  });
}

export function mkDefinition(
  extend: LiteralString | undefined,
  tokens: Array<[IdentifierReference, Expr]>,
  comments: Array<Comment>,
  whitespace: Expr | undefined,
  fragments: Array<[IdentifierReference, Expr]>,
): Definition {
  return {
    tag: "Definition",
    extend,
    tokens,
    comments,
    whitespace,
    fragments,
  };
}

export function mkBlockComment(
  location: Location,
  open: Expr,
  close: Expr,
  nested: boolean,
): BlockComment {
  return { tag: "BlockComment", location, open, close, nested };
}

export function mkLineComment(pattern: Expr): LineComment {
  return { tag: "LineComment", pattern };
}

export function mkChrExpr(
  location: Location,
  value: string,
): ChrExpr {
  return { tag: "ChrExpr", location, value };
}

export function mkLiteralCharacterExpr(
  location: Location,
  value: string,
): LiteralCharacterExpr {
  return { tag: "LiteralCharacterExpr", location, value };
}

export function mkLiteralString(
  location: Location,
  value: string,
): LiteralString {
  return {
    tag: "LiteralString",
    location,
    value,
  };
}

export function mkParenExpr(location: Location, value: Expr): ParenExpr {
  return { tag: "ParenExpr", location, value };
}

export function mkManyExpr(location: Location, value: Expr): ManyExpr {
  return { tag: "ManyExpr", location, value };
}

export function mkOptionalExpr(
  location: Location,
  value: Expr,
): OptionalExpr {
  return { tag: "OptionalExpr", location, value };
}

export function mkIdentifierReference(
  location: Location,
  id: string,
): IdentifierReference {
  return { tag: "ID", location, id };
}

export function mkRangeExpr(
  from: Expr,
  to: Expr,
): RangeExpr {
  return {
    tag: "RangeExpr",
    location: combine(from.location, to.location),
    from,
    to,
  };
}

export function mkNotExpr(
  location: Location,
  value: Expr,
): NotExpr {
  return { tag: "NotExpr", location, value };
}

export function mkMinusExpr(
  source: Expr,
  extract: Expr,
): MinusExpr {
  return {
    tag: "MinusExpr",
    location: combine(source.location, extract.location),
    source,
    extract,
  };
}

export function mkUnionExpr(values: Array<Expr>): UnionExpr {
  return { tag: "UnionExpr", location: locationOf(values), values };
}

export function mkSequenceExpr(values: Array<Expr>): SequenceExpr {
  return { tag: "SequenceExpr", location: locationOf(values), values };
}

export function mkAlternativeExpr(values: Array<Expr>): AlternativeExpr {
  return { tag: "AlternativeExpr", location: locationOf(values), values };
}
