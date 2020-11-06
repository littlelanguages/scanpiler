import {
  Either,
  left,
  right,
} from "https://raw.githubusercontent.com/littlelanguages/deno-lib-data-either/0.1.1/mod.ts";
import { mkScanner, Scanner, Token, TToken } from "./scanpiler-scanner.ts";

export interface Visitor<
  T_Definition,
  T_Comment,
  T_Expr,
  T_SequenceExpr,
  T_UnionExpr,
  T_MinusExpr,
  T_NotExpr,
  T_RangeExpr,
  T_Factor,
> {
  visitDefinition(
    a1: [Token, Token, Token] | undefined,
    a2: [Token, Array<[Token, Token, T_Expr, Token]>] | undefined,
    a3: [Token, Array<[T_Comment, Token]>] | undefined,
    a4: [Token, T_Expr, Token] | undefined,
    a5: [Token, Array<[Token, Token, T_Expr, Token]>] | undefined,
  ): T_Definition;
  visitComment(
    a1: T_Expr,
    a2: [Token, T_Expr, Token | undefined] | undefined,
  ): T_Comment;
  visitExpr(a1: T_SequenceExpr, a2: Array<[Token, T_SequenceExpr]>): T_Expr;
  visitSequenceExpr(a1: T_UnionExpr, a2: Array<T_UnionExpr>): T_SequenceExpr;
  visitUnionExpr(a1: T_MinusExpr, a2: Array<[Token, T_MinusExpr]>): T_UnionExpr;
  visitMinusExpr(a1: T_NotExpr, a2: Array<[Token, T_NotExpr]>): T_MinusExpr;
  visitNotExpr(a1: Token | undefined, a2: T_RangeExpr): T_NotExpr;
  visitRangeExpr(a1: T_Factor, a2: [Token, T_Factor] | undefined): T_RangeExpr;
  visitFactor1(a1: Token, a2: Token, a3: Token, a4: Token): T_Factor;
  visitFactor2(a: Token): T_Factor;
  visitFactor3(a: Token): T_Factor;
  visitFactor4(a1: Token, a2: T_Expr, a3: Token): T_Factor;
  visitFactor5(a1: Token, a2: T_Expr, a3: Token): T_Factor;
  visitFactor6(a1: Token, a2: T_Expr, a3: Token): T_Factor;
  visitFactor7(a: Token): T_Factor;
}

export const parseDefinition = <
  T_Definition,
  T_Comment,
  T_Expr,
  T_SequenceExpr,
  T_UnionExpr,
  T_MinusExpr,
  T_NotExpr,
  T_RangeExpr,
  T_Factor,
>(
  input: string,
  visitor: Visitor<
    T_Definition,
    T_Comment,
    T_Expr,
    T_SequenceExpr,
    T_UnionExpr,
    T_MinusExpr,
    T_NotExpr,
    T_RangeExpr,
    T_Factor
  >,
): Either<SyntaxError, T_Definition> => {
  try {
    return right(mkParser(mkScanner(input), visitor).definition());
  } catch (e) {
    return left(e);
  }
};

export const mkParser = <
  T_Definition,
  T_Comment,
  T_Expr,
  T_SequenceExpr,
  T_UnionExpr,
  T_MinusExpr,
  T_NotExpr,
  T_RangeExpr,
  T_Factor,
