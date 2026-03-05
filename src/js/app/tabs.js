import { $, safeGet } from "./dom.js";

export function initTabs({ onDashOpen }) {
  const tabAssess = $("tabAssess");
  const tabDash = $("tabDash");
  const viewAssess = $("viewAssess");
  const viewDash = $("viewDash");

  function setTab(which) {
    if (which === "dash") {
      tabDash.classList.add("active");
      tabAssess.classList.remove("active");
      viewDash.style.display = "";
      viewAssess.style.display = "none";
      if (typeof onDashOpen === "function") onDashOpen();
    } else {
      tabAssess.classList.add("active");
      tabDash.classList.remove("active");
      viewAssess.style.display = "";
      viewDash.style.display = "none";
    }
  }

  tabAssess.addEventListener("click", () => setTab("assess"));
  tabDash.addEventListener("click", () => setTab("dash"));

  // For other modules to switch tabs if needed
  return { setTab };
}
