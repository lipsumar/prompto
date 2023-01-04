import { Request } from 'express';
import ChainGraph from './ChainGraph';
import ChainNode from './ChainNode';

/*
InputNode
  output:
    - text
  config:
    paramName: "foo"

TextNode:

*/

function createInputNode({ input }: { input: string }) {
  const node = new ChainNode({
    execute: (_, { apiInput }) => {
      const val = apiInput[input] || '';
      if (typeof val !== 'string') throw new Error('input must be string');
      return { default: { type: 'string', value: val } };
    },
    outputs: ['default'],
  });
  return node;
}

function createOutNode() {
  return new ChainNode({
    execute: (inputs) => inputs,
    inputs: ['default'],
  });
}

const outNode = createOutNode();
const chainGraph = new ChainGraph(outNode);

const inputNode = createInputNode({ input: 'foo' });
chainGraph.addNode(inputNode);

const wrapperNode = new ChainNode({
  execute: (inputs) => {
    return {
      default: { type: 'string', value: '-->' + inputs.default.value + '<--' },
    };
  },
  inputs: ['default'],
  outputs: ['default'],
});
chainGraph.addNode(wrapperNode);

chainGraph.createEdge({
  fromId: inputNode.id,
  fromPort: 'default',
  toId: wrapperNode.id,
  toPort: 'default',
});

chainGraph.createEdge({
  fromId: wrapperNode.id,
  fromPort: 'default',
  toId: outNode.id,
  toPort: 'default',
});

chainGraph.execute({ foo: 'the foo!' }).then((resp) => {
  console.log(resp);
});
