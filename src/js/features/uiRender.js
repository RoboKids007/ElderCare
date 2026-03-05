import { QUESTIONS } from "../data/questionnaire.js";

function makeSelect(id, options) {
  const sel = document.createElement("select");
  sel.id = id;
  sel.dataset.qid = id;

  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "Select…";
  sel.appendChild(opt0);

  for (const o of options) {
    const opt = document.createElement("option");
    opt.value = String(o.score);
    opt.textContent = o.label;
    sel.appendChild(opt);
  }
  return sel;
}

function makeQuestion(container, q) {
  const wrap = document.createElement("div");
  wrap.className = "q";

  const top = document.createElement("div");
  top.className = "title";

  const b = document.createElement("b");
  b.textContent = q.text;

  const sm = document.createElement("small");
  sm.textContent = q.note || "";

  top.appendChild(b);
  top.appendChild(sm);

  wrap.appendChild(top);

  if (q.type === "text") {
    const ta = document.createElement("textarea");
    ta.id = q.id;
    ta.placeholder = "Write in simple words…";
    wrap.appendChild(ta);
  } else {
    wrap.appendChild(makeSelect(q.id, q.opts));
  }

  container.appendChild(wrap);
}

export function renderQuestionnaire() {
  for (const [section, items] of Object.entries(QUESTIONS)) {
    const el = document.getElementById(section);
    if (!el) continue;
    el.innerHTML = "";
    for (const q of items) makeQuestion(el, q);
  }
}
