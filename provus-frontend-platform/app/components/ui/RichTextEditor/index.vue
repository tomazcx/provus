<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import MathExtension from "./MathExtension";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
    minHeight?: string;
  }>(),
  {
    modelValue: "",
    placeholder: "",
    disabled: false,
    minHeight: "min-h-[120px]",
  }
);
const emit = defineEmits(["update:modelValue", "blur"]);

const editor = useEditor({
  content: props.modelValue,
  extensions: [StarterKit, MathExtension],
  editable: !props.disabled,
  editorProps: {
    attributes: {
      class: `prose prose-sm max-w-none w-full focus:outline-none rounded-b-md ${
        props.disabled
          ? ""
          : `${props.minHeight} resize-y overflow-auto max-h-[600px]`
      }`,
    },
  },
  onUpdate: ({ editor }) => {
    emit("update:modelValue", editor.getHTML());
  },
  onBlur: () => {
    emit("blur");
  },
});

watch(
  () => props.modelValue,
  (newValue) => {
    const isSame = editor.value?.getHTML() === newValue;
    if (!isSame && editor.value) {
      editor.value.commands.setContent(newValue || "", { emitUpdate: false });
    }
  }
);

watch(
  () => props.disabled,
  (val) => {
    editor.value?.setEditable(!val);
  }
);

function addMath() {
  if (editor.value) {
    editor.value
      .chain()
      .focus()
      .insertContent({ type: "math", attrs: { latex: "" } })
      .run();
  }
}

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<template>
  <div
    class="rounded-md overflow-hidden transition-all"
    :class="
      disabled
        ? 'border-none bg-transparent'
        : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
    "
  >
    <div
      v-if="editor && !disabled"
      class="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1.5"
    >
      <UButton
        icon="i-lucide-bold"
        size="xs"
        variant="ghost"
        color="primary"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      />
      <UButton
        icon="i-lucide-italic"
        size="xs"
        variant="ghost"
        color="primary"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      />
      <div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
      <UButton
        icon="i-lucide-list"
        size="xs"
        variant="ghost"
        color="primary"
        :class="{
          'bg-gray-200 dark:bg-gray-700': editor.isActive('bulletList'),
        }"
        @click="editor.chain().focus().toggleBulletList().run()"
      />
      <UButton
        icon="i-lucide-list-ordered"
        size="xs"
        variant="ghost"
        color="primary"
        :class="{
          'bg-gray-200 dark:bg-gray-700': editor.isActive('orderedList'),
        }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      />
      <div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
      <UTooltip text="Inserir Fórmula (LaTeX)">
        <UButton
          icon="i-lucide-sigma"
          size="xs"
          variant="ghost"
          color="primary"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('math') }"
          @click="addMath"
        />
      </UTooltip>
      <div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
      <UButton
        icon="i-lucide-undo"
        size="xs"
        variant="ghost"
        color="primary"
        :disabled="!editor.can().undo()"
        @click="editor.chain().focus().undo().run()"
      />
      <UButton
        icon="i-lucide-redo"
        size="xs"
        variant="ghost"
        color="primary"
        :disabled="!editor.can().redo()"
        @click="editor.chain().focus().redo().run()"
      />
    </div>

    <EditorContent :editor="editor" class="cursor-text" />
  </div>
</template>

<style>
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

.ProseMirror:focus {
  outline: none;
}

.ProseMirror[contenteditable="false"] span[data-type="math"] {
  cursor: default;
}

.cursor-text {
  padding: 12px;
}
</style>
