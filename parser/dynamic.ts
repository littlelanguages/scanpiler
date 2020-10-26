import * as AST from "./ast.ts";
import { Either, left, right } from "../data/either.ts";
import { Errors } from "./errors.ts";
import {
  AlternativeRegEx,
  BlockComment,
  CharacterClassRegEx,
  Comment,
  Definition,
  LineComment,
  LiteralStringRegEx,
  ManyRegEx,
  OptionalRegEx,
  RegEx,
  SequenceRegEx,
} from "./../la/definition.ts";
import { parseDefinition } from "./parser.ts";
import {
  emptySet,
  first,
  isSingleton,
  minus,
  rangeSet,
  setOf,
  union,
} from "../data/set.ts";

export function translate(input: string): Either<Errors, Definition> {
  return parseDefinition(input).andThen(translateDefinition);
}

function translateDefinition(ast: AST.Definition): Either<Errors, Definition> {
  const d = new Definition();
  const errors = new Translate(ast, d).process();

  return (errors.length == 0) ? right(d) : left(errors);
}

class Translate {
  private ast: AST.Definition;
  private d: Definition;
  private errors: Errors = [];

  constructor(ast: AST.Definition, d: Definition) {
    this.ast = ast;
    this.d = d;
  }

  process(): Errors {
    if (this.ast.extend != undefined) {
      this.errors.push({
        tag: "FeatureNotImplementedError",
        location: this.ast.extend.location,
        nature: "Extending a lexical definition",
      });
    }

    this.translateFragments();
    this.translateTokens();
    this.translateComments();
    this.translateWhitespace();

    return this.errors;
  }

  translateTokens() {
    this.ast.tokens.forEach(([n, p]) => {
      const pattern = this.translateExprAsRegEx(p);

      if (this.d.hasToken(n.id)) {
        this.errors.push({
          tag: "DuplicateTokenNameError",
          location: n.location,
          name: n.id,
        });
      } else if (pattern != undefined) {
        this.d.addToken(n.id, pattern);
      }
    });
  }

  translateComments() {
    this.ast.comments.forEach((comment) => {
      const c = this.translateComment(comment);
      if (c != undefined) {
        this.d.addComment(c);
      }
    });
  }

  translateComment(comment: AST.Comment): Comment | undefined {
    if (comment.tag == "LineComment") {
      const e = this.translateExprAsRegEx(comment.pattern);

      return (e == undefined) ? undefined : new LineComment(e);
    } else {
      const open = this.translateExprAsRegEx(comment.open);
      const close = this.translateExprAsRegEx(comment.close);

      return (open == undefined || close == undefined)
        ? undefined
        : new BlockComment(open, close, comment.nested);
      throw "TODO";
    }
  }

  translateFragments() {
    this.ast.fragments.forEach((fragment) => {
      if (this.d.hasFragment(fragment[0].id)) {
        this.errors.push({
          tag: "DuplicateFragmentNameError",
          location: fragment[0].location,
          name: fragment[0].id,
        });
      } else {
        const f = this.translateExpr(fragment[1]);

        if (f != undefined) {
          this.d.addFragment(fragment[0].id, f);
        }
      }
    });
  }

  translateExprAsRegEx(e: AST.Expr): RegEx | undefined {
    const r = this.translateExpr(e);

    if (r == undefined) {
      return undefined;
    } else if (r instanceof Set) {
      return new CharacterClassRegEx(r);
    } else {
      return r;
    }
  }

  translateExpr(e: AST.Expr): RegEx | Set<number> | undefined {
    switch (e.tag) {
      case "ChrExpr":
        return this.translateChrExpr(e);
      case "LiteralCharacterExpr":
        return this.translateLiteralCharacterExpr(e);
      case "LiteralString":
        return this.translateLiteralString(e);
      case "ParenExpr":
        return this.translateParenExpr(e);
      case "ManyExpr":
        return this.translateManyExpr(e);
      case "OptionalExpr":
        return this.translateOptionalExpr(e);
      case "ID":
        return this.translateIdentifierReferenceExpr(e);
      case "RangeExpr":
        return this.translateRangeExpr(e);
      case "NotExpr":
        return this.translateNotExpr(e);
      case "MinusExpr":
        return this.translateMinusExpr(e);
      case "UnionExpr":
        return this.translateUnionExpr(e);
      case "SequenceExpr":
        return this.translateSequenceExpr(e);
      case "AlternativeExpr":
        return this.translateAlternativeExpr(e);
      default:
        return undefined;
    }
  }

  translateChrExpr(e: AST.ChrExpr): Set<number> | undefined {
    const code = parseInt(e.value);

    if (code < -1 || code > 255) {
      this.errors.push({
        tag: "ChrOutOfRangeError",
        location: e.location,
        code: code,
      });
      return undefined;
    } else {
      return setOf(code);
    }
  }

