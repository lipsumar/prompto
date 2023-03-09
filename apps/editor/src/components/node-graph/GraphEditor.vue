<script setup lang="ts">
import GraphViewport from "@/components/node-graph/GraphViewport.vue";
import GraphNode from "@/components/node-graph/GraphNode.vue";
import GraphEdge from "@/components/node-graph/GraphEdge.vue";
import {
  useGraphEditorStore,
  type GraphData,
  type GraphPortData,
  type GraphNodeData,
  type GraphNodeDataWithUi,
} from "../../stores/graphEditor";
import { defineProps, onMounted, onUnmounted, reactive, ref } from "vue";
import { PlusIcon } from "@heroicons/vue/24/outline";
import invariant from "tiny-invariant";
import { createDrag } from "@/lib/drag";
import GraphLine from "./GraphLine.vue";

const props = defineProps<{ graph: GraphData; runDisabled: boolean }>();
const emits = defineEmits<{
  (e: "run", graph: GraphData, nodeId: string): void;
  (e: "save", graph: GraphData): void;
}>();
const viewport = ref<InstanceType<typeof GraphViewport>>();
const state = reactive({
  connecting: false,
  connectingEdgeFrom: { x: 0, y: 0 },
  addMenuOpen: false,
});

const allNodes = [
  { name: "LLM", type: "llm" as const },
  { name: "Input", type: "input" as const },
  { name: "Text", type: "text" as const },
  { name: "Image", type: "image" as const },
  { name: "Image generator", type: "image-generator" as const },
  { name: "List splitter", type: "list-splitter" as const },
  { name: "Loop", type: "loop" as const },
  { name: "Folder", type: "folder" as const },
];

const editorStore = useGraphEditorStore();
editorStore.init(props.graph);

const evtSource = new EventSource(`${import.meta.env.VITE_API_URL}/events`, {
  withCredentials: true,
});
evtSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(event, data);
  if (data.type === "nodesStatus") {
    editorStore.updateNodesStatus(data.nodesStatus);
  }
};
onUnmounted(() => {
  evtSource.close();
});

/**
 * centers the view and zoom on a group nodes
 */
function zoomNodes(
  nodes: GraphNodeDataWithUi[],
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

function addNode(
  type:
    | "llm"
    | "input"
    | "text"
    | "image"
    | "image-generator"
    | "list-splitter"
    | "loop"
    | "folder"
) {
  invariant(viewport.value);
  const pan = viewport.value.getPan();
  const scale = viewport.value.getScale();

  const base = {
    id: Math.random().toString().substr(-6),
    x: (50 - pan.x) / scale,
    y: (50 - pan.y) / scale,
    inputs: {},
    outputs: { default: "string" as const },
  };
  let node;
  if (type === "llm") {
    node = {
      ...base,
      type,
      inputs: { default: "string" as const },
      config: { text: "", model: "text-davinci-003" },
    };
  } else if (type === "text") {
    node = {
      ...base,
      type,
      config: { text: "" },
      inputs: { default: "string" as const },
    };
  } else if (type === "image") {
    node = {
      ...base,
      type,
      config: { image: "" },
      inputs: { default: "string" as const },
    };
  } else if (type === "image-generator") {
    node = { ...base, type, config: {}, inputs: { default: "image" as const } };
  } else if (type === "list-splitter") {
    node = { ...base, type, config: {}, inputs: { default: "list" as const } };
  } else if (type === "loop") {
    node = { ...base, type, config: {}, inputs: { default: "list" as const } };
  } else if (type === "folder") {
    node = {
      ...base,
      type,
      config: {
        folderId: "clf129kur000106zw7zxw7jow",
      },
      inputs: { default: "string" as const },
      outputs: {},
    };
  } else {
    node = { ...base, type, config: { inputKey: "", defaultValue: "" } };
  }
  editorStore.addNode(node);
}

function deleteNode(nodeId: string) {
  editorStore.removeNode(nodeId);
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
          id: Math.random().toString(), //@todo
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
      // may we connect to this port ?
      if (portHover?.edge) {
        return;
      }

      connectingEdgeOnPort.value = portHover || null;
    },
  });
}

function executeNode(nodeId: string) {
  emits("run", editorStore.getGraph(), nodeId);
}
function save() {
  emits("save", editorStore.getGraph());
}

onMounted(() => {
  zoomNodes(editorStore.nodes, { scale: 1 });
});
</script>

<template>
  <GraphViewport ref="viewport" @click="editorStore.selectNode(null)">
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
      @delete="deleteNode(node.id)"
      @execute="executeNode(node.id)"
    >
      <div
        class="absolute right-0 top-0 font-mono px-2 py-1 bg-sky-100 rounded-bl rounded-tr-lg text-xs"
      >
        {{ node.id }}
      </div>
      <div class="font-bold" v-if="node.type !== 'llm'">{{ node.type }}</div>

      <div v-if="node.type === 'input'">{{ node.config.inputKey }}</div>
      <div v-if="node.type === 'llm'" class="text-lg text-center pt-8">LLM</div>
      <div v-if="node.type === 'text'" class="text-md line-clamp-12">
        {{ node.config.text }}
      </div>
      <div v-if="node.type === 'image'">
        <img
          v-if="node.config.image"
          :src="node.config.image"
          class="object-contain"
          width="512"
          height="512"
        />
      </div>
    </GraphNode>
  </GraphViewport>

  <div class="absolute top-2 left-2 flex space-x-2">
    <button
      class="w-8 h-8 flex items-center justify-center bg-white shadow rounded"
      @click="state.addMenuOpen = !state.addMenuOpen"
    >
      <PlusIcon class="w-4 h-4" />
    </button>
    <button
      class="px-3 h-8 flex items-center justify-center bg-white shadow rounded"
      @click="save"
    >
      Save
    </button>
  </div>

  <div
    v-if="state.addMenuOpen"
    v-click-outside="
      () => {
        state.addMenuOpen = false;
      }
    "
    class="absolute top-11 left-2 w-48 z-10 bg-slate-50 p-1 border rounded-md shadow-md text-slate-800 text-left"
  >
    <div
      v-for="node of allNodes"
      :key="node.type"
      class="flex text-sm items-center px-2 py-1 hover:bg-slate-100 rounded-lg w-full"
      @click="
        () => {
          addNode(node.type);
          state.addMenuOpen = false;
        }
      "
    >
      {{ node.name }}
    </div>
  </div>
</template>
