import { renderQuestionnaire } from "./features/uiRender.js";
import { initTabs } from "./app/tabs.js";
import { $, setHTML, setText } from "./app/dom.js";
import { toast } from "./app/toast.js";
import { state, setLastResult, clearLastResult } from "./app/state.js";

import { QUESTIONS } from "./data/questionnaire.js";
import {
  validateAllAnswered,
  sumSection,
  classifyDomain,
  computeFrailty,
  computeFallRisk,
  computeDepression,
  computeCognitiveRisk,
  overallClassFrom,
  clamp,
} from "./features/scoring.js";

import { collectAnswers, buildReportText, buildReportFromStored, escapeText } from "./features/report.js";
import { dbLoad, dbSave, dbClearAll } from "./features/storage.js";
import { exportReportPDF } from "./features/pdf.js";
import { initDashboard } from "./features/dashboard.js";
import { fillSample } from "./features/sample.js";

function uuid() {
  return `id-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

function dotClass(level) {
  return level === "low" ? "ok" : (level === "high" ? "bad" : "mid");
}

function badge(level, label) {
  const cls = level === "low" ? "ok" : (level === "high" ? "bad" : "mid");
  return `<span class="badge ${cls}">${label}</span>`;
}

function setBar(el, pct, level) {
  el.style.width = `${pct}%`;
  el.style.background = level === "low" ? "var(--ok)" : (level === "high" ? "var(--bad)" : "var(--mid)");
}

function cardLine(title, level, value, subtitle = "") {
  const levelText = level === "low" ? "Low" : (level === "high" ? "High" : "Moderate");
  return `
    <div class="q" style="margin:10px 0;">
      <div class="title">
        <b>${title}</b>
        <span class="pill"><span class="dot ${dotClass(level)}"></span>${levelText}</span>
      </div>
      <div style="margin-top:8px;font-size:13px;">
        <div><b>${value}</b></div>
        ${subtitle ? `<div class="muted" style="margin-top:4px;">${subtitle}</div>` : ""}
      </div>
    </div>
  `;
}

function resetUI() {
  setText("reportBox", "Generate report to see output here…");
  setHTML("domainCards", "");
  setHTML("riskCards", "");
  setText("overallScore", "—");
  setText("overallClass", "—");
  setBar($("overallBar"), 0, "low");
  $("btnSave").disabled = true;
  $("btnPDF").disabled = true;
}

function resetAll() {
  if (!confirm("Reset all answers?")) return;
  document.querySelectorAll("select").forEach((s) => (s.value = ""));
  document.querySelectorAll('input[type="text"], input[type="number"]').forEach((i) => (i.value = ""));
  document.querySelectorAll("textarea").forEach((t) => (t.value = ""));
  clearLastResult();
  resetUI();
  toast("Reset.");
}

function buildPriorities({ domains, frailty, fall, depression, cogRisk }) {
  const priorities = [];
  const dm = Object.fromEntries(domains.map((d) => [d.key, d]));

  function addIf(level, title, tips) {
    if (level === "high") priorities.push({ p: 3, title, tips });
    else if (level === "mid") priorities.push({ p: 2, title, tips });
  }

  addIf(dm.physical.level, "Physical health monitoring", [
    "Track pain/sleep; check BP/sugar if applicable.",
    "Encourage safe daily walk + hydration.",
  ]);
  addIf(dm.functional.level, "Support for daily activities", [
    "Caregiver support for ADLs/IADLs (cooking/meds/shopping).",
    "Medication reminders + adherence checks.",
  ]);
  addIf(dm.mental.level, "Emotional wellbeing support", [
    "Daily engagement: family calls + companion conversation.",
    "If persistent sadness/anxiety, consult clinician.",
  ]);
  addIf(dm.cognitive.level, "Cognitive screening", [
    "Formal screening with doctor (Mini-Cog/MoCA).",
    "Routine + reminders to reduce confusion.",
  ]);
  addIf(dm.social.level, "Reduce social isolation", [
    "Community/senior groups; weekly social plan.",
    "Encourage peer interactions.",
  ]);
  addIf(dm.safety.level, "Home safety improvements", [
    "Anti-slip mats, grab bars, night lights.",
    "Emergency contact + SOS device.",
  ]);

  addIf(frailty.level, "Frailty prevention plan", [
    "Strength + balance exercises (as tolerated).",
    "Protein-rich diet; watch for weight loss.",
  ]);
  addIf(fall.level, "Fall prevention plan", [
    "Balance training; vision check; review medicines.",
    "Remove hazards; add grab bars; improve lighting.",
  ]);
  addIf(depression.level, "Depression follow-up", [
    "Daily enjoyable activities; social + family interaction.",
    "If symptoms persist, professional evaluation.",
  ]);
  addIf(cogRisk.level, "Memory support plan", [
    "Daily routine reminders; reduce confusion triggers.",
    "Clinical assessment if worsening.",
  ]);

  priorities.sort((a, b) => b.p - a.p);
  return priorities;
}

function computeTopConcerns(domains, frailty, fall, depression, cogRisk) {
  const concernList = [];
  const sortedSignals = [
    ...domains.map((d) => ({ k: d.name, level: d.level, score: d.score / Math.max(1, d.max) })),
    { k: "Frailty Index", level: frailty.level, score: frailty.fi },
    { k: "Fall Risk", level: fall.level, score: clamp(fall.score / 8, 0, 1) },
    { k: "Depression Screening", level: depression.level, score: clamp(depression.scaled / 15, 0, 1) },
    { k: "Cognitive Risk", level: cogRisk.level, score: clamp(cogRisk.sum / 12, 0, 1) },
  ].sort((a, b) => b.score - a.score);

  for (const s of sortedSignals) {
    if (s.level !== "low") concernList.push(`${s.k} (${s.level === "high" ? "High" : "Moderate"})`);
    if (concernList.length >= 3) break;
  }

  return concernList.length ? concernList.join(", ") : "No major concerns flagged";
}

function generateReport() {
  const v = validateAllAnswered();
  if (!v.ok) {
    alert(`Please answer all multiple-choice questions. Missing: ${v.missing}`);
    return;
  }

  const person = {
    name: escapeText($("name").value || "—"),
    age: $("age").value || "—",
    gender: $("gender").value || "—",
    concern: escapeText(document.getElementById("sa_concern")?.value || "—"),
  };

  const physical = sumSection("physical");
  const functional = sumSection("functional");
  const mental = sumSection("mental");
  const cognitive = sumSection("cognitive");
  const social = sumSection("social");
  const safety = sumSection("safety");
  const lifestyle = sumSection("lifestyle");

  const maxOf = (key) => QUESTIONS[key].filter((q) => !q.type).length * 3;

  const domains = [
    { key: "physical", name: "Physical Health", ...classifyDomain("Physical Health", physical.sum, maxOf("physical")), score: physical.sum, max: maxOf("physical") },
    { key: "functional", name: "Functional Ability", ...classifyDomain("Functional Ability", functional.sum, maxOf("functional")), score: functional.sum, max: maxOf("functional") },
    { key: "mental", name: "Mental Health", ...classifyDomain("Mental Health", mental.sum, maxOf("mental")), score: mental.sum, max: maxOf("mental") },
    { key: "cognitive", name: "Cognitive Health", ...classifyDomain("Cognitive Health", cognitive.sum, maxOf("cognitive")), score: cognitive.sum, max: maxOf("cognitive") },
    { key: "social", name: "Social Wellbeing", ...classifyDomain("Social Wellbeing", social.sum, maxOf("social")), score: social.sum, max: maxOf("social") },
    { key: "safety", name: "Safety", ...classifyDomain("Safety", safety.sum, maxOf("safety")), score: safety.sum, max: maxOf("safety") },
    { key: "lifestyle", name: "Lifestyle/Nutrition", ...classifyDomain("Lifestyle/Nutrition", lifestyle.sum, maxOf("lifestyle")), score: lifestyle.sum, max: maxOf("lifestyle") },
  ];

  const frailty = computeFrailty();
  const fall = computeFallRisk();
  const depression = computeDepression();
  const cogRisk = computeCognitiveRisk();

  const risks = [
    { key: "frailty", name: "Frailty Index", level: frailty.level, value: `${frailty.fi.toFixed(2)} – ${frailty.status}`, raw: frailty.fi },
    { key: "fall", name: "Fall Risk", level: fall.level, value: `Score ${fall.score.toFixed(1)} – ${fall.status}`, raw: fall.score },
    { key: "depression", name: "Depression Screening", level: depression.level, value: `Score ${depression.scaled} / 15 – ${depression.status}`, raw: depression.scaled },
    { key: "cog", name: "Cognitive Risk", level: cogRisk.level, value: `Score ${cogRisk.sum} – ${cogRisk.status}`, raw: cogRisk.sum },
  ];

  const domainNorm = domains.reduce((a, d) => a + (d.score / Math.max(1, d.max)), 0) / domains.length;
  const medicalNorm =
    (clamp(frailty.fi, 0, 1) +
      clamp(fall.score / 8, 0, 1) +
      clamp(depression.scaled / 15, 0, 1) +
      clamp(cogRisk.sum / 12, 0, 1)) / 4;

  const overall = Math.round((domainNorm * 0.6 + medicalNorm * 0.4) * 100);
  const overallCls = overallClassFrom(domains, risks);

  const priorities = buildPriorities({ domains, frailty, fall, depression, cogRisk });
  const topConcerns = computeTopConcerns(domains, frailty, fall, depression, cogRisk);

  // UI: KPIs
  setText("overallScore", `${overall}/100`);
  setHTML("overallClass", `${badge(overallCls.level, overallCls.level === "low" ? "Low" : (overallCls.level === "high" ? "High" : "Moderate"))} <span class="muted" style="margin-left:8px">${overallCls.label}</span>`);
  setBar($("overallBar"), overall, overallCls.level);

  // UI: domain cards
  setHTML("domainCards", domains.map((d) => cardLine(d.name, d.level, d.label, `Score: ${d.score} (higher = more concern)`)).join(""));

  // UI: risk cards
  const riskCards = [
    cardLine("Frailty Index", frailty.level, `${frailty.fi.toFixed(2)} – ${frailty.status}`, "Based on fatigue, walking difficulty, falls, weight loss, activity, meds, health rating."),
    cardLine("Fall Risk", fall.level, `Score ${fall.score.toFixed(1)} – ${fall.status}`, `Estimated risk (6–12 months): ${fall.est}`),
    cardLine("Depression Screening", depression.level, `Score ${depression.scaled} / 15 – ${depression.status}`, "Signals from loneliness, sadness, interest loss, engagement, happiness."),
    cardLine("Cognitive Risk", cogRisk.level, `Score ${cogRisk.sum} – ${cogRisk.status}`, "Signals from forgetfulness, appointments, names, instructions."),
  ];
  setHTML("riskCards", riskCards.join(""));

  const reportText = buildReportText({
    person,
    overall,
    overallCls,
    topConcerns,
    domains,
    frailty,
    fall,
    depression,
    cogRisk,
    priorities,
  });
  setText("reportBox", reportText);

  $("btnSave").disabled = false;
  $("btnPDF").disabled = false;

  const payload = {
    id: uuid(),
    created_at: new Date().toISOString(),
    person,
    answers: collectAnswers(),
    overall: { score: overall, level: overallCls.level, label: overallCls.label },
    domains: domains.map((d) => ({ key: d.key, name: d.name, level: d.level, label: d.label, score: d.score, max: d.max })),
    risks: risks.map((r) => ({ key: r.key, name: r.name, level: r.level, value: r.value, raw: r.raw })),
    primaryConcerns: topConcerns,
  };

  setLastResult({ reportText, payload });
  toast("Report generated ✅");
}

function saveAssessment() {
  if (!state.lastResult) {
    alert("Generate report first.");
    return;
  }
  const list = dbLoad();
  list.unshift(state.lastResult.payload);
  dbSave(list);
  toast("Saved to dashboard ✅");
}

function exportPDF() {
  if (!state.lastResult) {
    alert("Generate report first.");
    return;
  }
  try {
    exportReportPDF({ reportText: state.lastResult.reportText, elderName: state.lastResult.payload.person.name });
    toast("PDF downloaded ✅");
  } catch (e) {
    console.error(e);
    alert("PDF export failed. Check console for details.");
  }
}

function loadToForm(item, tabsApi) {
  $("name").value = item.person?.name || "";
  $("age").value = item.person?.age || "";
  $("gender").value = item.person?.gender || "";

  const answers = item.answers || {};
  for (const [k, v] of Object.entries(answers)) {
    const el = document.getElementById(k);
    if (!el) continue;
    el.value = (v === null || v === undefined) ? "" : String(v);
  }

  tabsApi.setTab("assess");
  generateReport();
  toast("Loaded assessment into form.");
}

function init() {
  renderQuestionnaire();
  resetUI();

  const tabsApi = initTabs({
    onDashOpen: () => dashboardApi.renderDashboard(),
  });

  const dashboardApi = initDashboard({
    onLoadToForm: (item) => loadToForm(item, tabsApi),
  });

  $("btnGenerate").addEventListener("click", generateReport);
  $("btnSave").addEventListener("click", saveAssessment);
  $("btnPDF").addEventListener("click", exportPDF);

  $("btnSample").addEventListener("click", () => {
    fillSample();
    generateReport();
  });

  $("btnReset").addEventListener("click", resetAll);
}

init();
