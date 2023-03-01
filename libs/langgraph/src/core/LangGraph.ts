import LangEdge from './LangEdge';
import LangNode from './LangNode';
import invariant from 'tiny-invariant';
import type {
  ExecuteFunctionContext,
  ExecuteResults,
  LangDataType,
} from '../types';
import { uniqBy } from 'lodash';

import createLlmNode, { LlmNodeOptions } from '../nodes/llm';
import createTextNode, { TextNodeOptions } from '../nodes/text';
import createInputNode, { InputNodeOptions } from '../nodes/input';

export default class LangGraph {
  nodes: LangNode[] = [];
  edges: LangEdge[] = [];
  executeResults: ExecuteResults = [];

  constructor() {}

  addNode(node: LangNode) {
    this.nodes.push(node);
  }

  createEdge({
    id,
    fromId,
    fromPort = 'default',
    toId,
    toPort = 'default',
  }: {
    id: string;
    fromId: string;
    fromPort?: string;
    toId: string;
    toPort?: string;
  }) {
    const from = this.getNode(fromId);
    invariant(from, 'cant find "from" node');
    invariant(
      from.hasOutputPort(fromPort),
      `"from" node has no output port "${fromPort}"`
    );
    const to = this.getNode(toId);
    invariant(to, 'cant find "to" node');
    invariant(
      to.hasInputPort(toPort),
      `"to" node (${to.id}) has no input port "${toPort}"`
    );

    const edge = new LangEdge(id, from, fromPort, to, toPort);
    this.addEdge(edge);
  }

  addEdge(edge: LangEdge) {
    this.edges.push(edge);
  }

  executeNode(nodeId: string, ctx: ExecuteFunctionContext) {
    const node = this.getNode(nodeId);
    invariant(node, `node id=${nodeId} not found`);
    this.executeResults = [];
    return this.executeImpl(node, ctx);
  }

  private async executeImpl(node: LangNode, ctx: ExecuteFunctionContext) {
    // get inputs
    let inputs = {};
    if (node.hasInputs()) {
      const inputNodes = this.getInputNodesOf(node);
      const uniqueNodes = uniqBy(
        inputNodes.map((inputNode) => inputNode.node),
        (node) => node.id
      );
      const uniqueNodesIds = uniqueNodes.map((n) => n.id);
      const uniqueNodesOutputs = await Promise.all(
        uniqueNodes.map((inputNode) => this.executeImpl(inputNode, ctx))
      );

      inputs = inputNodes.reduce((acc, { input, node, edge }) => {
        const uniqueNodeIndex = uniqueNodesIds.indexOf(node.id);
        acc[input] = uniqueNodesOutputs[uniqueNodeIndex][edge.fromPort];
        return acc;
      }, {} as Record<string, any>);
    }

    // execute node
    node.status = 'executing';
    let nodeOutput;
    try {
      nodeOutput = await node.execute(inputs, ctx);
    } catch (err) {
      console.log('Error executing node id=' + node.id);
      throw err;
    }
    node.status = 'idle';

    this.executeResults.push({
      nodeId: node.id,
      inputs,
      outputs: nodeOutput,
    });
    return nodeOutput;
  }

  getNode(id: string) {
    return this.nodes.find((n) => n.id === id);
  }
  getNodeOrThrow(id: string) {
    const node = this.getNode(id);
    if (!node) throw new Error('cant find node id=' + id);
    return node;
  }

  getInputNodesOf(node: LangNode) {
    const edges = Object.keys(node.inputs)
      .map((inputKey) => this.getEdgeTo(node.id, inputKey))
      .filter((edge): edge is LangEdge => typeof edge !== 'undefined');
    return edges.map((edge) => ({ node: edge.from, input: edge.toPort, edge }));
  }

  getEdgeTo(toId: string, toPort: string) {
    return this.edges.find(
      (edge) => edge.to.id === toId && edge.toPort === toPort
    );
  }
}

type JSONNode = {
  id: string;
  inputs: Record<string, LangDataType>;
  outputs: Record<string, LangDataType>;
} & (
  | { type: 'llm'; config: LlmNodeOptions }
  | { type: 'text'; config: TextNodeOptions }
  | { type: 'output'; config?: undefined }
  | { type: 'input'; config: InputNodeOptions }
);

export function fromJSON(json: {
  nodes: JSONNode[];
  edges: {
    id: string;
    from: string;
    fromPort: string;
    to: string;
    toPort: string;
  }[];
}): LangGraph {
  const graph = new LangGraph();
  json.nodes.forEach((jsonNode) => {
    let node;
    if (jsonNode.type === 'llm') {
      node = createLlmNode(jsonNode.id, {
        config: jsonNode.config,
      });
    } else if (jsonNode.type === 'text') {
      node = createTextNode(jsonNode.id, {
        inputs: jsonNode.inputs,
        config: jsonNode.config,
      });
    } else if (jsonNode.type === 'input') {
      node = createInputNode(jsonNode.id, jsonNode.config);
    } else {
      throw new Error('unsupported node type=: ' + jsonNode.type);
    }
    graph.addNode(node);
  });

  json.edges.forEach((jsonEdge) => {
    graph.createEdge({
      id: jsonEdge.id,
      fromId: jsonEdge.from,
      fromPort: jsonEdge.fromPort,
      toId: jsonEdge.to,
      toPort: jsonEdge.toPort,
    });
  });

  return graph;
}
