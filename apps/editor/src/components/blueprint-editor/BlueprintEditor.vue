<script setup lang="ts">
import BlueprintGraph from "@/blueprint-graph";
import invariant from "tiny-invariant";
import { onMounted, onUnmounted, reactive } from "vue";
import {
  allNodes,
  type BlueprintPort,
  type BlueprintNodeJSON,
  type DataType,
} from "api";

import NodeInspector from "./NodeInspector.vue";
import BlueprintToolBar from "./BlueprintToolBar.vue";
import { trpc } from "@/trpc";
import { useCurrentChainStore } from "@/stores/currentChain";

const contextMenu = reactive({ x: 0, y: 0, show: false, stageX: 0, stageY: 0 });
const inspector = reactive<{
  show: boolean;
  nodeId: string | null;
  dataInputs: BlueprintPort[];
  selfInputs: Record<string, any>;
  allowUserCreatedDataInputs: DataType[] | null;
}>({
  show: false,
  nodeId: null,
  dataInputs: [],
  selfInputs: {},
  allowUserCreatedDataInputs: null,
});
const currentChainStore = useCurrentChainStore();

const evtSource = new EventSource(`${import.meta.env.VITE_API_URL}/events`, {
  withCredentials: true,
});
evtSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
  if (data.type === "pulse" || data.type === "done") {
    blueprintGraph.updateNodeStates(data.nodeStates);
  }
  if (data.type === "node-input") {
    blueprintGraph.getNode(data.nodeId).setInput(data.key, data.value);
  }
};

let blueprintGraph: BlueprintGraph;
onMounted(() => {
  var container = document.querySelector<HTMLDivElement>("#konva-stage");
  invariant(container);

  blueprintGraph = new BlueprintGraph(container, {
    onContextMenu({ x, y }, stagePos) {
      contextMenu.show = true;
      contextMenu.x = x;
      contextMenu.y = y;
      contextMenu.stageX = stagePos.x;
      contextMenu.stageY = stagePos.y;
    },
    onClick() {
      contextMenu.show = false;
      inspector.show = false;
    },
    openInspector(nodeId) {
      inspector.show = true;
      inspector.nodeId = nodeId;
      inspector.dataInputs = [
        ...blueprintGraph.getNode(nodeId).node.dataInputs,
      ];
      inspector.selfInputs = {
        ...blueprintGraph.getNode(nodeId).node.selfInputs,
      };
      inspector.allowUserCreatedDataInputs =
        blueprintGraph.getNode(nodeId).node.allowUserCreatedDataInputs || null;
    },
    onRun(nodeId) {
      invariant(currentChainStore.chain);
      const json = blueprintGraph.toJSON();
      trpc.chain.run
        .mutate({
          content: JSON.stringify(json),
          id: currentChainStore.chain.id,
          nodeId,
        })
        .then((resp) => {
          console.log(resp);
          // currentChainStore.addRun(chainRun);
          // state.running = false;
          // editorStore.setChainRun(JSON.parse(chainRun.content));
        });
    },
  });

  const graph = currentChainStore.graph;
  invariant(graph);
  if (graph.nodes) {
    graph.nodes.forEach((node) => {
      blueprintGraph.addNode(node);
    });
  }
  if (graph.edges) {
    graph.edges.forEach((edge) => {
      blueprintGraph.addEdge(edge);
    });
  }
});

onUnmounted(() => {
  evtSource.close();
});

function setSelfInput(nodeId: string, key: string, value: any) {
  blueprintGraph.getNode(nodeId).setSelfInput(key, value);
}

function makeid(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function addNode(type: string) {
  const id = makeid(5);
  const schema = allNodes.find((n) => n.type === type);
  invariant(schema);
  const node = {
    selfInputs: {},
    ...schema,
    id,
    x: contextMenu.stageX,
    y: contextMenu.stageY,
  };
  blueprintGraph.addNode(node as BlueprintNodeJSON);
  contextMenu.show = false;
}

function save() {
  invariant(currentChainStore.chain);
  const json = blueprintGraph.toJSON();
  trpc.chain.update.mutate({
    id: currentChainStore.chain.id,
    content: JSON.stringify(json),
  });
}

function createNewInput({
  nodeId,
  dataType,
  name,
}: {
  nodeId: string;
  dataType: DataType;
  name: string;
}) {
  blueprintGraph.getNode(nodeId).createNewInput(name, dataType);
  inspector.dataInputs = [...blueprintGraph.getNode(nodeId).node.dataInputs];
}
</script>
<template>
  <div class="relative w-full h-full">
    <div id="konva-stage" class="w-full h-full"></div>
    <BlueprintToolBar @save="save" />
    <div
      v-if="inspector.show && inspector.nodeId"
      class="absolute right-3 top-3 bottom-3 w-96"
    >
      <NodeInspector
        :nodeId="inspector.nodeId"
        :dataInputs="inspector.dataInputs"
        :selfInputs="inspector.selfInputs"
        :allowUserCreatedDataInputs="inspector.allowUserCreatedDataInputs"
        @createNewInput="createNewInput($event)"
        @setSelfInput="setSelfInput($event.nodeId, $event.key, $event.value)"
      />
    </div>
    <div
      class="absolute p-3 rounded shadow-lg bg-white"
      :class="{
        block: contextMenu.show,
        hidden: !contextMenu.show,
      }"
      :style="{
        top: `${contextMenu.y}px`,
        left: `${contextMenu.x}px`,
      }"
    >
      <div
        v-for="node of allNodes"
        :key="node.type"
        @click="addNode(node.type)"
        class="cursor-pointer"
      >
        {{ node.type }}
      </div>
    </div>
  </div>
</template>
