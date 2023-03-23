<script setup lang="ts">
import BlueprintGraph from "@/blueprint-graph";
import invariant from "tiny-invariant";
import { onMounted, reactive } from "vue";
import { allNodes, type BlueprintNode, type BlueprintNodeJSON } from "api";

const contextMenu = reactive({ x: 0, y: 0, show: false, stageX: 0, stageY: 0 });
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
    },
  });
  // blueprintGraph.addNode({
  //   id: "complete",
  //   type: "text-completion",
  //   x: 100,
  //   y: 100,
  //   flowInputs: ["exec"],
  //   flowOutputs: ["done"],
  //   dataInputs: [{ key: "prompt", dataType: "string", isArray: false }],
  //   dataOutputs: [{ key: "text", dataType: "string", isArray: false }],
  // });
  // blueprintGraph.addNode({
  //   id: "complete2",
  //   type: "text-completion2",
  //   x: 600,
  //   y: 400,
  //   flowInputs: ["exec"],
  //   flowOutputs: ["done"],
  //   dataInputs: [{ key: "prompt", dataType: "string", isArray: false }],
  //   dataOutputs: [{ key: "text", dataType: "string", isArray: false }],
  // });

  // blueprintGraph.addNode({
  //   id: "loop",
  //   type: "loop",
  //   x: 400,
  //   y: 200,
  //   flowInputs: ["exec"],
  //   flowOutputs: ["body", "done"],
  //   dataInputs: [],
  //   dataOutputs: [],
  // });

  // blueprintGraph.addNode({
  //   id: "loop2",
  //   type: "loop",
  //   x: 800,
  //   y: 180,
  //   flowInputs: ["exec"],
  //   flowOutputs: ["body", "done"],
  //   dataInputs: [],
  //   dataOutputs: [],
  // });

  // blueprintGraph.addEdge({
  //   fromId: "complete",
  //   fromKey: "done",
  //   toId: "loop",
  //   toKey: "exec",
  // });
});

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
    ...schema,
    id,
    x: contextMenu.stageX,
    y: contextMenu.stageY,
  };
  blueprintGraph.addNode(node as BlueprintNodeJSON);
  contextMenu.show = false;
}
</script>
<template>
  <div class="relative w-full h-full">
    <div id="konva-stage" class="w-full h-full"></div>
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
      >
        {{ node.type }}
      </div>
    </div>
  </div>
</template>
