import { mergeAttributes, Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fileAttachment: {
      setFileAttachment: (attributes: { href: string; name: string; sizeLabel: string }) => ReturnType;
    };
  }
}

/** Downloadable document card (PDF, DOCX…) embedded in a post. */
export const FileAttachment = Node.create({
  name: "fileAttachment",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      href: { default: null },
      name: { default: "Attachment" },
      sizeLabel: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-size") ?? "",
        renderHTML: (attributes) => ({ "data-size": attributes.sizeLabel }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "a.rt-file[href]", getAttrs: (element) => ({ name: element.textContent }) }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { name, ...rest } = HTMLAttributes;
    void name;
    return ["a", mergeAttributes(rest, { class: "rt-file", download: "" }), node.attrs.name as string];
  },

  addCommands() {
    return {
      setFileAttachment:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: attributes }),
    };
  },
});
