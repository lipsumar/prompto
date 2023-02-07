<script setup lang="ts">
import GraphViewport from "@/components/node-graph/GraphViewport.vue";
import GraphNode from "@/components/node-graph/GraphNode.vue";
import GraphEdge from "@/components/node-graph/GraphEdge.vue";
import {
  useGraphEditorStore,
  type InitGraphData,
  type GraphData,
  type GraphPortData,
  type GraphNodeData,
} from "../../stores/graphEditor";
import { defineProps, onMounted, reactive, ref } from "vue";
import { PlusIcon } from "@heroicons/vue/24/outline";
import invariant from "tiny-invariant";
import { createDrag } from "@/lib/drag";
import GraphLine from "./GraphLine.vue";

const props = defineProps<{ graph: InitGraphData }>();
const viewport = ref<InstanceType<typeof GraphViewport>>();
const state = reactive({
  connecting: false,
  connectingEdgeFrom: { x: 0, y: 0 },
});

const editorStore = useGraphEditorStore();
editorStore.init(props.graph);

/**
 * centers the view and zoom on a group nodes
 */
function zoomNodes(
  nodes: GraphData["nodes"],
  opts: { padding?: number; scale: number | null } = {
    padding: 50,
    scale: null,
  }
) {
  if (!nodes || !nodes.length) {
    return;
  }
  const padding = opts.padding || 50;
  const scale = opts.scale;
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  nodes.forEach((node) => {
    if (node.x < left) left = node.x;
    if (node.x + node.width > right) right = node.x + node.width;
    if (node.y < top) top = node.y;
    if (node.y + node.height > bottom) bottom = node.y + node.height;
  });
  viewport.value?.zoomRect(
    {
      left: left - padding,
      top: top - padding,
      right: right + padding,
      bottom: bottom + padding,
    },
    { scale }
  );
}

function addNode() {
  invariant(viewport.value);
  const pan = viewport.value.getPan();
  const scale = viewport.value.getScale();
  editorStore.addNode({
    id: "new",
    x: (50 - pan.x) / scale,
    y: (50 - pan.y) / scale,
    inputs: ["something"],
    outputs: ["default"],
  });
  console.log("added");
}

const { drag: connectingEdgeTo, startDrag } = createDrag({});
const connectingEdgeOnPort = ref<GraphPortData | null>(null);
function inBbox(
  pos: { x: number; y: number },
  bbox: { x: number; y: number; width: number; height: number }
) {
  return (
    pos.x >= bbox.x &&
    pos.x <= bbox.x + bbox.width &&
    pos.y >= bbox.y &&
    pos.y <= bbox.y + bbox.height
  );
}
function startConnect(opts: {
  port: string;
  pos: { x: number; y: number };
  client: { x: number; y: number };
  node: GraphNodeData;
}) {
  invariant(viewport.value);
  state.connecting = true;
  state.connectingEdgeFrom.x = opts.pos.x;
  state.connectingEdgeFrom.y = opts.pos.y;
  startDrag({
    pos: { ...opts.pos },
    client: { ...opts.client },
    zoom: viewport.value.getScale(),
    onFinish() {
      console.log("its finished");
      state.connecting = false;
      if (connectingEdgeOnPort.value) {
        editorStore.addEdge({
          from: opts.node.id,
          fromPort: opts.port,
          to: connectingEdgeOnPort.value.node.id,
          toPort: connectingEdgeOnPort.value.port,
        });
      }
      connectingEdgeOnPort.value = null;
    },
    onDrag() {
      const { x, y } = connectingEdgeTo.pos;
      const portHover = editorStore.ports.find((port) => {
        return inBbox({ x, y }, port.bbox);
      });
      connectingEdgeOnPort.value = portHover || null;
    },
  });
}

onMounted(() => {
  zoomNodes(editorStore.nodes, { scale: 1 });
});
</script>

<template>
  <GraphViewport ref="viewport">
    <GraphLine
      v-if="state.connecting"
      :x1="state.connectingEdgeFrom.x"
      :y1="state.connectingEdgeFrom.y"
      :x2="connectingEdgeTo.pos.x"
      :y2="connectingEdgeTo.pos.y"
      :interactive="false"
    />
    <GraphEdge
      v-for="edge of editorStore.edges"
      :key="edge.id"
      :edge-id="edge.id"
    />
    <GraphNode
      v-for="node of editorStore.nodes"
      :key="node.id"
      :node-id="node.id"
      @start-connect="startConnect"
    >
      <div class="font-bold">Node {{ node.id }}</div>
      <!-- <select
        @click.stop="f"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1"
      >
        <option value="foo">foo</option>
        <option value="bar">bar</option>
      </select> -->
    </GraphNode>
  </GraphViewport>

  <button
    class="absolute top-2 left-2 w-8 h-8 flex items-center justify-center bg-white shadow rounded"
    @click="addNode"
  >
    <PlusIcon class="w-4 h-4" />
  </button>
</template>
