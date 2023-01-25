import { Ref, ref } from "vue";

export interface FileReaderParam {
  inputRef: Ref<null | HTMLInputElement>;
  readMethod: "binary" | "array" | "url" | "text";
  onLoad: (ev: ProgressEvent<FileReader>, file: File) => any;
  beforeRead: () => void;
}
export function useFileReader(d: FileReaderParam) {
  const progress = ref({
    percent: 0,
    proceed: 0,
  });
  function reset() {
    console.info("useFileReader reset");
    progress.value.proceed = 0;
    progress.value.percent = 0;
    fileModel.value = [];
  }

  const fileModel = ref<File[]>([]);
  async function handleFileChange(evt: Event) {
    console.log("handleFileChange: ", evt);
    const element = evt.currentTarget as HTMLInputElement;
    if (!element.files) return;
    reset();
    for (const file of element.files) {
      const reader = new FileReader();
      // progress.value.percent = 0
      reader.addEventListener("load", (event) => d.onLoad(event, file));
      reader.addEventListener("loadstart", () => {
        d.beforeRead();
        progress.value.percent = 0;
      });
      reader.addEventListener("loadend", () => {
        progress.value.percent = 100;
      });
      reader.addEventListener("progress", (event) => {
        if (event.loaded && event.total) {
          progress.value.percent = (event.loaded / event.total) * 100;
        }
      });

      const name = file.name ? file.name : "NOT SUPPORTED"; // Not supported in Safari for iOS.
      const type = file.type ? file.type : "NOT SUPPORTED"; // Not supported in Firefox for Android or Opera for Android.
      const size = file.size ? file.size : "NOT SUPPORTED"; // Unknown cross-browser support.
      console.log({ name, file, type, size });
      if (d.readMethod === "binary") reader.readAsBinaryString(file);
      else if (d.readMethod === "array") reader.readAsArrayBuffer(file);
      else if (d.readMethod === "url") reader.readAsDataURL(file);
      else if (d.readMethod === "text") reader.readAsText(file);
      fileModel.value.push(file);
    }
    d.inputRef.value = null;
  }
  return {
    reset,
    progress,
    fileModel,
    handleFileChange,
  };
}
