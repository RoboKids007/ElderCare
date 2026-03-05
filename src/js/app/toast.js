import { $ } from "./dom.js";

let timer = null;

export function toast(message) {
  const t = $("toast");
  t.textContent = message;
  t.style.display = "block";
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    t.style.display = "none";
  }, 2200);
}
