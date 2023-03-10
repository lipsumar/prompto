import LangGraph from './LangGraph';
import LangNode from './LangNode';

function dummyNode(id: string) {
  return new LangNode({
    id,
    async execute() {
      return { default: { type: 'string', value: 'val' } };
    },
    outputs: { default: 'string' },
    inputs: { default: 'string' },
  });
}

function dummyEdge(id: string, fromId: string, toId: string) {
  return { id, fromId, toId };
}

describe('LangGraph', () => {
  describe('getDownstreamNodesOf', () => {
    test('a -> b -> c', () => {
      const graph = new LangGraph();
      graph.addNode(dummyNode('a'));
      graph.addNode(dummyNode('b'));
      graph.createEdge(dummyEdge('a-b', 'a', 'b'));
      graph.addNode(dummyNode('c'));
      graph.createEdge(dummyEdge('b-c', 'b', 'c'));

      expect(
        graph.getDownstreamNodesOf(graph.getNode('a')!).map((n) => n.id)
      ).toEqual(['b', 'c']);
    });

    test('a (-> b) (-> c)', () => {
      const graph = new LangGraph();
      graph.addNode(dummyNode('a'));
      graph.addNode(dummyNode('b'));
      graph.createEdge(dummyEdge('a-b', 'a', 'b'));
      graph.addNode(dummyNode('c'));
      graph.createEdge(dummyEdge('a-c', 'a', 'c'));

      expect(
        graph.getDownstreamNodesOf(graph.getNode('a')!).map((n) => n.id)
      ).toEqual(['b', 'c']);
    });
  });

  describe('getOutputNodesOf', () => {
    test('a -> b -> c', () => {
      const graph = new LangGraph();
      graph.addNode(dummyNode('a'));
      graph.addNode(dummyNode('b'));
      graph.createEdge(dummyEdge('a-b', 'a', 'b'));
      graph.addNode(dummyNode('c'));
      graph.createEdge(dummyEdge('b-c', 'b', 'c'));

      expect(
        graph.getOutputNodesOf(graph.getNode('a')!).map((n) => n.node.id)
      ).toEqual(['b']);

      expect(
        graph.getOutputNodesOf(graph.getNode('b')!).map((n) => n.node.id)
      ).toEqual(['c']);
    });

    test('a (-> b) (-> c)', () => {
      const graph = new LangGraph();
      graph.addNode(dummyNode('a'));
      graph.addNode(dummyNode('b'));
      graph.createEdge(dummyEdge('a-b', 'a', 'b'));
      graph.addNode(dummyNode('c'));
      graph.createEdge(dummyEdge('a-c', 'a', 'c'));

      expect(
        graph.getOutputNodesOf(graph.getNode('a')!).map((n) => n.node.id)
      ).toEqual(['b', 'c']);
    });
  });
});
