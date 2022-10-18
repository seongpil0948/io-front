import { onMounted } from "vue";
import { ref, onBeforeUnmount } from "vue";
import { logger } from "./logger";
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

// _editor.isReady
//   .then(() => {
//     const msg = "Editor.js is ready to work!";
//     logger.debug(null, msg);
//     console.log(null, msg);
//   })
//   .catch((reason) => {
//     const msg = `Editor.js initialization failed because of ${reason}`;
//     logger.error(null, msg);
//     console.error(null, msg);
//   });
interface IoEditorParam {
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

  onBeforeUnmount(() => {
    if (editor.value) {
      editor.value.clear();
      editor.value.destroy();
      // editor.value.off();
    }
  });
  function clearEditor() {
    if (editor.value) {
      editor.value.clear();
    }
  }
  async function saveEditor() {
    try {
      if (editor.value) {
        return await editor.value.save();
      }
    } catch (error) {
      logger.error(null, "fail to saving editorJs, error:", error);
    }
  }

  return { editor, saveEditor, clearEditor };
}

export function getEditor(c: IoEditorParam) {
  const _editor = new EditorJS({
    data: c.data,
    readOnly: c.readOnly,
    holder: c.elementId,
    placeholder: c.placeholder,
    onChange: c.onChange,
    // inlineToolbar: ["bold", "italic", "underline"],
    tools: {
      list: List,
      table: Table,
      header: Header,
    },
  });
  return _editor;
}
