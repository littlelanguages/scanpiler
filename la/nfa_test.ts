import { assertEquals } from "https://deno.land/std@0.63.0/testing/asserts.ts";
import {
  Builder,
  epsilonTransitions,
  transitiveClosure,
} from "./nfa.ts";
import { rangeSet, emptySet, setOf } from "../data/set.ts";
import {
  CharacterClassRegEx,
  LiteralStringRegEx,
  ManyRegEx,
  OptionalRegEx,
  SequenceRegEx,
  AlternativeRegEx,
} from "./definition.ts";
import { Node } from "./fa.ts";

Deno.test("nfa - builder - init", () => {
  const node = { id: 0, transitions: [] };

  assertEquals(
    new Builder().build(),
    { endNodes: new Map(), nodes: [node], startNode: node },
  );
});

Deno.test("nfa - builder - add token - character class regex", () => {
  const startNode = newNode(0);
  const ccEndNode = newNode(1);
  const ccStartNode = newNode(2);

  startNode.transitions = [
    [emptySet as Set<number>, ccStartNode],
  ];
  ccStartNode.transitions = [
    [rangeSet(0, 32), ccEndNode],
  ];

  const nfa = new Builder()
    .addItem(0, new CharacterClassRegEx(rangeSet(0, 32)))
    .build();

  assertEquals(nfa.endNodes, new Map().set(ccEndNode.id, 0));
  assertEquals(nfa.startNode, startNode);
  assertEquals(nfa.nodes, [startNode, ccEndNode, ccStartNode]);
});

Deno.test("nfa - builder - add token - empty literal string regex", () => {
  const startNode = newNode(0);
  const ccEndNode = newNode(1);

  startNode.transitions = [
    [emptySet as Set<number>, ccEndNode],
  ];

  const nfa = new Builder()
    .addItem(0, new LiteralStringRegEx(""))
    .build();

  assertEquals(nfa.endNodes, new Map().set(ccEndNode.id, 0));
  assertEquals(nfa.startNode, startNode);
  assertEquals(nfa.nodes, [startNode, ccEndNode]);
});

Deno.test('nfa - builder - add token - "hello" literal string regex', () => {
  const startNode = newNode(0);
  const ccEndNode = newNode(1);
  const node1 = newNode(6);
  const node2 = newNode(5);
  const node3 = newNode(4);
  const node4 = newNode(3);
  const node5 = newNode(2);

  startNode.transitions = [
    [emptySet as Set<number>, node1],
  ];
  node1.transitions = [
    [setOf("h".charCodeAt(0)), node2],
  ];
  node2.transitions = [
    [setOf("e".charCodeAt(0)), node3],
  ];
  node3.transitions = [
    [setOf("l".charCodeAt(0)), node4],
  ];
  node4.transitions = [
    [setOf("l".charCodeAt(0)), node5],
  ];
  node5.transitions = [
    [setOf("o".charCodeAt(0)), ccEndNode],
  ];

  const nfa = new Builder()
    .addItem(0, new LiteralStringRegEx("hello"))
    .build();

  assertEquals(nfa.endNodes, new Map().set(ccEndNode.id, 0));
  assertEquals(nfa.startNode, startNode);
  assertEquals(
    nfa.nodes,
    [startNode, ccEndNode, node5, node4, node3, node2, node1],
  );
});

Deno.test("nfa - builder - add token - many regex", () => {
  const startNode: Node = newNode(0);
  const ccEndNode = newNode(1);
  const node1: Node = newNode(2);

  startNode.transitions = [
    [emptySet as Set<number>, node1],
  ];
  node1.transitions = [
    [setOf("x".charCodeAt(0)), ccEndNode],
    [emptySet as Set<number>, ccEndNode],
  ];
  ccEndNode.transitions = [
    [emptySet as Set<number>, node1],
  ];

  const nfa = new Builder()
    .addItem(0, new ManyRegEx(new LiteralStringRegEx("x")))
    .build();

  assertEquals(nfa.endNodes, new Map().set(ccEndNode.id, 0));
  assertNodeEquals(nfa.startNode, startNode);
  assertNodesEquals(nfa.nodes, [startNode, ccEndNode, node1]);
});