  translateLiteralCharacterExpr(e: AST.LiteralCharacterExpr): Set<number> {
    return setOf(e.value.charCodeAt(1));
  }

  translateLiteralString(e: AST.LiteralString): RegEx {
    return new LiteralStringRegEx(e.value.slice(1, e.value.length - 1));
  }

  translateParenExpr(e: AST.ParenExpr): RegEx | Set<number> | undefined {
    return this.translateExpr(e.value);
  }

  translateManyExpr(e: AST.ManyExpr): RegEx | undefined {
    const pattern = this.translateExprAsRegEx(e.value);

    return (pattern == undefined) ? undefined : new ManyRegEx(pattern);
  }

  translateOptionalExpr(e: AST.OptionalExpr): RegEx | undefined {
    const pattern = this.translateExprAsRegEx(e.value);

    return (pattern == undefined) ? undefined : new OptionalRegEx(pattern);
  }

  translateIdentifierReferenceExpr(
    e: AST.IdentifierReference,
  ): RegEx | Set<number> | undefined {
    const pattern = this.d.fragment(e.id);

    if (pattern == undefined) {
      this.errors.push({
        tag: "UnknownFragmentIdentifierError",
        location: e.location,
        name: e.id,
      });
      return undefined;
    } else {
      return pattern;
    }
  }

  translateRangeExpr(e: AST.RangeExpr): Set<number> | undefined {
    const from = this.translateExpr(e.from);
    const to = this.translateExpr(e.to);
    let errors = false;

    if (from == undefined) {
      errors = true;
    } else if (!(from instanceof Set) || !isSingleton(from)) {
      this.errors.push({
        tag: "RangeOperandNotCharactersError",
        location: e.from.location,
      });
      errors = true;
    }

    if (to == undefined) {
      errors = true;
    } else if (!(to instanceof Set) || !isSingleton(to)) {
      this.errors.push({
        tag: "RangeOperandNotCharactersError",
        location: e.to.location,
      });
      errors = true;
    }

    return errors ? undefined : rangeSet(
      first(from as Set<number>),
      first(to as Set<number>),
    );
  }

  translateNotExpr(e: AST.NotExpr): Set<number> | undefined {
    const cc = this.translateExpr(e.value);

    if (cc == undefined) {
      return undefined;
    } else if (cc instanceof Set) {
      return minus(all, cc);
    } else {
      this.errors.push({
        tag: "NotExpectsCharacterClassError",
        location: e.location,
      });
      return undefined;
    }
  }

  translateMinusExpr(e: AST.MinusExpr): Set<number> | undefined {
    const source = this.translateExpr(e.source);
    const extract = this.translateExpr(e.extract);
    let errors = false;

    if (source == undefined) {
      errors = true;
    } else if (!(source instanceof Set)) {
      this.errors.push({
        tag: "MinusOperandNotCharacterClassError",
        location: e.source.location,
      });
      errors = true;
    }

    if (extract == undefined) {
      errors = true;
    } else if (!(extract instanceof Set)) {
      this.errors.push({
        tag: "MinusOperandNotCharacterClassError",
        location: e.extract.location,
      });
      errors = true;
    }

    return errors
      ? undefined
      : minus(source as Set<number>, extract as Set<number>);
  }

  translateUnionExpr(e: AST.UnionExpr): Set<number> {
    let result = emptySet as Set<number>;

    e.values.forEach((value) => {
      const cc = this.translateExpr(value);

      if (cc != undefined) {
        if (cc instanceof Set) {
          result = union(result, cc);
        } else {
          this.errors.push({
            tag: "UnionOperandNotCharacterClassError",
            location: value.location,
          });
        }
      }
    });

    return result;
  }

  translateSequenceExpr(e: AST.SequenceExpr): RegEx {
    const values: Array<RegEx> = [];

    e.values.forEach((value) => {
      const v = this.translateExprAsRegEx(value);

      if (v != undefined) {
        values.push(v);
      }
    });

    return new SequenceRegEx(values);
  }

  translateAlternativeExpr(e: AST.AlternativeExpr): RegEx {
    const values: Array<RegEx> = [];

    e.values.forEach((value) => {
      const v = this.translateExprAsRegEx(value);

      if (v != undefined) {
        values.push(v);
      }
    });

    return new AlternativeRegEx(values);
  }

  translateWhitespace() {
    if (this.ast.whitespace != undefined) {
      const whitespace = this.translateExpr(this.ast.whitespace);

      if (whitespace != undefined) {
        if (whitespace instanceof Set) {
          this.d.setWhitespace(whitespace);
        } else {
          this.errors.push({
            tag: "CommentNotCharacterClassError",
            location: this.ast.whitespace.location,
          });
        }
      }
    }
  }
}

export const all = rangeSet(0, 255);
