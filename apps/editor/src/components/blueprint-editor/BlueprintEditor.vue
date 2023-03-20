<script setup lang="ts">
import BlueprintGraph from "@/blueprint-graph";
import invariant from "tiny-invariant";
import { onMounted } from "vue";

onMounted(() => {
  var container = document.querySelector<HTMLDivElement>("#konva-stage");
  invariant(container);

  const blueprintGraph = new BlueprintGraph(container);
  blueprintGraph.addNode({
    type: "text-completion",
    x: 100,
    y: 100,
    flowInputs: ["exec"],
    flowOutputs: ["done"],
  });

  blueprintGraph.addNode({
    type: "loop",
    x: 400,
    y: 200,
    flowInputs: ["exec"],
    flowOutputs: ["body", "done"],
  });
});
</script>
<template>
  <div id="konva-stage" class="w-full h-full"></div>
</template>
