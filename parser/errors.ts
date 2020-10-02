import { Location, toString } from "./location.ts";
import * as PP from "../text/prettyprint.ts";
import { SyntaxError } from "./scanpiler-parser.ts";
import { TToken } from "./scanpiler-scanner.ts";

export type Errors = Array<ErrorItem>;

export type ErrorItem =
  | SyntaxError
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

export function asDoc(
  errorItem: ErrorItem,
  fileName: string | undefined = undefined,
): PP.Doc {
  switch (errorItem.tag) {
    case "SyntaxError":
      return PP.hcat([
        "Unexpected token ",
        ttokenAsString(errorItem.found[0]),
        ". Expected ",
        PP.join(errorItem.expected.map(ttokenAsString), ", ", " or "),
        errorLocation(errorItem.found[1], fileName),
      ]);

    case "ChrOutOfRangeError":
      return PP.hcat([
        "chr argument of ",
        PP.number(errorItem.code),
        " must be in the range 0..255",
        errorLocation(errorItem.location, fileName),
      ]);

    case "CommentNotCharacterClassError":
      return PP.hcat([
        "whitespace must be a character class rather than a regular expression",
        errorLocation(errorItem.location, fileName),
      ]);

    case "DuplicateFragmentNameError":
      return PP.hcat([
        "Fragment ",
        errorItem.name,
        " is already defined",
        errorLocation(errorItem.location, fileName),
      ]);

    case "DuplicateTokenNameError":
      return PP.hcat([
        "Token ",
        errorItem.name,
        " is already defined",
        errorLocation(errorItem.location, fileName),
      ]);

    case "FeatureNotImplementedError":
      return PP.hcat([
        'Feature "',
        errorItem.nature,
        '" it not yet implemented',
        errorLocation(errorItem.location, fileName),
      ]);

    case "MinusOperandNotCharacterClassError":
      return PP.hcat([
        "Minus operator applies only to character class expressions rather than regular expressions",
        errorLocation(errorItem.location, fileName),
      ]);

    case "NotExpectsCharacterClassError":
      return PP.hcat([
        "Not operator applies only to a character class expression rather than to a regular expression",
        errorLocation(errorItem.location, fileName),
      ]);

    case "RangeOperandNotCharactersError":
      return PP.hcat([
        "Range operator applies only to character class expressions rather than regular expressions",
        errorLocation(errorItem.location, fileName),
      ]);

    case "UnionOperandNotCharacterClassError":
      return PP.hcat([
        "Union operator applies only to character class expressions rather than regular expressions",
        errorLocation(errorItem.location, fileName),
      ]);

    case "UnknownFragmentIdentifierError":
      return PP.hcat([
        "Unknown fragment ",
        errorItem.name,
        errorLocation(errorItem.location, fileName),
      ]);
  }
}

export function ttokenAsString(ttoken: TToken): string {
  switch (ttoken) {
    case TToken.Chr:
      return "chr";
    case TToken.Comments:
      return "comments";
    case TToken.Extend:
      return "extend";
    case TToken.Fragments:
      return "fragments";
    case TToken.Nested:
      return "nested";
    case TToken.To:
      return "to";
    case TToken.Tokens:
      return "tokens";
    case TToken.Whitespace:
      return "whitespace";
    case TToken.Backslash:
      return '"\\"';
    case TToken.Bang:
      return '"!"';
    case TToken.Bar:
      return '"|"';
    case TToken.Equal:
      return '"="';
    case TToken.LBracket:
      return '"["';
    case TToken.LCurly:
      return '"{"';
    case TToken.LParen:
      return '"("';
    case TToken.Dash:
      return '"-"';
    case TToken.Plus:
      return '"+"';
    case TToken.RBracket:
      return '"]"';
    case TToken.RCurly:
      return '"}"';
    case TToken.RParen:
      return '")"';
    case TToken.Semicolon:
      return '";"';
    case TToken.Identifier:
      return "identifier";
    case TToken.LiteralCharacter:
      return "literal character";
    case TToken.LiteralInt:
      return "literal integer";
    case TToken.LiteralString:
      return "literal string";
    case TToken.EOS:
      return "end of content";
    case TToken.ERROR:
      return "unknown token";
  }
}

export function errorLocation(
  location: Location,
  fileName: string | undefined,
): PP.Doc {
  return PP.hcat([" at ", toString(location, fileName)]);
}
