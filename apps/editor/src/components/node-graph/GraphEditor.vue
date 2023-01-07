<script setup lang="ts">
import GraphViewport from "@/components/node-graph/GraphViewport.vue";
import GraphNode from "@/components/node-graph/GraphNode.vue";
import GraphEdge from "@/components/node-graph/GraphEdge.vue";
import {
  useGraphEditorStore,
  type InitGraphData,
  type GraphData,
} from "../../stores/graphEditor";
import { defineProps, onMounted, ref } from "vue";
import { PlusIcon } from "@heroicons/vue/24/outline";
import invariant from "tiny-invariant";

const props = defineProps<{ graph: InitGraphData }>();
const viewport = ref<InstanceType<typeof GraphViewport>>();

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

onMounted(() => {
  zoomNodes(editorStore.nodes, { scale: 1 });
});
</script>

<template>
  <GraphViewport ref="viewport">
    <GraphEdge
      v-for="edge of editorStore.edges"
      :key="edge.id"
      :edge-id="edge.id"
    />
    <GraphNode
      v-for="node of editorStore.nodes"
      :key="node.id"
      :node-id="node.id"
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
