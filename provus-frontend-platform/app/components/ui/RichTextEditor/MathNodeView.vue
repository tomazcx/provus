<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3";
import katex from "katex";

const props = defineProps(nodeViewProps);

const isEditing = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const renderedLatex = computed(() => {
  try {
    return katex.renderToString(props.node.attrs.latex || "E = mc^2", {
      throwOnError: false,
    });
  } catch {
    return `<span class="text-red-500">Erro na fórmula</span>`;
  }
});

function enableEditing() {
  if (!props.editor.isEditable) return;
  isEditing.value = true;
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function disableEditing() {
  isEditing.value = false;
  if (!props.node.attrs.latex) {
    props.deleteNode();
  }
}

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  props.updateAttributes({ latex: value });
}
</script>

<template>
  <NodeViewWrapper class="inline-block mx-1 align-middle">
    <div v-if="isEditing" class="flex items-center">
      <span class="text-gray-400 font-mono text-xs mr-1">$</span>
      <input
        ref="inputRef"
        :value="node.attrs.latex"
        class="bg-gray-100 dark:bg-gray-800 border border-primary-500 rounded px-1 py-0.5 text-sm font-mono focus:outline-none min-w-[50px]"
        @input="onInput"
        @blur="disableEditing"
        @keydown.enter.prevent="disableEditing"
      />
      <span class="text-gray-400 font-mono text-xs ml-1">$</span>
    </div>

    <div
      v-else
      class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1 transition-colors select-none"
      :class="{ 'ring-2 ring-primary-500 rounded': selected }"
      @click="enableEditing"
      v-html="renderedLatex"
    />
  </NodeViewWrapper>
</template>
