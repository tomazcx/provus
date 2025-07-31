export const useAssessmentSettingsStore = defineStore("assessmentSettings", () => {
  const isSettingsDialogOpen = ref(false);

  function openSettingsDialog() {
    isSettingsDialogOpen.value = true;
  }

  function closeSettingsDialog() {
    isSettingsDialogOpen.value = false;
  }

  return {
    isSettingsDialogOpen,
    openSettingsDialog,
    closeSettingsDialog,
  };
});
