export function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el;
}

export function safeGet(id) {
  return document.getElementById(id);
}

export function setHTML(id, html) {
  $(id).innerHTML = html;
}

export function setText(id, text) {
  $(id).textContent = text;
}
