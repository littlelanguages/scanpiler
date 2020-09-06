import { rangeSet } from "../data/set.ts";

export class Definition {
  tokens: Array<[string, RegEx]> = [];
  comments: Array<Comment> = [];
  whitespace: Set<number> = rangeSet(0, 32);
  private fragments: Map<string, RegEx | Set<number>> = new Map();

  addToken(name: string, pattern: RegEx): Definition {
    if (this.hasToken(name)) {
      throw { tag: "TokenNameExistsError", name };
    } else {
      this.tokens.push([name, pattern]);
      return this;
    }
  }

  token(name: string): RegEx | undefined {
    const token = this.tokens.find(([n, _]) => n == name);

    return (token == undefined) ? undefined : token[1];
  }

  hasToken(name: string): boolean {
    return this.token(name) != undefined;
  }

  addComment(comment: Comment): Definition {
    this.comments.push(comment);
    return this;
  }

  setWhitespace(whitespace: Set<number>): Definition {
    this.whitespace = whitespace;

    return this;
  }

  addFragment(name: string, expr: RegEx | Set<number>): Definition {
    if (this.fragments.has(name)) {
      throw new RangeError(`Definition: Duplicate fragment: ${name}`);
    }

    this.fragments.set(name, expr);

    return this;
  }

  fragment(name: string): RegEx | Set<number> | undefined {
    return this.fragments.get(name);
  }

  hasFragment(name: string): boolean {
    return this.fragments.has(name);
  }
}

export abstract class Comment {}

export class BlockComment extends Comment {
  open: RegEx;
  close: RegEx;

  nested: boolean;

  constructor(open: RegEx, close: RegEx, nested: boolean) {
    super();

    this.open = open;
    this.close = close;
    this.nested = nested;
  }
}

export class LineComment extends Comment {
  pattern: RegEx;

  constructor(pattern: RegEx) {
    super();

    this.pattern = pattern;
  }
}

export abstract class RegEx {}

export class CharacterClassRegEx extends RegEx {
  cc: Set<number>;

  constructor(cc: Set<number>) {
    super();
    this.cc = cc;
  }
}

export class LiteralStringRegEx extends RegEx {
  value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }
}

export class ManyRegEx extends RegEx {
  regEx: RegEx;

  constructor(regEx: RegEx) {
    super();
    this.regEx = regEx;
  }
}

export class OptionalRegEx extends RegEx {
  regEx: RegEx;

  constructor(regEx: RegEx) {
    super();
    this.regEx = regEx;
  }
}

export class SequenceRegEx extends RegEx {
  regExs: Array<RegEx>;

  constructor(values: Array<RegEx>) {
    super();
    this.regExs = values;
  }
}

export class AlternativeRegEx extends RegEx {
  regExs: Array<RegEx>;

  constructor(values: Array<RegEx>) {
    super();
    this.regExs = values;
  }
}
