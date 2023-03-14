<script setup lang="ts">
import { trpc } from "@/trpc";
import { UserCircleIcon } from "@heroicons/vue/24/solid";
import { onMounted, reactive } from "vue";

const state = reactive({
  email: "",
  gpt3ApiToken: "",
  huggingFaceApiToken: "",
  isOpen: false,
});

onMounted(() => {
  trpc.user.getCurrent.query().then((user) => {
    state.email = user.email;
    state.gpt3ApiToken = user.gpt3ApiToken || "";
    state.huggingFaceApiToken = user.huggingFaceApiToken || "";
  });
});

function save() {
  trpc.user.updateCurrent
    .mutate({
      gpt3ApiToken: state.gpt3ApiToken,
      huggingFaceApiToken: state.huggingFaceApiToken,
    })
    .then(() => {
      state.isOpen = false;
    });
}
</script>
<template>
  <div
    class="px-4 py-3 bg-slate-500 cursor-pointer"
    @click="state.isOpen = true"
  >
    <div class="flex items-center">
      <UserCircleIcon class="w-8 h-8" />
      <div class="pl-2">
        <div class="font-semibold">User settings</div>
        <div class="text-sm">{{ state.email }}</div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div
      v-if="state.isOpen"
      @click="state.isOpen = false"
      class="fixed top-0 right-0 bottom-0 left-0 bg-white bg-opacity-30 flex items-center justify-center"
    >
      <div
        class="p-8 bg-white rounded-xl border border-gray-500 shadow-xl"
        @click.stop
      >
        <label class="block mb-6">
          <span class="text-gray-700">OpenAI API key</span>
          <input
            type="text"
            class="form-input w-full mt-1 rounded-md border-gray-30 p-2"
            v-model="state.gpt3ApiToken"
          />
        </label>

        <label class="block mb-6">
          <span class="text-gray-700">HuggingFace API key</span>
          <input
            type="text"
            class="form-input w-full mt-1 rounded-md border-gray-30 p-2"
            v-model="state.huggingFaceApiToken"
          />
        </label>

        <button
          class="bg-blue-500 text-white px-4 py-2 rounded"
          @click="save()"
        >
          Save
        </button>
      </div>
    </div>
  </Teleport>
</template>
