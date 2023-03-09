import { ref } from "vue";
import { defineStore } from "pinia";
import { useCurrentPromptStore } from "./currentPrompt";
import { useGraphEditorStore } from "./graphEditor";
import { useCurrentChainStore } from "./currentChain";
import { useCurrentUserFolderStore } from "./currentUserFolder";

type Element = {
  type: "prompt" | "chain" | "userFolder";
  id: string;
};

export const useEditorStore = defineStore("editor", () => {
  const currentPromptStore = useCurrentPromptStore();
  const currentChainStore = useCurrentChainStore();
  const currentUserFolderStore = useCurrentUserFolderStore();
  const activeElement = ref<Element | null>(null);
  function setActiveElement(element: Element) {
    activeElement.value = element;
    if (element.type === "prompt") {
      currentPromptStore.setPrompt(element.id);
    }
    if (element.type === "chain") {
      currentChainStore.setChain(element.id);
    }
    if (element.type === "userFolder") {
      console.log("->set");
      currentUserFolderStore.setUserFolder(element.id);
    }
  }

  function reset() {
    activeElement.value = null;
    currentPromptStore.reset();
  }

  return { activeElement, setActiveElement, reset };
});
