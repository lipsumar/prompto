import {
  BlueprintEdge,
  BlueprintGraph,
  DataType,
  ExecutionEngine,
  ExecutionError,
} from '@lipsumar/blueprintjs';
import { BlueprintNodeJSON } from './blueprint-nodes/types';
import getBlueprintNode from './blueprint-nodes/getBlueprintNode';
import { sendEventToUser } from '../middlewares/events';
import { DebugNode } from './blueprint-nodes/DebugNode';

class ChainExecutorManager {
  runs: Record<string, ExecutorRun> = {};

  isRunning(chainId: string) {
    return !!this.runs[chainId];
  }

  async run(
    chainId: string,
    content: string,
    nodeId: string,
    env: Record<string, string>,
    userId: string
  ) {
    const json = JSON.parse(content);
    const graph = new BlueprintGraph();

    json.nodes.forEach((jsonNode: BlueprintNodeJSON) => {
      const node = getBlueprintNode(jsonNode);
      graph.addNode(jsonNode.id, node);
    });
    json.edges.forEach((edge: BlueprintEdge) => {
      graph.addEdge(edge);
    });
    const engine = new ExecutionEngine(graph, env);
    this.runs[chainId] = new ExecutorRun(engine, userId, nodeId, chainId);

    this.runs[chainId].start(() => {
      delete this.runs[chainId];
    });
  }
}

class ExecutorRun {
  engine: ExecutionEngine;
  userId: string;
  nodeId: string;
  status = 'idle';
  chainId: string;

  constructor(
    engine: ExecutionEngine,
    userId: string,
    nodeId: string,
    chainId: string
  ) {
    this.engine = engine;
    this.userId = userId;
    this.nodeId = nodeId;
    this.chainId = chainId;
  }

  async start(done: Function) {
    this.updateStatus('running');
    const boundOnPulse = this.onPulse.bind(this);
    const boundOnNodeInput = this.onNodeInput.bind(this);
    this.engine.on('pulse', boundOnPulse);
    this.engine.on('node-input', boundOnNodeInput);
    try {
      await this.engine.startExecution(this.nodeId);
      this.onEnd();
    } catch (err) {
      const error = err instanceof ExecutionError ? err.toJSON() : `${err}`;
      this.onError(error);
    }
    this.engine.off('pulse', boundOnPulse);
    this.engine.off('node-input', boundOnNodeInput);

    done();
  }

  updateStatus(status: string) {
    this.status = status;
    sendEventToUser(this.userId, {
      chainId: this.chainId,
      status: this.status,
    });
  }

  onPulse({ nodeId }: { nodeId: string }) {
    sendEventToUser(this.userId, {
      type: 'pulse',
      nodeId,
      chainId: this.chainId,
      nodeStates: mapToObject(this.engine.nodeStates),
    });
  }

  onNodeInput({
    nodeId,
    key,
    value,
    dataType,
  }: {
    nodeId: string;
    key: string;
    value: any;
    dataType: DataType;
  }) {
    const node = this.engine.graph.getNode(nodeId);
    if (node instanceof DebugNode) {
      sendEventToUser(this.userId, {
        type: 'node-input',
        chainId: this.chainId,
        nodeId,
        key,
        value,
        dataType,
      });
    }
  }

  onError(error: any) {
    this.status = 'error';
    sendEventToUser(this.userId, {
      chainId: this.chainId,
      status: this.status,
      error,
    });
  }

  onEnd() {
    this.status = 'idle';
    sendEventToUser(this.userId, {
      type: 'done',
      chainId: this.chainId,
      nodeStates: mapToObject(this.engine.nodeStates),
    });
  }
}

function mapToObject(map: Map<string, any>) {
  const obj: Record<string, any> = {};
  for (const entry of map.entries()) {
    obj[entry[0]] = entry[1];
  }
  return obj;
}

const chainExecutorManager = new ChainExecutorManager();
export default chainExecutorManager;
