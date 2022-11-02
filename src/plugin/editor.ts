import { onMounted } from "vue";
import { ref } from "vue";
import EditorJS, { API } from "@editorjs/editorjs";
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
import YoutubeEmbed from "editorjs-youtube-embed";

export interface IoEditorParam {
  readOnly: boolean;
  elementId: string;
  onChange?: (api: API, event: CustomEvent<any>) => void;
  placeholder: string;
  data?: any;
}

export function useEditor(c: IoEditorParam) {
  const editor = ref<EditorJS | null>(null);

  onMounted(() => {
    editor.value = getEditor(c);
  });
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

  return { editor, saveEditor, clearEditor, getEditor };
}

export function getEditor(c: IoEditorParam) {
  console.log("editor param", c);
  const _editor = new EditorJS({
    data:
      c.data && c.data.blocks && c.data.blocks.length > 0 ? c.data : undefined,
    readOnly: c.readOnly,
    holder: c.elementId,
    placeholder: c.placeholder,
    onChange: c.onChange,
    // inlineToolbar: ["bold", "italic", "underline"],
    tools: {
      list: List,
      table: Table,
      header: Header,
      youtubeEmbed: YoutubeEmbed,
    },
  });
  return _editor;
}
