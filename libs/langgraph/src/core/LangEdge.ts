import LangNode from './LangNode';

export default class LangEdge {
  from: LangNode;
  to: LangNode;
  id: string;
  fromPort: string;
  toPort: string;

  constructor(
    id: string,
    from: LangNode,
    fromPort: string,
    to: LangNode,
    toPort: string
  ) {
    this.id = id;
    this.from = from;
    this.fromPort = fromPort;
    this.to = to;
    this.toPort = toPort;
  }
}
