import { fromNFA } from "./dfa.ts";
import { assertEquals } from "../testing/asserts.ts";
import { Builder } from "./nfa.ts";
import {
  CharacterClassRegEx,
  ManyRegEx,
  OptionalRegEx,
  SequenceRegEx,
} from "./definition.ts";
import { FA, Node } from "./fa.ts";
import { setOf } from "../data/set.ts";

const a = setOf(97);
const aRe = new CharacterClassRegEx(a);
const b = setOf(98);
const bRe = new CharacterClassRegEx(b);
const space = setOf(32);
const spaceRe = new CharacterClassRegEx(space);
const period = setOf(46);
const periodRe = new CharacterClassRegEx(period);

Deno.test("dfa - fromNFA - x='a' y='b' ws=' ' {' '}", () => {
  const dfa = fromNFA(
    new Builder<number>()
      .addItem(0, aRe)
      .addItem(1, bRe)
      .addItem(2, new SequenceRegEx([spaceRe, new ManyRegEx(spaceRe)]))
      .build(),
  );

  const n0 = newNode(0);
  const n1 = newNode(1);
  const n2 = newNode(2);
  const n3 = newNode(3);

  n0.transitions = [
    [a, n1],
    [b, n2],
    [space, n3],
  ];
  n3.transitions = [[space, n3]];

  assertDFAEquals(dfa, n0, [n0, n1, n2, n3], new Map([[1, 0], [2, 1], [3, 2]]));
});

Deno.test("dfa - fromNFA - x='a' {'a'} y='a' {'a'} '.' 'a' {'a'}", () => {
  const dfa = fromNFA(
    new Builder<number>()
      .addItem(0, new SequenceRegEx([aRe, new ManyRegEx(aRe)]))
      .addItem(
        1,
        new SequenceRegEx(
          [aRe, new ManyRegEx(aRe), periodRe, aRe, new ManyRegEx(aRe)],
        ),
      )
      .build(),
  );

  const n0 = newNode(0);
  const n1 = newNode(1);
  const n2 = newNode(2);
  const n3 = newNode(3);

  n0.transitions = [[a, n1]];
  n1.transitions = [[a, n1], [period, n2]];
  n2.transitions = [[a, n3]];
  n3.transitions = [[a, n3]];

  assertDFAEquals(dfa, n0, [n0, n1, n2, n3], new Map([[1, 0], [3, 1]]));
});

Deno.test("dfa - fromNFA - x='a' {'a'} '.' 'a' {'a'} y='a' {'a'}", () => {
  const dfa = fromNFA(
    new Builder<number>()
      .addItem(
        0,
        new SequenceRegEx(
          [aRe, new ManyRegEx(aRe), periodRe, aRe, new ManyRegEx(aRe)],
        ),
      )
      .addItem(1, new SequenceRegEx([aRe, new ManyRegEx(aRe)]))
      .build(),
  );

  const n0 = newNode(0);
  const n1 = newNode(1);
  const n2 = newNode(2);
  const n3 = newNode(3);

  n0.transitions = [[a, n1]];
  n1.transitions = [[a, n1], [period, n2]];
  n2.transitions = [[a, n3]];
  n3.transitions = [[a, n3]];

  assertDFAEquals(dfa, n0, [n0, n1, n2, n3], new Map([[1, 1], [3, 0]]));
});

Deno.test("dfa - fromNFA - x='a' {'a'} ['.' 'a' {'a'}] y='a' {'a'} results in y never being matched", () => {
  const dfa = fromNFA(
    new Builder<number>()
      .addItem(
        0,
        new SequenceRegEx(
          [
            aRe,
            new ManyRegEx(aRe),
            new OptionalRegEx(
              new SequenceRegEx([periodRe, aRe, new ManyRegEx(aRe)]),
            ),
          ],
        ),
      )
      .addItem(1, new SequenceRegEx([aRe, new ManyRegEx(aRe)]))
      .build(),
  );

  const n0 = newNode(0);
  const n1 = newNode(1);
  const n2 = newNode(2);
  const n3 = newNode(3);

  n0.transitions = [[a, n1]];
  n1.transitions = [[a, n1], [period, n2]];
  n2.transitions = [[a, n3]];
  n3.transitions = [[a, n3]];

  assertDFAEquals(dfa, n0, [n0, n1, n2, n3], new Map([[1, 0], [3, 0]]));
});

function assertDFAEquals(
  dfa: FA<number>,
  startNode: Node,
  nodes: Array<Node>,
  finalStateMapping: Map<number, number>,
) {
  assertNodeEquals(dfa.startNode, startNode);
  assertNodesEquals(dfa.nodes, nodes);
  assertEquals(dfa.endNodes, finalStateMapping);
}

function assertNodeEquals(node1: Node, node2: Node) {
  assertEquals(node1.id, node2.id);
  assertEquals(node1.transitions.length, node2.transitions.length);

  for (let i = 0; i < node1.transitions.length; i += 1) {
    assertEquals(node1.transitions[i][0], node2.transitions[i][0]);
    assertEquals(node1.transitions[i][1].id, node2.transitions[i][1].id);
  }
}

function assertNodesEquals(nodes1: Array<Node>, nodes2: Array<Node>) {
  assertEquals(nodes1.length, nodes2.length);
  for (let i = 0; i < nodes1.length; i += 1) {
    assertNodeEquals(nodes1[i], nodes2[i]);
  }
}

function newNode(id: number): Node {
  return { id, transitions: [] };
}
