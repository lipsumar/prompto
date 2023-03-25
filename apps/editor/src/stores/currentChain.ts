import { defineStore } from "pinia";
import { trpc } from "@/trpc";
import type { GraphData } from "./graphEditor";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter, BlueprintEdge, BlueprintNodeJSON } from "api";
import { ref } from "vue";
import invariant from "tiny-invariant";
import type { ExecuteResults } from "langgraph/dist/types";

type Chain = inferRouterOutputs<AppRouter>["chain"]["get"];
type ChainRun = inferRouterOutputs<AppRouter>["chain"]["run"];

type Run = { number: number; results: ExecuteResults; date: Date };
type GraphJSON = { nodes: BlueprintNodeJSON[]; edges: BlueprintEdge[] };

function chainRunToRun(chainRun: ChainRun) {
  return {
    number: chainRun.number,
    results: JSON.parse(chainRun.content),
    date: new Date(chainRun.createdAt),
  };
}

export const useCurrentChainStore = defineStore("currentChain", () => {
  const chain = ref<Chain | null>(null);
  const graph = ref<GraphJSON | null>(null);
  const runs = ref<Run[]>([]);
  return {
    chain,
    graph,
    runs,
    addRun(chainRun: ChainRun) {
      runs.value.unshift(chainRunToRun(chainRun));
    },
    async setChain(chainId: string) {
      chain.value = null;
      graph.value = null;
      const chainData = await trpc.chain.get.query({ id: chainId });
      if (!chainData) {
        throw new Error("cant find chain id" + chainId);
      }
      //console.log({ chainData });
      chain.value = chainData;
      const graphData = JSON.parse(chainData.content);
      // if (!graphData.nodes) {
      //   const newGraph = getNewGraph();
      //   graphData = newGraph;
      // } else {
      //   const chainRuns = await trpc.chain.getRuns.query({ id: chainId });
      //   runs.value = chainRuns.map(chainRunToRun);
      // }
      graph.value = graphData;
    },
    async save(newGraph: any) {
      invariant(chain.value);
      return trpc.chain.update
        .mutate({
          id: chain.value.id,
          content: JSON.stringify(newGraph),
        })
        .then(() => {
          graph.value = newGraph;
        });
    },
  };
});
