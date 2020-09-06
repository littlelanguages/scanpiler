export type FA<T> = {
  startNode: Node;
  endNodes: Map<NodeRef, T>;
  nodes: Array<Node>;
};

export type NodeRef = number;

export type Node = {
  id: NodeRef;
  transitions: Array<[Set<number>, Node]>;
};
