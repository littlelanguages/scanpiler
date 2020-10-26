import { epsilonTransitions, transitiveClosure } from "./nfa.ts";
import {
  emptySet,
  first,
  intersection,
  isEmpty,
  isEqual,
  setOf,
  union,
} from "../data/set.ts";
import { FA, Node, NodeRef } from "./fa.ts";

export function fromNFA<T>(nfa: FA<T>): FA<T> {
  const epsilonClosure = transitiveClosure(epsilonTransitions(nfa));
  const toVisit: Set<Set<NodeRef>> = new Set();
  const nodes: Array<Node> = [];
  const mappings: Array<[Set<NodeRef>, NodeRef]> = [];

  // resolveState - given a stateRef attempts to lookup in mappings if there is already a target state
  // associated with that combination of node references.  If there is then return it otherwise create
  // a new node, allocating an ID to it, adding it into the set of nodes to be visited and then
  // returns the new node ID.
  function resolveState(stateRefs: Set<NodeRef>): NodeRef {
    const reachableStateRef = epsilonReachableNodes(stateRefs);
    const m = mappings.find(([s, _]) => isEqual(s, reachableStateRef));

    if (m == undefined) {
      const result = nodes.length;
      mappings.push([reachableStateRef, result]);
      nodes.push({ id: result, transitions: [] });
      toVisit.add(reachableStateRef);
      return result;
    } else {
      return m[1];
    }
  }

  function epsilonReachableNodes(nodeRefs: Set<NodeRef>): Set<NodeRef> {
    return [...nodeRefs].map((nr) => epsilonClosure[nr]).reduce(
      (ac, i) => union(ac, i),
      nodeRefs,
    );
  }

  function finalTokenID(nodes: Set<NodeRef>): T {
    const ns = [...nodes].map((ns) => nfa.endNodes.get(ns)!);

    return ns.slice(1).reduce(
      (a, b) => a < b ? a : b,
      ns[0],
    );
  }

  const startState: NodeRef = resolveState(setOf(nfa.startNode.id));

  while (!isEmpty(toVisit)) {
    const nodeRefs: Set<NodeRef> = first(toVisit);
    toVisit.delete(nodeRefs);

    // reachableNodes - given a collection of NFA states it is all states that can be reached from
    // each of these states by considering the union of all the epsilon transitive transitions
    const reachableNodes: Set<NodeRef> = [...nodeRefs].map((nr) =>
      epsilonClosure[nr]
    ).reduce(
      (ac, i) => union(ac, i),
      nodeRefs,
    );

    // traverals - all of transitions out of the set of reachable state
    const transitions: Array<[Set<number>, Node]> = [...reachableNodes]
      .flatMap((nr) => nfa.nodes[nr].transitions);

    // alphabet - the set of characters that are
    const alphabet: Set<number> = transitions.reduce<Set<number>>(
      (acc, transition) => union(acc, transition[0]),
      emptySet as Set<number>,
    );

    const reverseMapping = new Map<NodeRef, Set<number>>();

    [...alphabet].forEach((ch) => {
      const targetNode = resolveState(
        setOf(
          transitions.filter((transition) => transition[0].has(ch)).map((
            transition,
          ) => transition[1].id),
        ),
      );

      const rm = reverseMapping.get(targetNode);
      if (rm == undefined) {
        reverseMapping.set(targetNode, setOf(ch));
      } else {
        reverseMapping.set(targetNode, union(rm, setOf(ch)));
      }
    });

    nodes[resolveState(nodeRefs)].transitions = [...reverseMapping].map((
      [noderef, cc],
    ) => [cc, nodes[noderef]]);
  }

  const endNodesKeys: Set<NodeRef> = setOf([...nfa.endNodes.keys()]);

  const finalStatesMapping: Array<[NodeRef, T]> = mappings
    .map(([k, _]) => k)
    .filter((keys) => !isEmpty(intersection(keys, endNodesKeys)))
    .map((keys) => [
      resolveState(keys),
      finalTokenID(intersection(keys, endNodesKeys)),
    ]);

  const finalStates: Map<NodeRef, T> = new Map(finalStatesMapping);

  return { startNode: nodes[startState], endNodes: finalStates, nodes };
}
