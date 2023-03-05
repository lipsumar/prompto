import { ref } from "vue";
import { defineStore } from "pinia";
import { useCurrentPromptStore } from "./currentPrompt";
import { useGraphEditorStore } from "./graphEditor";
import { useCurrentChainStore } from "./currentChain";

type Element = {
  type: "prompt" | "chain";
  id: string;
};

export const useEditorStore = defineStore("editor", () => {
  const currentPromptStore = useCurrentPromptStore();
  const currentChainStore = useCurrentChainStore();
  const activeElement = ref<Element | null>(null);
  function setActiveElement(element: Element) {
    activeElement.value = element;
    if (element.type === "prompt") {
      currentPromptStore.setPrompt(element.id);
    }
    if (element.type === "chain") {
      currentChainStore.setChain(element.id);
    }
  }

  function reset() {
    activeElement.value = null;
    currentPromptStore.reset();
  }

  return { activeElement, setActiveElement, reset };
});
