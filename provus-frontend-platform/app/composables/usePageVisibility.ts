export function usePageVisibility(onHide: () => void) {
  let isUnloading = false;

  const handleBeforeUnload = () => {
    isUnloading = true;
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden" && !isUnloading) {
      onHide();
    }
  };

  onMounted(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
  });

  onUnmounted(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("beforeunload", handleBeforeUnload);
  });
}
