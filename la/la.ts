import { Definition } from "./definition.ts";
import { FA } from "./fa.ts";
import * as NFA from "./nfa.ts";
import {
  BlockComment,
  CharacterClassRegEx,
  LineComment,
  RegEx,
} from "./definition.ts";
import * as DFA from "./dfa.ts";
import * as Set from "../data/set.ts";

export function dfaForTopLevel(definition: Definition): FA<number> {
  const builder = new NFA.Builder<number>();

  definition.tokens.forEach((v, i) => {
    builder.addItem(i, v[1]);
  });
  builder.addItem(
    definition.tokens.length,
    new CharacterClassRegEx(Set.setOf(-1)),
  );
  definition.comments.forEach((v, i) => {
    if (v instanceof BlockComment) {
      builder.addItem(definition.tokens.length + 2 + i, v.open);
    } else if (v instanceof LineComment) {
      builder.addItem(definition.tokens.length + 2 + i, v.pattern);
    }
  });

  return DFA.fromNFA(builder.build());
}

export function dfaForNonNestedBlockComment(close: RegEx): FA<number> {
  const builder = new NFA.Builder<number>();

  builder.addItem(0, new CharacterClassRegEx(Set.rangeSet(0, 255)));
  builder.addItem(1, close);

  return DFA.fromNFA(builder.build());
}

export function dfaForNestedBlockComment(
  open: RegEx,
  close: RegEx,
): FA<number> {
  const builder = new NFA.Builder<number>();

  builder.addItem(0, new CharacterClassRegEx(Set.rangeSet(0, 255)));
  builder.addItem(1, open);
  builder.addItem(2, close);

  return DFA.fromNFA(builder.build());
}
