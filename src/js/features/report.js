import { QUESTIONS } from "../data/questionnaire.js";
import { $, safeGet } from "../app/dom.js";
import { getScore, getText } from "./scoring.js";

export function escapeText(s) {
   // Normalize consecutive spaces/tabs but keep line breaks intact.
  return (s || "").replace(/[\t ]+/g, " ").trim();
}

export function collectAnswers() {
  const answers = {};
  for (const [sec, items] of Object.entries(QUESTIONS)) {
    for (const q of items) {
      if (q.type === "text") {
        answers[q.id] = getText(q.id);
      } else {
        answers[q.id] = getScore(q.id);
      }
    }
  }
  return answers;
}

export function buildReportText({ person, overall, overallCls, topConcerns, domains, frailty, fall, depression, cogRisk, priorities }) {
  const now = new Date();
  const linesDomains = domains.map((d) => `${d.name.padEnd(20)} : ${d.label} (Score ${d.score})`).join("\n");

  const recText = priorities.length
    ? priorities
      .map((x, i) => `${i + 1}. ${x.title}\n   - ${x.tips.join("\n   - ")}`)
      .join("\n\n")
    : "Maintain current routine. Continue periodic monitoring.";

  return `ELDER HEALTH ASSESSMENT REPORT
========================================
Name   : ${person.name}
Age    : ${person.age}
Gender : ${person.gender}
Date   : ${now.toLocaleString()}

Overall Classification
----------------------------------------
Overall Health Index : ${overall}/100
Overall Status       : ${overallCls.label}
Primary Concerns     : ${topConcerns}

Domain Sub-Classifications
----------------------------------------
${linesDomains}

Medical Risk Models (Screening)
----------------------------------------
Frailty Index        : ${frailty.fi.toFixed(2)} → ${frailty.status}
Fall Risk            : ${fall.score.toFixed(1)} → ${fall.status} (Est: ${fall.est})
Depression Screening : ${depression.scaled}/15 → ${depression.status}
Cognitive Risk       : ${cogRisk.sum} → ${cogRisk.status}

Self-Reported Concern
----------------------------------------
${person.concern}

Recommendations (Prioritized)
----------------------------------------
${recText}

Disclaimer
----------------------------------------
This is a screening report generated from questionnaire responses.
It is NOT a medical diagnosis. For urgent symptoms, consult a clinician.
`;
}

export function buildReportFromStored(item) {
  const dt = item.created_at ? new Date(item.created_at).toLocaleString() : "—";
  const domains = item.domains || [];
  const risks = item.risks || [];

  return `ELDER HEALTH ASSESSMENT REPORT
========================================
Name   : ${item.person?.name || "—"}
Age    : ${item.person?.age || "—"}
Gender : ${item.person?.gender || "—"}
Date   : ${dt}

Overall Classification
----------------------------------------
Overall Health Index : ${item.overall?.score ?? "—"}/100
Overall Status       : ${item.overall?.label || "—"}
Primary Concerns     : ${item.primaryConcerns || "—"}

Domain Sub-Classifications
----------------------------------------
${domains.map((d) => `${(d.name || "").padEnd(20)} : ${d.label || ""} (Score ${d.score ?? "—"})`).join("\n")}

Medical Risk Models (Screening)
----------------------------------------
${risks.map((r) => `${(r.name || "").padEnd(20)} : ${r.value || ""}`).join("\n")}

Self-Reported Concern
----------------------------------------
${item.person?.concern || item.answers?.sa_concern || "—"}

Disclaimer
----------------------------------------
This is a screening report generated from questionnaire responses.
It is NOT a medical diagnosis. For urgent symptoms, consult a clinician.
`;
}
