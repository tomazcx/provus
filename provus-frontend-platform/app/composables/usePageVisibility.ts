export function usePageVisibility(onViolation: () => void) {
  let isUnloading = false;

  const handleBeforeUnload = () => {
    isUnloading = true;
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden" && !isUnloading) {
      console.log(
        "[Proctoring] Violação detectada: Visibilidade (Aba oculta/Minimizada)"
      );
      onViolation();
    }
  };

  const handleBlur = () => {
    if (document.visibilityState === "hidden") return;

    if (!document.hasFocus() && !isUnloading) {
      console.log(
        "[Proctoring] Violação detectada: Perda de Foco (Clicou fora/Split Screen)"
      );
      onViolation();
    }
  };

  onMounted(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
  });

  onUnmounted(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleBlur);
    window.removeEventListener("beforeunload", handleBeforeUnload);
  });
}
