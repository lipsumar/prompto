<script setup lang="ts">
import ProjectCard from "@/components/ProjectCard.vue";
import { trpc } from "@/trpc";
import { PlusSmallIcon } from "@heroicons/vue/20/solid";
import { useQuery } from "vue-query";

const { data, isLoading } = useQuery("project.forUser", () =>
  trpc.project.forUser.query()
);
</script>

<template>
  <main>
    <div class="container mx-auto max-w-screen-md">
      <h1 class="text-center text-3xl my-20">Projects</h1>
      <div v-if="isLoading">Loading...</div>
      <ul class="grid grid-cols-3 gap-4">
        <li v-for="project in data" :key="project.id">
          <ProjectCard :title="project.name" :project-id="project.id" />
        </li>

        <li class="flex">
          <div
            class="rounded p-3 border-dashed border-2 border-slate-300 w-full flex flex-col justify-center items-center text-sm hover:border-blue-500 hover:border-solid hover:bg-white hover:text-blue-500 cursor-pointer group"
          >
            <PlusSmallIcon
              class="h-6 w-6 text-slate-400 group-hover:text-blue-500"
            />
            New project
          </div>
        </li>
      </ul>
    </div>
  </main>
</template>
