// DealProof router + app state. Hash routes: #/ (deals), #/compare,
// #/promos, #/how, #/deal/<id>. Filter state lives here and is
// re-applied on every render, so back/forward works.

import { viewDeals, viewDeal, viewCompare, viewPromos, viewHow, renderStats } from "./views.js";

const host = document.getElementById("view");
const navLinks = [...document.querySelectorAll("[data-nav]")];

let filters = {
  query: "",
  category: "All",
  store: "All",
  minPct: 0,
  verdict: "All",
  lowsOnly: false,
  sort: "best-verdict",
};

function setNav(route) {
  const map = { deals: "deals", compare: "compare", promos: "promos", how: "how", deal: "deals" };
  for (const a of navLinks) {
    if (a.dataset.nav === map[route]) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
}

function render() {
  const hash = location.hash || "#/";
  const parts = hash.replace(/^#\//, "").split("/");
  const route = parts[0] || "";
  host.replaceChildren();
  renderStats();
  window.__shotReady = false;

  if (route === "compare") {
    setNav("compare");
    host.append(viewCompare());
  } else if (route === "promos") {
    setNav("promos");
    host.append(viewPromos());
  } else if (route === "how") {
    setNav("how");
    host.append(viewHow());
  } else if (route === "deal" && parts[1]) {
    setNav("deal");
    host.append(viewDeal(parts[1]));
  } else {
    setNav("deals");
    host.append(
      viewDeals(filters, (next) => {
        filters = next;
        render();
      })
    );
  }
  document.title =
    route === "compare"
      ? "DealProof — Cross-store compare"
      : route === "promos"
        ? "DealProof — Today-only promos"
        : route === "how"
          ? "DealProof — How we check"
          : route === "deal"
            ? "DealProof — Deal detail"
            : "DealProof — 60 verified Black Friday deals, checked 27 Nov 2026";
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();
