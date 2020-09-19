import { rangeSet } from "../data/set.ts";

export class Definition {
  tokens: Array<[string, RegEx]> = [];
  comments: Array<Comment> = [];
  whitespace: Set<number> = rangeSet(0, 32);
  private fragments: Map<string, RegEx | Set<number>> = new Map();

  addToken(
    name: string,
    pattern: RegEx,
    position: number | undefined = undefined,
  ): Definition {
    if (this.hasToken(name)) {
      throw { tag: "TokenNameExistsError", name };
    } else if (position == undefined || position >= this.tokens.length - 1) {
      this.tokens.push([name, pattern]);
    } else if (position == 0) {
      this.tokens.unshift([name, pattern]);
    } else {
      this.tokens.splice(position, 0, [name, pattern]);
    }

    return this;
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

  literalMatch(text: string): [string, RegEx] | undefined {
    for (const token of this.tokens) {
      if (token[1].literalMatch(text) == text.length) {
        return token;
      }
    }

    return undefined;
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

export abstract class RegEx {
  abstract literalMatch(text: string): number | undefined;
}

export class CharacterClassRegEx extends RegEx {
  cc: Set<number>;

  constructor(cc: Set<number>) {
    super();
    this.cc = cc;
  }

  literalMatch(text: string): number | undefined {
    return (this.cc.size == 1 && this.cc.has(text.charCodeAt(0)))
      ? 1
      : undefined;
  }
}

export class LiteralStringRegEx extends RegEx {
  value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  literalMatch(text: string): number | undefined {
    const length = this.value.length;

    if (text.substr(0, length) == this.value) {
      return length;
    } else {
      return undefined;
    }
  }
}

export class ManyRegEx extends RegEx {
  regEx: RegEx;

  constructor(regEx: RegEx) {
    super();
    this.regEx = regEx;
  }

  literalMatch(text: string): number | undefined {
    return undefined;
  }
}

export class OptionalRegEx extends RegEx {
  regEx: RegEx;

  constructor(regEx: RegEx) {
    super();
    this.regEx = regEx;
  }

  literalMatch(text: string): number | undefined {
    return undefined;
  }
}

export class SequenceRegEx extends RegEx {
  regExs: Array<RegEx>;

  constructor(values: Array<RegEx>) {
    super();
    this.regExs = values;
  }

  literalMatch(text: string): number | undefined {
    let totalMatched: number | undefined = 0;

    for (const regex of this.regExs) {
      const match = regex.literalMatch(text);
      if (match == undefined) {
        return undefined;
      } else {
        totalMatched += match;
        text = text.substr(match);
      }
    }
    return totalMatched;
  }
}

export class AlternativeRegEx extends RegEx {
  regExs: Array<RegEx>;

  constructor(values: Array<RegEx>) {
    super();
    this.regExs = values;
  }

  literalMatch(text: string): number | undefined {
    return undefined;
  }
}
