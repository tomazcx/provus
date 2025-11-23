import { Node, mergeAttributes } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import MathNodeView from "./MathNodeView.vue";

export default Node.create({
  name: "math",

  group: "inline",

  inline: true,

  atom: true,

  addAttributes() {
    return {
      latex: {
        default: "x",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-type": "math" })];
  },

  addNodeView() {
    return VueNodeViewRenderer(MathNodeView);
  },
});
