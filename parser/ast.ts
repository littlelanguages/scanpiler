import { Location, combine } from "./location.ts";

export type Definition = {
  tag: "Definition";
  extend: LiteralString | undefined;
  tokens: Array<[IdentifierReference, Expr]>;
  comments: Array<Comment>;
  whitespace: Expr | undefined;
  fragments: Array<[IdentifierReference, Expr]>;
};

export type Comment =
  | BlockComment
  | LineComment;

export type BlockComment = {
  tag: "BlockComment";
  location: Location;
  open: Expr;
  close: Expr;
  nested: boolean;
};

export type LineComment = {
  tag: "LineComment";
  pattern: Expr;
};

export type Expr =
  | ChrExpr
  | LiteralCharacterExpr
  | LiteralString
  | ParenExpr
  | ManyExpr
  | OptionalExpr
  | IdentifierReference
  | RangeExpr
  | NotExpr
  | MinusExpr
  | UnionExpr
  | SequenceExpr
  | AlternativeExpr;

export type ChrExpr = {
  tag: "ChrExpr";
  location: Location;
  value: string;
};

export type LiteralCharacterExpr = {
  tag: "LiteralCharacterExpr";
  location: Location;
  value: string;
};

export type LiteralString = {
  tag: "LiteralString";
  location: Location;
  value: string;
};

export type ParenExpr = {
  tag: "ParenExpr";
  location: Location;
  value: Expr;
};

export type ManyExpr = {
  tag: "ManyExpr";
  location: Location;
  value: Expr;
};

export type OptionalExpr = {
  tag: "OptionalExpr";
  location: Location;
  value: Expr;
};

export type IdentifierReference = {
  tag: "ID";
  location: Location;
  id: string;
};

export type RangeExpr = {
  tag: "RangeExpr";
  location: Location;
  from: Expr;
  to: Expr;
};

export type NotExpr = {
  tag: "NotExpr";
  location: Location;
  value: Expr;
};

export type MinusExpr = {
  tag: "MinusExpr";
  location: Location;
  source: Expr;
  extract: Expr;
};

export type UnionExpr = {
  tag: "UnionExpr";
  location: Location;
  values: Array<Expr>;
};

export type SequenceExpr = {
  tag: "SequenceExpr";
  location: Location;
  values: Array<Expr>;
};

export type AlternativeExpr = {
  tag: "AlternativeExpr";
  location: Location;
  values: Array<Expr>;
};

export function locationOf(value: Array<Expr>): Location {
  return combine(value[0].location, last(value).location);
}

function last<T>(vs: Array<T>): T {
  return vs[vs.length - 1];
}