Deno.test("nfa - builder - add token - optional regex", () => {
  const startNode: Node = newNode(0);
  const ccEndNode = newNode(1);
  const node1: Node = newNode(2);

  startNode.transitions = [
    [emptySet as Set<number>, node1],
  ];
  node1.transitions = [
    [setOf("x".charCodeAt(0)), ccEndNode],
    [emptySet as Set<number>, ccEndNode],
  ];

  const nfa = new Builder()
    .addItem(0, new OptionalRegEx(new LiteralStringRegEx("x")))
    .build();

  assertEquals(nfa.endNodes, new Map().set(ccEndNode.id, 0));
  assertNodeEquals(nfa.startNode, startNode);
  assertNodesEquals(nfa.nodes, [startNode, ccEndNode, node1]);
});

Deno.test("nfa - builder - add token - sequence regex", () => {
  const startNode: Node = newNode(0);
  const ccEndNode = newNode(1);
  const node1: Node = newNode(4);
  const node2: Node = newNode(3);
  const node3: Node = newNode(2);

  startNode.transitions = [
    [emptySet as Set<number>, node1],
  ];
  node1.transitions = [
    [setOf("x".charCodeAt(0)), node2],
  ];
  node2.transitions = [
    [setOf("y".charCodeAt(0)), node3],
  ];
  node3.transitions = [
    [setOf("z".charCodeAt(0)), ccEndNode],
  ];

  const nfa = new Builder()
    .addItem(
      0,
      new SequenceRegEx(
        [
          new LiteralStringRegEx("x"),
          new LiteralStringRegEx("y"),
          new LiteralStringRegEx("z"),
        ],
      ),
    )
    .build();

  assertEquals(nfa.endNodes, new Map().set(ccEndNode.id, 0));
  assertEquals(nfa.startNode, startNode);
  assertEquals(nfa.nodes, [startNode, ccEndNode, node3, node2, node1]);
});

Deno.test("nfa - builder - add token - alternative regex", () => {
  const startNode: Node = newNode(0);
  const ccEndNode = newNode(1);
  const node1: Node = newNode(2);
  const node2: Node = newNode(3);
  const node3: Node = newNode(4);
  const node4: Node = newNode(5);

  startNode.transitions = [
    [emptySet as Set<number>, node1],
  ];
  node1.transitions = [
    [emptySet as Set<number>, node2],
    [emptySet as Set<number>, node3],
    [emptySet as Set<number>, node4],
  ];
  node2.transitions = [
    [setOf("x".charCodeAt(0)), ccEndNode],
  ];
  node3.transitions = [
    [setOf("y".charCodeAt(0)), ccEndNode],
  ];
  node4.transitions = [
    [setOf("z".charCodeAt(0)), ccEndNode],
  ];

  const nfa = new Builder()
    .addItem(
      0,
      new AlternativeRegEx(
        [
          new LiteralStringRegEx("x"),
          new LiteralStringRegEx("y"),
          new LiteralStringRegEx("z"),
        ],
      ),
    )
    .build();

  assertEquals(nfa.endNodes, new Map().set(ccEndNode.id, 0));
  assertEquals(nfa.startNode, startNode);
  assertEquals(nfa.nodes, [startNode, ccEndNode, node1, node2, node3, node4]);
});

Deno.test("nfa - epsilon closure: 0 -> 1", () => {
  const n0 = newNode(0);
  const n1 = newNode(1);

  n0.transitions.push([emptySet as Set<number>, n1]);

  assertEquals(
    transitiveClosure(epsilonTransitions(
      { startNode: n0, endNodes: new Map().set(1, 0), nodes: [n0, n1] },
    )),
    [setOf(1), emptySet],
  );
});

Deno.test("nfa - epsilon closure: 0 -> 1, 0 -> 0, 1 -> 2, 2 -> 2", () => {
  const n0 = newNode(0);
  const n1 = newNode(1);
  const n2 = newNode(2);

  n0.transitions.push([emptySet as Set<number>, n0]);
  n0.transitions.push([emptySet as Set<number>, n1]);
  n1.transitions.push([emptySet as Set<number>, n2]);
  n2.transitions.push([emptySet as Set<number>, n2]);

  assertEquals(
    transitiveClosure(epsilonTransitions(
      { startNode: n0, endNodes: new Map().set(2, 0), nodes: [n0, n1, n2] },
    )),
    [setOf([0, 1, 2]), setOf(2), setOf(2)],
  );
});

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
