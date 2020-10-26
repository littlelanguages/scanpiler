import {
  AlternativeRegEx,
  CharacterClassRegEx,
  LiteralStringRegEx,
  ManyRegEx,
  OptionalRegEx,
  RegEx,
  SequenceRegEx,
} from "./definition.ts";
import { emptySet, setOf, union } from "../data/set.ts";
import { FA, Node, NodeRef } from "./fa.ts";

export class Builder<T> {
  private nextNodeID = 0;
  private startNode: Node;
  private nodes: Array<Node> = [];
  private endNodes: Map<NodeRef, T> = new Map();

  constructor() {
    this.startNode = this.newNode();
  }

  addItem(n: T, regEx: RegEx): Builder<T> {
    const lastNode = this.newNode();
    const firstNode = this.thompsonConstruction(regEx, lastNode);

    this.addFinalNode(lastNode, n);
    this.addTransition(this.startNode, emptySet as Set<number>, firstNode);

    return this;
  }

  build(): FA<T> {
    return {
      startNode: this.startNode,
      endNodes: this.endNodes,
      nodes: this.nodes,
    };
  }

  private addFinalNode(node: Node, n: T) {
    this.endNodes.set(node.id, n);
  }

  private addTransition(source: Node, cc: Set<number>, target: Node) {
    source.transitions.push([cc, target]);
  }

  private newNode(): Node {
    const newNode = { id: this.nextNodeID, transitions: [] };
    this.nodes.push(newNode);

    this.nextNodeID += 1;
    return newNode;
  }

  private thompsonConstruction(regEx: RegEx, last: Node): Node {
    if (regEx instanceof CharacterClassRegEx) {
      return this.constructSet(regEx.cc, last);
    } else if (regEx instanceof LiteralStringRegEx) {
      return this.constructLiteralString(regEx.value, last);
    } else if (regEx instanceof ManyRegEx) {
      return this.constructMany(regEx.regEx, last);
    } else if (regEx instanceof OptionalRegEx) {
      return this.constructOptional(regEx.regEx, last);
    } else if (regEx instanceof SequenceRegEx) {
      return this.constructSequence(regEx.regExs, last);
    } else if (regEx instanceof AlternativeRegEx) {
      return this.constructAlternative(regEx.regExs, last);
    } else {
      throw `Internal Error: ${regEx}`;
    }
  }

  private constructSet(cc: Set<number>, last: Node): Node {
    const node = this.newNode();

    this.addTransition(node, cc, last);

    return node;
  }

  private constructLiteralString(str: string, last: Node): Node {
    let runner = last;
    let tail = str.length - 1;

    while (tail >= 0) {
      const current = this.newNode();
      this.addTransition(current, setOf(str.charCodeAt(tail)), runner);
      runner = current;
      tail -= 1;
    }

    return runner;
  }

  private constructMany(regEx: RegEx, last: Node): Node {
    const start = this.thompsonConstruction(regEx, last);

    this.addTransition(last, emptySet as Set<number>, start);
    this.addTransition(start, emptySet as Set<number>, last);

    return start;
  }

  private constructOptional(regEx: RegEx, last: Node): Node {
    const start = this.thompsonConstruction(regEx, last);

    this.addTransition(start, emptySet as Set<number>, last);

    return start;
  }

  private constructSequence(regExs: Array<RegEx>, last: Node): Node {
    return regExs.reduceRight<Node>(
      (previous, regex) => this.thompsonConstruction(regex, previous),
      last,
    );
  }

  private constructAlternative(regExs: Array<RegEx>, last: Node): Node {
    if (regExs.length == 0) {
      return last;
    } else if (regExs.length == 1) {
      return this.thompsonConstruction(regExs[0], last);
    } else {
      let start = this.newNode();

      regExs.forEach((regEx) => {
        const alternative = this.thompsonConstruction(regEx, last);
        this.addTransition(start, emptySet as Set<number>, alternative);
      });

      return start;
    }
  }
}

export function epsilonTransitions<T>(nfa: FA<T>): Array<Set<NodeRef>> {
  return nfa.nodes.map(
    (node) => {
      const transitions: Array<[Set<number>, Node]> = node.transitions;
      const emptyTransitions = transitions.filter((e) => e[0].size == 0);
      const emptyTransitionsIDs = emptyTransitions.map((e) => e[1].id);

      return setOf(emptyTransitionsIDs);
    },
  );
}

export function transitiveClosure(
  matrix: Array<Set<NodeRef>>,
): Array<Set<NodeRef>> {
  const result = [...matrix];
  const dimension = result.length;

  for (let count = 0; count < dimension; count += 1) {
    for (let iteration = 0; iteration <= count; iteration += 1) {
      result[iteration] = [...result[iteration]]
        .map((ns) => result[ns]).reduce<Set<NodeRef>>(
          (acc, i) => union(acc, i),
          result[iteration],
        );
    }
  }

  return result;
}
