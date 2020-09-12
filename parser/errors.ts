import { Token, TToken } from "./scanner.ts";
import { Location } from "./location.ts";

export type Errors = Array<ErrorItem>;

export type ErrorItem =
  | StaticSyntaxError
  | ChrOutOfRangeError
  | CommentNotCharacterClassError
  | DuplicateFragmentNameError
  | DuplicateTokenNameError
  | FeatureNotImplementedError
  | MinusOperandNotCharacterClassError
  | NotExpectsCharacterClassError
  | RangeOperandNotCharactersError
  | UnionOperandNotCharacterClassError
  | UnknownFragmentIdentifierError;

export type StaticSyntaxError = {
  tag: "StaticSyntaxError";
  found: Token;
  expected: Array<TToken>;
};

export type ChrOutOfRangeError = {
  tag: "ChrOutOfRangeError";
  location: Location;
  code: number;
};

export type CommentNotCharacterClassError = {
  tag: "CommentNotCharacterClassError";
  location: Location;
};

export type DuplicateFragmentNameError = {
  tag: "DuplicateFragmentNameError";
  location: Location;
  name: string;
};

export type DuplicateTokenNameError = {
  tag: "DuplicateTokenNameError";
  location: Location;
  name: string;
};

export type FeatureNotImplementedError = {
  tag: "FeatureNotImplementedError";
  location: Location;
  nature: string;
};

export type MinusOperandNotCharacterClassError = {
  tag: "MinusOperandNotCharacterClassError";
  location: Location;
};

export type NotExpectsCharacterClassError = {
  tag: "NotExpectsCharacterClassError";
  location: Location;
};

export type RangeOperandNotCharactersError = {
  tag: "RangeOperandNotCharactersError";
  location: Location;
};

export type UnionOperandNotCharacterClassError = {
  tag: "UnionOperandNotCharacterClassError";
  location: Location;
};

export type UnknownFragmentIdentifierError = {
  tag: "UnknownFragmentIdentifierError";
  location: Location;
  name: string;
};
