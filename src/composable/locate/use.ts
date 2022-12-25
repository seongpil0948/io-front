import { ref } from "vue";

export function useLocateAppend() {
  const showAppendModal = ref(false);
  function onClickLocateBtn() {
    if (!showAppendModal.value) {
      showAppendModal.value = true;
    }
  }
  return {
    onClickLocateBtn,
    showAppendModal,
  };
}
