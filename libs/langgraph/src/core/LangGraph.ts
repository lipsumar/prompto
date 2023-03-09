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
import createImageNode, { ImageNodeOptions } from '../nodes/image';
import createListSplitterNode from '../nodes/list-splitter';
import createLoopNode from '../nodes/loop';
import createFolderNode, { FolderNodeOptions } from '../nodes/folder';
import createImageGeneratorNode, {
  ImageGeneratorNodeOptions,
} from '../nodes/image-generator';
import { EventEmitter } from 'events';

export default class LangGraph extends EventEmitter {
  nodes: LangNode[] = [];
  edges: LangEdge[] = [];
  executeResults: ExecuteResults = [];

  constructor() {
    super();
  }

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

  async executeNode(nodeId: string, ctx: ExecuteFunctionContext) {
    const node = this.getNode(nodeId);
    invariant(node, `node id=${nodeId} not found`);
    this.executeResults = [];
    const res = await this.executeImpl(node, ctx);
    this.emitStep();
    console.log('emit last');
    return res;
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
    this.emitStep();

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

  emitStep() {
    this.emit('step', {
      nodesStatus: this.nodes.map((n) => {
        return { id: n.id, status: n.status };
      }),
    });
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

  getOutputNodesOf(node: LangNode) {
    const edges = Object.keys(node.outputs)
      .map((outputKey) => this.getEdgeFrom(node.id, outputKey))
      .filter((edge): edge is LangEdge => typeof edge !== 'undefined');
    return edges.map((edge) => ({
      node: edge.to,
      output: edge.fromPort,
      edge,
    }));
  }

  getEdgeTo(toId: string, toPort: string) {
    return this.edges.find(
      (edge) => edge.to.id === toId && edge.toPort === toPort
    );
  }

  getEdgeFrom(fromId: string, fromPort: string) {
    return this.edges.find(
      (edge) => edge.from.id === fromId && edge.fromPort === fromPort
    );
  }

  getDownstreamNodesOf(node: LangNode, acc: LangNode[] = []) {
    const outputNodes = this.getOutputNodesOf(node);
    const nodes = outputNodes.map((o) => o.node);
    acc.push(...nodes);
    nodes.forEach((n) => {
      this.getDownstreamNodesOf(n, acc);
    });
    return acc;
  }
}

type JSONNode = {
  id: string;
  inputs: Record<string, LangDataType>;
  outputs: Record<string, LangDataType>;
} & (
  | { type: 'llm'; config: LlmNodeOptions }
  | { type: 'text'; config: TextNodeOptions }
  | { type: 'input'; config: InputNodeOptions }
  | { type: 'image'; config: ImageNodeOptions }
  | { type: 'image-generator'; config: ImageGeneratorNodeOptions }
  | { type: 'list-splitter'; config: {} }
  | { type: 'loop'; config: {} }
  | { type: 'folder'; config: FolderNodeOptions }
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
    } else if (jsonNode.type === 'image') {
      node = createImageNode(jsonNode.id, { config: jsonNode.config });
    } else if (jsonNode.type === 'image-generator') {
      node = createImageGeneratorNode(jsonNode.id, { config: jsonNode.config });
    } else if (jsonNode.type === 'list-splitter') {
      node = createListSplitterNode(jsonNode.id);
    } else if (jsonNode.type === 'loop') {
      node = createLoopNode(jsonNode.id);
    } else if (jsonNode.type === 'folder') {
      node = createFolderNode(jsonNode.id, { config: jsonNode.config });
    } else {
      throw new Error('unsupported node type=: ' + (jsonNode as any).type);
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
