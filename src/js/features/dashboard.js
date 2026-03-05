import { $, setHTML } from "../app/dom.js";
import { toast } from "../app/toast.js";
import { dbLoad, dbSave, dbClearAll } from "./storage.js";
import { buildReportFromStored } from "./report.js";
import { exportReportPDF } from "./pdf.js";

export function initDashboard({ onLoadToForm }) {
  const dashListEl = $("dashList");
  const dashEmptyEl = $("dashEmpty");
  const dashSearchEl = $("dashSearch");
  const dashFilterEl = $("dashFilter");

  function deleteAssessment(id) {
    const list = dbLoad().filter((x) => x.id !== id);
    dbSave(list);
    renderDashboard();
    toast("Deleted.");
  }

  function clearAll() {
    if (!confirm("Delete ALL saved assessments from this browser?")) return;
    dbClearAll();
    renderDashboard();
    toast("All cleared.");
  }

  function renderDashboard() {
    const search = (dashSearchEl.value || "").toLowerCase().trim();
    const filter = dashFilterEl.value;

    const all = dbLoad();
    const filtered = all.filter((item) => {
      const n = (item.person?.name || "").toLowerCase();
      const matchesSearch = !search || n.includes(search);
      const matchesFilter = filter === "all" || item.overall?.level === filter;
      return matchesSearch && matchesFilter;
    });

    dashListEl.innerHTML = "";
    dashEmptyEl.style.display = filtered.length ? "none" : "";

    for (const item of filtered) {
      const level = item.overall?.level || "mid";
      const lvlLabel = level === "low" ? "Low" : (level === "high" ? "High" : "Moderate");
      const cls = level === "low" ? "ok" : (level === "high" ? "bad" : "mid");
      const dt = item.created_at ? new Date(item.created_at) : null;
      const when = dt ? dt.toLocaleString() : "—";
      const score = item.overall?.score ?? "—";
      const concerns = item.primaryConcerns || "—";

      const div = document.createElement("div");
      div.className = "mini";
      div.innerHTML = `
        <div class="topline">
          <div>
            <h3>${item.person?.name || "—"} <span class="muted">(Age: ${item.person?.age || "—"})</span></h3>
            <div class="sub">Latest: ${when}</div>
          </div>
          <div style="text-align:right;">
            <div><span class="badge ${cls}">${lvlLabel}</span></div>
            <div class="sub">Index: <b>${score}/100</b></div>
          </div>
        </div>
        <div class="sub" style="margin-top:10px;">
          <b>Primary concerns:</b> ${concerns}
        </div>
        <div class="btns">
          <button data-act="view" type="button">View / Load</button>
          <button data-act="pdf" type="button">PDF</button>
          <button class="danger" data-act="del" type="button">Delete</button>
        </div>
      `;

      div.querySelector('[data-act="view"]').addEventListener("click", () => onLoadToForm(item));
      div.querySelector('[data-act="del"]').addEventListener("click", () => deleteAssessment(item.id));
      div.querySelector('[data-act="pdf"]').addEventListener("click", () => {
        const reportText = buildReportFromStored(item);
        exportReportPDF({ reportText, elderName: item.person?.name || "elder" });
        toast("PDF downloaded ✅");
      });

      dashListEl.appendChild(div);
    }
  }

  dashSearchEl.addEventListener("input", renderDashboard);
  dashFilterEl.addEventListener("change", renderDashboard);

  $("btnRefreshDash").addEventListener("click", renderDashboard);
  $("btnClearAll").addEventListener("click", clearAll);

  return { renderDashboard };
}
