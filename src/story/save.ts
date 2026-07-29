import { loadSave, saveSlot, type SaveData } from "../persistence/save";
import { reconcileFirstRunClears } from "./first-run";

export function loadFirstRunSave(storage: Storage, slot: 1 | 2 | 3): SaveData {
  const save = loadSave(storage, slot);
  const clearedNodeIds = reconcileFirstRunClears(
    save.currentNodeId,
    save.clearedNodeIds,
  );
  if (clearedNodeIds.length === save.clearedNodeIds.length) {
    return save;
  }
  return saveSlot(storage, {
    ...save,
    clearedNodeIds,
  });
}
