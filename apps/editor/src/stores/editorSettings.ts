import { ref } from "vue";
import { defineStore } from "pinia";

type EditorLayout = "page" | "split-horizontal";

export const useEditorSettingsStore = defineStore("editorSettings", () => {
  const editorLayout = ref<EditorLayout>("page");
  function setEditorLayout(layout: EditorLayout) {
    editorLayout.value = layout;
  }

  return { editorLayout, setEditorLayout };
});
