import { APP_CONFIG } from "../config/appConfig.js";

export function dbLoad() {
  try {
    const raw = localStorage.getItem(APP_CONFIG.storageKey);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function dbSave(list) {
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(list));
}

export function dbClearAll() {
  localStorage.removeItem(APP_CONFIG.storageKey);
}
