import { QUESTIONS } from "../data/questionnaire.js";
import { safeGet } from "../app/dom.js";

export function getScore(id) {
  const el = safeGet(id);
  if (!el) return 0;
  if (el.tagName === "TEXTAREA") return 0;
  const v = el.value;
  if (v === "" || v == null) return null;
  return Number(v);
}

export function getText(id) {
  const el = safeGet(id);
  return el ? (el.value || "").trim() : "";
}

export function sumSection(sectionKey) {
  let sum = 0;
  let unanswered = 0;
  let total = 0;
  for (const q of QUESTIONS[sectionKey]) {
    if (q.type === "text") continue;
    total++;
    const s = getScore(q.id);
    if (s === null) unanswered++;
    else sum += s;
  }
  return { sum, unanswered, total };
}

export function validateAllAnswered() {
  let missing = 0;
  for (const key of Object.keys(QUESTIONS)) {
    missing += sumSection(key).unanswered;
  }
  return { ok: missing === 0, missing };
}

export function classifyDomain(name, score, maxScore) {
  const r = maxScore > 0 ? (score / maxScore) : 0;
  if (r <= 0.25) return { level: "low", label: `${name}: Good` };
  if (r <= 0.55) return { level: "mid", label: `${name}: Moderate` };
  return { level: "high", label: `${name}: High concern` };
}

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export function computeFrailty() {
  const indicators = [
    { id: "ph_fatigue", rule: (s) => (s >= 2 ? 1 : 0) },
    { id: "ph_walk", rule: (s) => (s >= 2 ? 1 : 0) },
    { id: "ph_falls", rule: (s) => (s >= 2 ? 1 : 0) },
    { id: "ph_weightloss", rule: (s) => (s >= 2 ? 1 : 0) },
    { id: "ls_activity", rule: (s) => (s >= 1 ? 1 : 0) },
    { id: "sf_meds_count", rule: (s) => (s >= 2 ? 1 : 0) },
    { id: "ph_healthrate", rule: (s) => (s >= 2 ? 1 : 0) },
  ];

  let num = 0;
  let den = 0;
  for (const it of indicators) {
    const s = getScore(it.id);
    if (s === null) continue;
    den++;
    num += it.rule(s);
  }

  const fi = den ? (num / den) : 0;
  let status = "Very Fit";
  let level = "low";
  if (fi > 0.45) { status = "Severely Frail"; level = "high"; }
  else if (fi > 0.30) { status = "Frail"; level = "high"; }
  else if (fi > 0.20) { status = "Vulnerable"; level = "mid"; }
  else if (fi > 0.10) { status = "Well"; level = "low"; }

  return { fi, status, level };
}

export function computeFallRisk() {
  const factors = [
    { id: "ph_falls", points: (s) => (s >= 2 ? 3 : 0) },
    { id: "sf_balance", points: (s) => (s >= 2 ? 2 : (s === 1 ? 1 : 0)) },
    { id: "ph_walk", points: (s) => (s >= 2 ? 2 : (s === 1 ? 1 : 0)) },
    { id: "sf_vision", points: (s) => (s >= 2 ? 1 : 0) },
    { id: "sf_meds_count", points: (s) => (s >= 2 ? 1 : 0) },
    { id: "sf_hazards", points: (s) => (s >= 2 ? 1 : (s === 1 ? 0.5 : 0)) },
  ];

  let score = 0;
  for (const f of factors) {
    const s = getScore(f.id);
    if (s === null) continue;
    score += f.points(s);
  }

  let level = "low";
  let status = "Low Risk";
  let est = "~5–10%";
  if (score >= 6) { level = "high"; status = "High Fall Risk"; est = "~25–40%"; }
  else if (score >= 3) { level = "mid"; status = "Moderate Risk"; est = "~12–25%"; }

  return { score, status, level, est };
}

export function computeDepression() {
  const items = ["mh_lonely", "mh_sad", "mh_interest", "mh_engage", "sa_happy"];
  let sum = 0;
  let den = 0;

  for (const id of items) {
    const s = getScore(id);
    if (s === null) continue;
    den++;
    sum += s;
  }

  const scaled = den ? Math.round((sum / (den * 3)) * 15) : 0;

  let level = "low";
  let status = "Normal";
  if (scaled >= 12) { level = "high"; status = "Severe Depression Risk"; }
  else if (scaled >= 9) { level = "high"; status = "Moderate Depression Risk"; }
  else if (scaled >= 5) { level = "mid"; status = "Mild Depression Risk"; }

  return { scaled, status, level };
}

export function computeCognitiveRisk() {
  const items = ["cg_objects", "cg_appt", "cg_names", "cg_instruct"];
  let sum = 0;

  for (const id of items) {
    const s = getScore(id);
    if (s === null) continue;
    sum += s;
  }

  let level = "low";
  let status = "Normal";
  if (sum >= 6) { level = "high"; status = "Dementia Risk (Needs screening)"; }
  else if (sum >= 3) { level = "mid"; status = "Mild Cognitive Impairment Risk"; }

  return { sum, status, level };
}

export function overallClassFrom(domains, risks) {
  const anyHighRisk = risks.some((r) => r.level === "high");
  const numMid = [...domains, ...risks].filter((x) => x.level === "mid").length;
  const numHigh = [...domains, ...risks].filter((x) => x.level === "high").length;

  if (anyHighRisk || numHigh >= 2) return { level: "high", label: "High Risk (needs close monitoring)" };
  if (numHigh === 1 || numMid >= 3) return { level: "mid", label: "Needs Monitoring" };
  return { level: "low", label: "Healthy Aging / Low Risk" };
}
