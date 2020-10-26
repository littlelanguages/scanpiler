import { Comment, Definition, Expr } from "./ast.ts";
import { Either } from "../data/either.ts";
import { Errors } from "./errors.ts";
import * as Parser from "./scanpiler-parser.ts";
import { mkScanner, Token } from "./scanpiler-scanner.ts";
import { combine, Location } from "./location.ts";

export const parseDefinition = (input: string): Either<Errors, Definition> =>
  Parser.parseDefinition(input, visitor).mapLeft((e) => [e]);

export const parseExpr = (input: string): Expr =>
  Parser.mkParser(mkScanner(input), visitor).expr();

const visitor: Parser.Visitor<
  Definition,
  Comment,
  Expr,
  Expr,
  Expr,
  Expr,
  Expr,
  Expr,
  Expr
> = {
  visitDefinition: (
    a1: [Token, Token, Token] | undefined,
    a2: [Token, Array<[Token, Token, Expr, Token]>] | undefined,
    a3: [Token, Array<[Comment, Token]>] | undefined,
    a4: [Token, Expr, Token] | undefined,
    a5: [Token, Array<[Token, Token, Expr, Token]>] | undefined,
  ): Definition => ({
    tag: "Definition",
    extend: a1 === undefined
      ? undefined
      : { tag: "LiteralString", location: a1[1][1], value: a1[1][2] },
    tokens: a2 === undefined ? []
    : a2[1].map((a) => [{ tag: "ID", location: a[0][1], id: a[0][2] }, a[2]]),
    comments: a3 === undefined ? [] : a3[1].map((a) => a[0]),
    whitespace: a4 === undefined ? undefined : a4[1],
    fragments: a5 === undefined ? []
    : a5[1].map((a) => [{ tag: "ID", location: a[0][1], id: a[0][2] }, a[2]]),
  }),

  visitComment: (
    a1: Expr,
    a2: [Token, Expr, Token | undefined] | undefined,
  ): Comment =>
    a2 === undefined ? { tag: "LineComment", pattern: a1 } : {
      tag: "BlockComment",
      location: combine(
        a1.location,
        a2[2] === undefined ? a2[1].location : a2[2][1],
      ),
      open: a1,
      close: a2[1],
      nested: a2[2] !== undefined,
    },

  visitExpr: (a1: Expr, a2: Array<[Token, Expr]>): Expr =>
    a2.length === 0 ? a1 : {
      tag: "AlternativeExpr",
      location: locationOf([a1, ...a2.map((v) => v[1])]),
      values: [a1, ...a2.map((v) => v[1])],
    },

  visitSequenceExpr: (a1: Expr, a2: Array<Expr>): Expr =>
    a2.length === 0 ? a1 : {
      tag: "SequenceExpr",
      location: locationOf([a1, ...a2]),
      values: [a1, ...a2],
    },

  visitUnionExpr: (a1: Expr, a2: Array<[Token, Expr]>): Expr =>
    a2.length === 0 ? a1 : {
      tag: "UnionExpr",
      location: locationOf([a1, ...a2.map((v) => v[1])]),
      values: [a1, ...a2.map((v) => v[1])],
    },

  visitMinusExpr: (a1: Expr, a2: Array<[Token, Expr]>): Expr =>
    a2.reduce(
      (a, b) => ({
        tag: "MinusExpr",
        location: combine(a.location, b[1].location),
        source: a,
        extract: b[1],
      }),
      a1,
    ),

  visitNotExpr: (a1: Token | undefined, a2: Expr): Expr =>
    a1 === undefined
      ? a2
      : { tag: "NotExpr", location: combine(a1[1], a2.location), value: a2 },

  visitRangeExpr: (a1: Expr, a2: [Token, Expr] | undefined): Expr =>
    (a2 === undefined) ? a1 : {
      tag: "RangeExpr",
      location: combine(a1.location, a2[1].location),
      from: a1,
      to: a2[1],
    },

  visitFactor1: (a1: Token, a2: Token, a3: Token, a4: Token): Expr => ({
    tag: "ChrExpr",
    location: a3[1],
    value: a3[2],
  }),
  visitFactor2: (a: Token): Expr => ({
    tag: "LiteralCharacterExpr",
    location: a[1],
    value: a[2],
  }),
  visitFactor3: (a: Token): Expr => ({
    tag: "LiteralString",
    location: a[1],
    value: a[2],
  }),
  visitFactor4: (a1: Token, a2: Expr, a3: Token): Expr => ({
    tag: "ParenExpr",
    location: combine(a1[1], a3[1]),
    value: a2,
  }),
  visitFactor5: (a1: Token, a2: Expr, a3: Token): Expr => ({
    tag: "ManyExpr",
    location: combine(a1[1], a3[1]),
    value: a2,
  }),
  visitFactor6: (a1: Token, a2: Expr, a3: Token): Expr => ({
    tag: "OptionalExpr",
    location: combine(a1[1], a3[1]),
    value: a2,
  }),
  visitFactor7: (a: Token): Expr => ({ tag: "ID", location: a[1], id: a[2] }),
};

export const locationOf = (value: Array<Expr>): Location =>
  combine(value[0].location, last(value).location);

const last = <T>(vs: Array<T>): T => vs[vs.length - 1];
