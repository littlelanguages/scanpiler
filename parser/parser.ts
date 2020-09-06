import { Scanner, TToken, Token, mkScanner } from "./scanner.ts";
import {
  IdentifierReference,
  Expr,
  Definition,
  LiteralString,
  Comment,
  locationOf,
} from "./ast.ts";
import { combine } from "./location.ts";
import { Either, right, left } from "../data/either.ts";
import { Errors } from "./errors.ts";

export function parseDefinition(input: string): Either<Errors, Definition> {
  try {
    return right(new Parser(mkScanner(input)).definition());
  } catch (e) {
    if (e instanceof SyntaxError) {
      return left(
        [{ tag: "StaticSyntaxError", found: e.found, expected: e.expected }],
      );
    } else {
      throw e;
    }
  }
}

export function parseExpr(input: string): Expr {
  return new Parser(mkScanner(input)).expr();
}

class Parser {
  private scanner: Scanner;

  constructor(scanner: Scanner) {
    this.scanner = scanner;
  }

  definition(): Definition {
    let extend: LiteralString | undefined = undefined;

    if (this.isToken(TToken.Extend)) {
      this.nextToken();
      const id = this.matchToken(TToken.LiteralString);
      this.matchToken(TToken.Semicolon);
      extend = { tag: "LiteralString", location: id[1], value: id[2] };
    }

    const tokens: Array<[IdentifierReference, Expr]> = [];
    if (this.isToken(TToken.Tokens)) {
      this.nextToken();

      while (this.isToken(TToken.Identifier)) {
        const id = this.nextToken();
        this.matchToken(TToken.Equal);
        const e = this.expr();
        this.matchToken(TToken.Semicolon);
        tokens.push([{ tag: "ID", location: id[1], id: id[2] }, e]);
      }
    }

    const comments: Array<Comment> = [];
    if (this.isToken(TToken.Comments)) {
      this.nextToken();

      while (this.isTokens(firstExpr)) {
        const e1 = this.expr();

        if (this.isToken(TToken.To)) {
          this.nextToken();
          const e2 = this.expr();
          let endLocation = e2.location;

          const nested = this.isToken(TToken.Nested);
          if (nested) {
            const token = this.nextToken();
            endLocation = token[1];
          }
          this.matchToken(TToken.Semicolon);

          comments.push(
            {
              tag: "BlockComment",
              location: combine(e1.location, endLocation),
              open: e1,
              close: e2,
              nested,
            },
          );
        } else {
          this.matchToken(TToken.Semicolon);

          comments.push({ tag: "LineComment", pattern: e1 });
        }
      }
    }

    let whitespace = undefined;
    if (this.isToken(TToken.Whitespace)) {
      this.nextToken();
      whitespace = this.expr();
      this.matchToken(TToken.Semicolon);
    }

    const fragments: Array<[IdentifierReference, Expr]> = [];
    if (this.isToken(TToken.Fragments)) {
      this.nextToken();

      while (this.isToken(TToken.Identifier)) {
        const id = this.nextToken();
        this.matchToken(TToken.Equal);
        const e = this.expr();
        this.matchToken(TToken.Semicolon);
        fragments.push([{ tag: "ID", location: id[1], id: id[2] }, e]);
      }
    }

    this.matchToken(TToken.EOS);

    return {
      tag: "Definition",
      extend,
      tokens,
      comments,
      whitespace,
      fragments,
    };
  }

  expr(): Expr {
    const value = this.sequenceExpr();

    if (this.isToken(TToken.Bar)) {
      const values = [value];

      while (this.isToken(TToken.Bar)) {
        this.nextToken();
        values.push(this.sequenceExpr());
      }

      return { tag: "AlternativeExpr", location: locationOf(values), values };
    } else {
      return value;
    }
  }

  private sequenceExpr(): Expr {
    const value = this.unionExpr();

    if (this.isTokens(firstUnionExpr)) {
      const values = [value];

      while (this.isTokens(firstUnionExpr)) {
        values.push(this.unionExpr());
      }

      return { tag: "SequenceExpr", location: locationOf(values), values };
    } else {
      return value;
    }
  }

  private unionExpr(): Expr {
    const value = this.minusExpr();

    if (this.isToken(TToken.Plus)) {
      const values = [value];

      while (this.isToken(TToken.Plus)) {
        this.nextToken();
        values.push(this.minusExpr());
      }
      return { tag: "UnionExpr", location: locationOf(values), values };
    } else {
      return value;
    }
  }

