import { defineStore } from "pinia";

type TSaveContext = { from: "bank" | "dashboard" };
type TSaveAction = { key: string; timestamp: number };

export const useEditorBridgeStore = defineStore("editorBridge", () => {
  const context = ref<TSaveContext>({ from: "dashboard" });

  // Configura o contexto baseado na query da URL (ex: ?origin=bank)
  function setContext(routeQuery: { origin?: string | null }) {
    if (routeQuery.origin === "bank") {
      context.value = { from: "bank" };
    } else {
      context.value = { from: "dashboard" };
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
