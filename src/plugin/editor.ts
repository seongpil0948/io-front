import { onMounted } from "vue";
import { ref } from "vue";
import EditorJS, { API, OutputData } from "@editorjs/editorjs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Header from "@editorjs/header";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import List from "@editorjs/list";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Table from "@editorjs/table";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Embed from "@editorjs/embed";
import { uuidv4 } from "@firebase/util";

export interface IoEditorParam {
  readOnly: boolean;
  elementId: string;
  onChange?: (api: API, event: CustomEvent<any>) => void;
  placeholder: string;
  data?: OutputData | string;
}

export function useEditor(c: IoEditorParam) {
  const editor = ref<EditorJS | null>(null);
  onMounted(() => {
    editor.value = getEditor(c);
  });
  async function toggleEditor() {
    if (editor.value) {
      await editor.value.readOnly.toggle();
    }
  }
  function clearEditor() {
    if (editor.value) {
      editor.value.clear();
    }
  }
  async function saveEditor() {
    try {
      if (editor.value) {
        const info = await editor.value.save();
        return info.blocks.length > 0 ? info : undefined;
      }
    } catch (error) {
      console.error(null, "fail to saving editorJs, error:", error);
    }
  }

  return { editor, saveEditor, clearEditor, getEditor, toggleEditor };
}

export function getEditor(c: IoEditorParam) {
  let data: OutputData | undefined = undefined;
  if (typeof c.data === "string") {
    const date = new Date();
    data = {
      time: date.valueOf(),
      version: "2.25.0",
      blocks: c.data.split(/\r?\n/).map((text) => ({
        data: { text },
        id: uuidv4(),
        type: "paragraph",
      })),
    };
  } else if (c.data) {
    data = c.data;
  }
  const _editor = new EditorJS({
    data,
    readOnly: c.readOnly,
    holder: c.elementId,
    placeholder: c.placeholder,
    onChange: c.onChange,
    minHeight: 100,
    // inlineToolbar: ["bold", "italic", "underline"],
    tools: {
      list: List,
      table: Table,
      header: Header,
      embed: {
        class: Embed,
        inlineToolbar: true,
        // config: {
        //   services: {
        //     youtube: true,
        //     coub: true,
        //   },
        // },
      },
    },
  });
  return _editor;
}