  private minusExpr(): Expr {
    let source = this.notExpr();

    while (this.isToken(TToken.Backslash)) {
      this.nextToken();
      const extract = this.notExpr();

      source = {
        tag: "MinusExpr",
        location: combine(source.location, extract.location),
        source,
        extract,
      };
    }

    return source;
  }

  private notExpr(): Expr {
    if (this.isToken(TToken.Bang)) {
      const bang = this.nextToken();
      const value = this.rangeExpr();
      const location = combine(bang[1], value.location);

      return { tag: "NotExpr", location, value };
    } else if (this.isTokens(firstRangeExpr)) {
      return this.rangeExpr();
    } else {
      throw new SyntaxError(this.scanner.current(), firstNotExpr);
    }
  }

  private rangeExpr(): Expr {
    if (this.isTokens(firstFactor)) {
      const from = this.factor();

      if (this.isToken(TToken.Minus)) {
        this.nextToken();
        const to = this.factor();
        const location = combine(from.location, to.location);

        return { tag: "RangeExpr", location, from, to };
      } else {
        return from;
      }
    } else {
      throw new SyntaxError(this.scanner.current(), firstFactor);
    }
  }

  private factor(): Expr {
    if (this.isToken(TToken.Chr)) {
      this.scanner.next();
      this.matchToken(TToken.LParen);
      const token = this.matchToken(TToken.LiteralInt);
      this.matchToken(TToken.RParen);

      const location = token[1];
      const value = token[2];

      return { tag: "ChrExpr", location, value };
    } else if (this.isToken(TToken.LiteralCharacter)) {
      const token = this.nextToken();

      const location = token[1];
      const value = token[2];

      return { tag: "LiteralCharacterExpr", location, value };
    } else if (this.isToken(TToken.LiteralString)) {
      const token = this.nextToken();
      return { tag: "LiteralString", location: token[1], value: token[2] };
    } else if (this.isToken(TToken.Identifier)) {
      const token = this.nextToken();
      return { tag: "ID", location: token[1], id: token[2] };
    } else if (this.isToken(TToken.LParen)) {
      const lparen = this.nextToken();
      const value = this.expr();
      const rparen = this.matchToken(TToken.RParen);
      const location = combine(lparen[1], rparen[1]);

      return { tag: "ParenExpr", location, value };
    } else if (this.isToken(TToken.LCurly)) {
      const lparen = this.nextToken();
      const value = this.expr();
      const rparen = this.matchToken(TToken.RCurly);
      const location = combine(lparen[1], rparen[1]);

      return { tag: "ManyExpr", location, value };
    } else if (this.isToken(TToken.LBracket)) {
      const lparen = this.nextToken();
      const value = this.expr();
      const rparen = this.matchToken(TToken.RBracket);
      const location = combine(lparen[1], rparen[1]);

      return { tag: "OptionalExpr", location, value };
    } else {
      throw new SyntaxError(this.scanner.current(), firstFactor);
    }
  }

  private matchToken(ttoken: TToken): Token {
    if (this.isToken(ttoken)) {
      return this.nextToken();
    } else {
      throw new SyntaxError(this.scanner.current(), [ttoken]);
    }
  }

  private isToken(ttoken: TToken): boolean {
    return this.currentToken() == ttoken;
  }

  private isTokens(ttokens: Array<TToken>): boolean {
    return ttokens.includes(this.currentToken());
  }

  private currentToken(): TToken {
    return this.scanner.current()[0];
  }

  private nextToken(): Token {
    const result = this.scanner.current();
    this.scanner.next();
    return result;
  }
}

class SyntaxError {
  found: Token;
  expected: Array<TToken>;

  constructor(found: Token, expected: Array<TToken>) {
    this.found = found;
    this.expected = expected;
  }
}

const firstFactor = [
  TToken.Chr,
  TToken.LiteralCharacter,
  TToken.LiteralString,
  TToken.LParen,
  TToken.LCurly,
  TToken.LBracket,
  TToken.Identifier,
];
const firstRangeExpr = firstFactor;
const firstNotExpr = [TToken.Bang, ...firstRangeExpr];
const firstMinusExpr = firstNotExpr;
const firstUnionExpr = firstMinusExpr;
const firstExpr = firstUnionExpr;
