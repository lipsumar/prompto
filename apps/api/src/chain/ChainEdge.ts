import ChainNode from './ChainNode';

export default class ChainEdge {
  from: ChainNode;
  to: ChainNode;
  id: number | null = null;
  fromPort: string;
  toPort: string;

  constructor(
    from: ChainNode,
    fromPort: string,
    to: ChainNode,
    toPort: string
  ) {
    this.from = from;
    this.fromPort = fromPort;
    this.to = to;
    this.toPort = toPort;
  }
}
