<script setup lang="ts">
import { ChevronDownIcon } from "@heroicons/vue/20/solid";
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<template>
  <div class="min-h-screen">
    <div class="h-[60vh]">
      <div class="px-20 pt-6 h-full">
        <div
          class="bg-slate-50 h-full rounded-t-lg shadow-md p-8 pb-0 flex flex-col"
        >
          <textarea
            class="bg-transparent w-full h-full resize-none focus:outline-none text-lg"
          >
This is the prompt text
a new line</textarea
          >
          <div class="py-2">
            <button
              class="bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="h-[40vh] bg-slate-800 text-slate-100 p-4">
      <div class="p-2 bg-slate-600 rounded flex mb-2">
        <div class="pr-2">
          <ChevronDownIcon class="w-4 h-4 mt-1" />
        </div>
        <div>some completion text</div>
      </div>
      <div class="p-2 bg-slate-600 rounded flex">
        <div class="pr-2">
          <ChevronDownIcon class="w-4 h-4 mt-1" />
        </div>
        <div>another completion text that is a bit longer</div>
      </div>
    </div>
  </div>
</template>
