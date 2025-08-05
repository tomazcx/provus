type TSaveContext = { from: "bank" | "dashboard"; path: string | null };
type TSaveAction = { key: string; timestamp: number };

export const useEditorBridgeStore = defineStore("editorBridge", () => {
  const context = ref<TSaveContext>({ from: "dashboard", path: null });

  function setContext(routeQuery: { path?: string | string[] }) {
    if (routeQuery.path) {
      context.value = { from: "bank", path: routeQuery.path as string };
    } else {
      context.value = { from: "dashboard", path: null };
    }
  }

  const saveEvent = ref<TSaveAction | null>(null);

  function triggerSave(action: { key: string }) {
    saveEvent.value = { ...action, timestamp: Date.now() };
  }

  function clearSaveEvent() {
    saveEvent.value = null;
  }

  return {
    context,
    setContext,
    saveEvent,
    triggerSave,
    clearSaveEvent,
  };
});