>(
  scanner: Scanner,
  visitor: Visitor<
    T_Definition,
    T_Comment,
    T_Expr,
    T_SequenceExpr,
    T_UnionExpr,
    T_MinusExpr,
    T_NotExpr,
    T_RangeExpr,
    T_Factor
  >,
) => {
  const matchToken = (ttoken: TToken): Token => {
    if (isToken(ttoken)) {
      return nextToken();
    } else {
      throw {
        tag: "SyntaxError",
        found: scanner.current(),
        expected: [ttoken],
      };
    }
  };

  const isToken = (ttoken: TToken): boolean => currentToken() === ttoken;

  const isTokens = (ttokens: Array<TToken>): boolean =>
    ttokens.includes(currentToken());

  const currentToken = (): TToken => scanner.current()[0];

  const nextToken = (): Token => {
    const result = scanner.current();
    scanner.next();
    return result;
  };

  return {
    definition: function (): T_Definition {
      let a1: [Token, Token, Token] | undefined = undefined;

      if (isToken(TToken.Extend)) {
        const a1t1: Token = matchToken(TToken.Extend);
        const a1t2: Token = matchToken(TToken.LiteralString);
        const a1t3: Token = matchToken(TToken.Semicolon);
        const a1t: [Token, Token, Token] = [a1t1, a1t2, a1t3];
        a1 = a1t;
      }
      let a2: [Token, Array<[Token, Token, T_Expr, Token]>] | undefined =
        undefined;

      if (isToken(TToken.Tokens)) {
        const a2t1: Token = matchToken(TToken.Tokens);
        const a2t2: Array<[Token, Token, T_Expr, Token]> = [];

        while (isToken(TToken.Identifier)) {
          const a2t2t1: Token = matchToken(TToken.Identifier);
          const a2t2t2: Token = matchToken(TToken.Equal);
          const a2t2t3: T_Expr = this.expr();
          const a2t2t4: Token = matchToken(TToken.Semicolon);
          const a2t2t: [Token, Token, T_Expr, Token] = [
            a2t2t1,
            a2t2t2,
            a2t2t3,
            a2t2t4,
          ];
          a2t2.push(a2t2t);
        }
        const a2t: [Token, Array<[Token, Token, T_Expr, Token]>] = [a2t1, a2t2];
        a2 = a2t;
      }
      let a3: [Token, Array<[T_Comment, Token]>] | undefined = undefined;

      if (isToken(TToken.Comments)) {
        const a3t1: Token = matchToken(TToken.Comments);
        const a3t2: Array<[T_Comment, Token]> = [];

        while (
          isTokens(
            [
              TToken.Bang,
              TToken.Chr,
              TToken.LiteralCharacter,
              TToken.LiteralString,
              TToken.LParen,
              TToken.LCurly,
              TToken.LBracket,
              TToken.Identifier,
            ],
          )
        ) {
          const a3t2t1: T_Comment = this.comment();
          const a3t2t2: Token = matchToken(TToken.Semicolon);
          const a3t2t: [T_Comment, Token] = [a3t2t1, a3t2t2];
          a3t2.push(a3t2t);
        }
        const a3t: [Token, Array<[T_Comment, Token]>] = [a3t1, a3t2];
        a3 = a3t;
      }
      let a4: [Token, T_Expr, Token] | undefined = undefined;

      if (isToken(TToken.Whitespace)) {
        const a4t1: Token = matchToken(TToken.Whitespace);
        const a4t2: T_Expr = this.expr();
        const a4t3: Token = matchToken(TToken.Semicolon);
        const a4t: [Token, T_Expr, Token] = [a4t1, a4t2, a4t3];
        a4 = a4t;
      }
      let a5: [Token, Array<[Token, Token, T_Expr, Token]>] | undefined =
        undefined;

      if (isToken(TToken.Fragments)) {
        const a5t1: Token = matchToken(TToken.Fragments);
        const a5t2: Array<[Token, Token, T_Expr, Token]> = [];

        while (isToken(TToken.Identifier)) {
          const a5t2t1: Token = matchToken(TToken.Identifier);
          const a5t2t2: Token = matchToken(TToken.Equal);
          const a5t2t3: T_Expr = this.expr();
          const a5t2t4: Token = matchToken(TToken.Semicolon);
          const a5t2t: [Token, Token, T_Expr, Token] = [
            a5t2t1,
            a5t2t2,
            a5t2t3,
            a5t2t4,
          ];
          a5t2.push(a5t2t);
        }
        const a5t: [Token, Array<[Token, Token, T_Expr, Token]>] = [a5t1, a5t2];
        a5 = a5t;
      }
      return visitor.visitDefinition(a1, a2, a3, a4, a5);
    },
    comment: function (): T_Comment {
      const a1: T_Expr = this.expr();
      let a2: [Token, T_Expr, Token | undefined] | undefined = undefined;

      if (isToken(TToken.To)) {
        const a2t1: Token = matchToken(TToken.To);
        const a2t2: T_Expr = this.expr();
        let a2t3: Token | undefined = undefined;

        if (isToken(TToken.Nested)) {
          const a2t3t: Token = matchToken(TToken.Nested);
          a2t3 = a2t3t;
        }
        const a2t: [Token, T_Expr, Token | undefined] = [a2t1, a2t2, a2t3];
        a2 = a2t;
      }
      return visitor.visitComment(a1, a2);
    },
    expr: function (): T_Expr {
      const a1: T_SequenceExpr = this.sequenceExpr();
      const a2: Array<[Token, T_SequenceExpr]> = [];

      while (isToken(TToken.Bar)) {
        const a2t1: Token = matchToken(TToken.Bar);
        const a2t2: T_SequenceExpr = this.sequenceExpr();
        const a2t: [Token, T_SequenceExpr] = [a2t1, a2t2];
        a2.push(a2t);
      }
      return visitor.visitExpr(a1, a2);
    },
    sequenceExpr: function (): T_SequenceExpr {
      const a1: T_UnionExpr = this.unionExpr();
      const a2: Array<T_UnionExpr> = [];

      while (
        isTokens(
          [
            TToken.Bang,
            TToken.Chr,
            TToken.LiteralCharacter,
            TToken.LiteralString,
            TToken.LParen,
            TToken.LCurly,
            TToken.LBracket,
            TToken.Identifier,
          ],
        )
      ) {
        const a2t: T_UnionExpr = this.unionExpr();
        a2.push(a2t);
      }
      return visitor.visitSequenceExpr(a1, a2);
    },
    unionExpr: function (): T_UnionExpr {
      const a1: T_MinusExpr = this.minusExpr();
      const a2: Array<[Token, T_MinusExpr]> = [];

      while (isToken(TToken.Plus)) {
        const a2t1: Token = matchToken(TToken.Plus);
        const a2t2: T_MinusExpr = this.minusExpr();
        const a2t: [Token, T_MinusExpr] = [a2t1, a2t2];
        a2.push(a2t);
      }
      return visitor.visitUnionExpr(a1, a2);
    },
    minusExpr: function (): T_MinusExpr {
      const a1: T_NotExpr = this.notExpr();
      const a2: Array<[Token, T_NotExpr]> = [];

      while (isToken(TToken.Backslash)) {
        const a2t1: Token = matchToken(TToken.Backslash);
        const a2t2: T_NotExpr = this.notExpr();
        const a2t: [Token, T_NotExpr] = [a2t1, a2t2];
        a2.push(a2t);
      }
      return visitor.visitMinusExpr(a1, a2);
    },
    notExpr: function (): T_NotExpr {
      let a1: Token | undefined = undefined;

      if (isToken(TToken.Bang)) {
        const a1t: Token = matchToken(TToken.Bang);
        a1 = a1t;
      }
      const a2: T_RangeExpr = this.rangeExpr();
      return visitor.visitNotExpr(a1, a2);
    },
    rangeExpr: function (): T_RangeExpr {
      const a1: T_Factor = this.factor();
      let a2: [Token, T_Factor] | undefined = undefined;

      if (isToken(TToken.Dash)) {
        const a2t1: Token = matchToken(TToken.Dash);
        const a2t2: T_Factor = this.factor();
        const a2t: [Token, T_Factor] = [a2t1, a2t2];
        a2 = a2t;
      }
      return visitor.visitRangeExpr(a1, a2);
    },
    factor: function (): T_Factor {
      if (isToken(TToken.Chr)) {
        const a1: Token = matchToken(TToken.Chr);
        const a2: Token = matchToken(TToken.LParen);
        const a3: Token = matchToken(TToken.LiteralInt);
        const a4: Token = matchToken(TToken.RParen);
        return visitor.visitFactor1(a1, a2, a3, a4);
      } else if (isToken(TToken.LiteralCharacter)) {
        return visitor.visitFactor2(matchToken(TToken.LiteralCharacter));
      } else if (isToken(TToken.LiteralString)) {
        return visitor.visitFactor3(matchToken(TToken.LiteralString));
      } else if (isToken(TToken.LParen)) {
        const a1: Token = matchToken(TToken.LParen);
        const a2: T_Expr = this.expr();
        const a3: Token = matchToken(TToken.RParen);
        return visitor.visitFactor4(a1, a2, a3);
      } else if (isToken(TToken.LCurly)) {
        const a1: Token = matchToken(TToken.LCurly);
        const a2: T_Expr = this.expr();
        const a3: Token = matchToken(TToken.RCurly);
        return visitor.visitFactor5(a1, a2, a3);
      } else if (isToken(TToken.LBracket)) {
        const a1: Token = matchToken(TToken.LBracket);
        const a2: T_Expr = this.expr();
        const a3: Token = matchToken(TToken.RBracket);
        return visitor.visitFactor6(a1, a2, a3);
      } else if (isToken(TToken.Identifier)) {
        return visitor.visitFactor7(matchToken(TToken.Identifier));
      } else {
        throw {
          tag: "SyntaxError",
          found: scanner.current(),
          expected: [
            TToken.Chr,
            TToken.LiteralCharacter,
            TToken.LiteralString,
            TToken.LParen,
            TToken.LCurly,
            TToken.LBracket,
            TToken.Identifier,
          ],
        };
      }
    },
  };
};

export type SyntaxError = {
  tag: "SyntaxError";
  found: Token;
  expected: Array<TToken>;
};
