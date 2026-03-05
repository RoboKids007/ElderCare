/**
 * Central in-memory state for the current session.
 * No globals: modules import this state and mutate via provided setters.
 */
export const state = {
  lastResult: null, // { reportText, payload }
};

export function setLastResult(result) {
  state.lastResult = result;
}

export function clearLastResult() {
  state.lastResult = null;
}
