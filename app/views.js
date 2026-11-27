// Views: render every route into #view. Plain DOM building, no
// framework, no network calls. All data comes from data.js.

import { deals, promos, compare, CHECKED_LABEL } from "./data.js";
import {
  VERDICT_LABELS,
  savings,
  percentOff,
  filterDeals,
  sortDeals,
  countsBy,
  storeList,
  summaryStats,
} from "./filters.js";

export const CATEGORY_COLORS = {
  Audio: "#5b4a8a",
  TV: "#2b6cb0",
  "Laptops & Tablets": "#276749",
  "Phones & Wearables": "#9c4221",
  Gaming: "#744210",
  "Smart Home": "#285e61",
  "Home & Vacuums": "#4a5568",
  Kitchen: "#975a16",
  Beauty: "#97266d",
  "Toys & Fashion": "#9b2c2c",
};

export function categoryInitials(category) {
  return category
    .split(/[^A-Za-z]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function money(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, "");
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function verdictBadge(d) {
  const b = el("span", "badge " + d.verdict, VERDICT_LABELS[d.verdict].toUpperCase());
  return b;
}

export function dealCard(d) {
  const card = el("article", "card");
  const thumb = el("div", "thumb");
  thumb.style.background = CATEGORY_COLORS[d.category] || "#4a5568";
  thumb.append(el("span", "ini", categoryInitials(d.category)));
  thumb.append(el("span", "cat", d.category));
  card.append(thumb);

  const body = el("div", "card-body");
  const h = el("h3");
  const a = el("a", null, d.title);
  a.href = "#/deal/" + d.id;
  h.append(a);
  body.append(h);

  const row = el("div", "store-row");
  row.append(el("span", "store-chip", d.store));
  row.append(verdictBadge(d));
  body.append(row);

  const pr = el("div", "price-row");
  pr.append(el("span", "price", money(d.price)));
  pr.append(el("span", "was", "was " + money(d.was)));
  pr.append(
    el("span", "save", `Save ${money(savings(d))} (${percentOff(d)}%)`)
  );
  body.append(pr);

  body.append(el("p", "evidence", d.evidence));
  body.append(
    el("p", "proof", `Verified: ${d.source}. Checked ${CHECKED_LABEL}.`)
  );
  if (d.alsoAt && d.alsoAt.length) {
    const also = d.alsoAt
      .map((x) => `${x.store} ${money(x.price)}${x.note ? " (" + x.note + ")" : ""}`)
      .join(" · ");
    body.append(el("p", "also", "Also at: " + also));
  }
  const cta = el("a", "cta", `View at ${d.store}`);
  cta.href = d.url;
  cta.target = "_blank";
  cta.rel = "noopener";
  body.append(cta);
  card.append(body);
  return card;
}

function renderStats() {
  const host = document.getElementById("stats");
  if (!host || host.dataset.done) return;
  const { count, lows, stores, totalSave, avgPct } = summaryStats(deals);
  const items = [
    ["Deals", count],
    ["All-time lows", lows],
    ["Stores", stores],
    ["Total savings", "$" + totalSave.toLocaleString("en-US")],
    ["Avg discount", avgPct + "%"],
  ];
  for (const [k, v] of items) {
    const div = el("div");
    div.append(el("dt", null, k));
    div.append(el("dd", null, String(v)));
    host.append(div);
  }
  host.dataset.done = "1";
}

// ---- deals list (home) ----
export function viewDeals(f, onChange) {
  const frag = document.createDocumentFragment();

  const filters = el("section", "filters");
  filters.setAttribute("aria-label", "Filter deals");

  const qLab = el("label", null, "Search");
  const q = el("input");
  q.type = "search";
  q.placeholder = "Search deals, brands, stores…";
  q.value = f.query;
  q.addEventListener("input", () => onChange({ ...f, query: q.value }));
  qLab.append(q);
  filters.append(qLab);

  const sLab = el("label", null, "Store");
  const s = el("select");
  for (const st of ["All", ...storeList(deals)]) {
    const o = el("option", null, st);
    o.value = st;
    s.append(o);
  }
  s.value = f.store;
  s.addEventListener("change", () => onChange({ ...f, store: s.value }));
  sLab.append(s);
  filters.append(sLab);

  const pLab = el("label", null, "Minimum discount");
  const p = el("select");
  for (const [v, t] of [[0, "Any"], [20, "20%+"], [30, "30%+"], [40, "40%+"], [50, "50%+"], [60, "60%+"]]) {
    const o = el("option", null, t);
    o.value = String(v);
    p.append(o);
  }
  p.value = String(f.minPct);
  p.addEventListener("change", () => onChange({ ...f, minPct: Number(p.value) }));
  pLab.append(p);
  filters.append(pLab);

  const vLab = el("label", null, "Verdict");
  const v = el("select");
  const present = [...new Set(deals.map((d) => d.verdict))];
  for (const vd of ["All", ...present]) {
    const o = el("option", null, vd === "All" ? "All verdicts" : VERDICT_LABELS[vd]);
    o.value = vd;
    v.append(o);
  }
  v.value = f.verdict;
  v.addEventListener("change", () => onChange({ ...f, verdict: v.value }));
  vLab.append(v);
  filters.append(vLab);

  const oLab = el("label", null, "Sort by");
  const o = el("select");
  for (const [val, t] of [
    ["best-verdict", "Best verdict"],
    ["biggest-pct", "Biggest % off"],
    ["biggest-save", "Biggest $ saved"],
    ["price-low", "Price: low to high"],
    ["price-high", "Price: high to low"],
  ]) {
    const op = el("option", null, t);
    op.value = val;
    o.append(op);
  }
  o.value = f.sort;
  o.addEventListener("change", () => onChange({ ...f, sort: o.value }));
  oLab.append(o);
  filters.append(oLab);

  const lowRow = el("label", "check-row");
  const lowBox = el("input");
  lowBox.type = "checkbox";
  lowBox.checked = f.lowsOnly;
  lowBox.addEventListener("change", () => onChange({ ...f, lowsOnly: lowBox.checked }));
  lowRow.append(lowBox);
  lowRow.append(document.createTextNode("All-time lows only"));
  filters.append(lowRow);
  frag.append(filters);

  const pills = el("div", "pills");
  pills.setAttribute("role", "group");
  pills.setAttribute("aria-label", "Categories");
  const cats = [["All", deals.length], ...countsBy(deals, "category")];
  for (const [c, n] of cats) {
    const b = el("button", "pill", c + " ");
    const num = el("span", "n", `(${n})`);
    b.append(num);
    b.setAttribute("aria-pressed", String(f.category === c));
    b.addEventListener("click", () => onChange({ ...f, category: c }));
    pills.append(b);
  }
  frag.append(pills);

  const shown = sortDeals(filterDeals(deals, f), f.sort);
  frag.append(el("p", "result-count", `Showing ${shown.length} of ${deals.length} deals · checked ${CHECKED_LABEL}`));

  const grid = el("div", "grid");
  if (!shown.length) {
    grid.append(el("p", "empty", "No deals match those filters. Clear the search or pick another category."));
  }
  for (const d of shown) grid.append(dealCard(d));
  frag.append(grid);
  return frag;
}

// ---- single deal ----
export function viewDeal(id) {
  const d = deals.find((x) => x.id === id);
  const frag = document.createDocumentFragment();
  if (!d) {
    frag.append(el("p", "empty", "That deal is not on this list."));
    const back = el("a", "back", "← Back to all deals");
    back.href = "#/";
    frag.append(back);
    return frag;
  }
  frag.append(el("h2", "page-h", d.title));
  frag.append(el("p", "page-sub", `${d.category} · sold at ${d.store} · checked ${CHECKED_LABEL}`));
  const grid = el("div", "grid");
  grid.append(dealCard(d));
  frag.append(grid);

  const box = el("div", "note-box");
  box.append(el("p", null, ""));
  box.firstChild.textContent = "How to check it yourself: open the store link on the card and search for the product name. The price on the store page is the final word — Black Friday prices move fast, so if it has changed since our check, the store is right and this page is out of date.";
  frag.append(box);
  const back = el("a", "back", "← Back to all deals");
  back.href = "#/";
  frag.append(back);
  return frag;
}

// ---- compare ----
export function viewCompare() {
  const frag = document.createDocumentFragment();
  frag.append(el("h2", "page-h", "Cross-store compare"));
  frag.append(
    el(
      "p",
      "page-sub",
      "The same product at two or more stores, all checked 27 Nov 2026. The cheapest price is marked in green; the gap is what you save by picking the right store."
    )
  );

  // Biggest gaps strip — computed from the data, not typed by hand.
  const gaps = compare
    .map((row) => {
      const d = deals.find((x) => x.id === row.id);
      if (!d || !d.alsoAt) return null;
      const prices = [{ store: d.store, price: d.price }, ...d.alsoAt.map((a) => ({ store: a.store, price: a.price }))];
      const lo = Math.min(...prices.map((p) => p.price));
      const hi = Math.max(...prices.map((p) => p.price));
      return { title: d.title, gap: +(hi - lo).toFixed(2), lo, hi };
    })
    .filter(Boolean)
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 5);
  const strip = el("section", "gap-strip");
  strip.append(el("h3", null, "Biggest price gaps today"));
  const ul = el("ul");
  for (const g of gaps) {
    ul.append(el("li", null, `${g.title}: ${money(g.lo)} vs ${money(g.hi)} — a ${money(g.gap)} gap.`));
  }
  strip.append(ul);
  frag.append(strip);

  const wrap = el("div", "compare-wrap");
  const table = el("table", "compare-table");
  const thead = el("thead");
  const tr = el("tr");
  for (const h of ["Product", "Prices by store", "Cheapest", "Gap"]) {
    tr.append(el("th", null, h));
  }
  thead.append(tr);
  table.append(thead);
  const tbody = el("tbody");
  for (const row of compare) {
    const d = deals.find((x) => x.id === row.id);
    if (!d) continue;
    const prices = [{ store: d.store, price: d.price }, ...(d.alsoAt || []).map((a) => ({ store: a.store, price: a.price }))];
    const lo = Math.min(...prices.map((p) => p.price));
    const hi = Math.max(...prices.map((p) => p.price));
    const trow = el("tr");
    const name = el("td");
    const link = el("a", null, d.title);
    link.href = "#/deal/" + d.id;
    name.append(link);
    const note = el("p", "proof", row.note);
    name.append(note);
    trow.append(name);
    const cells = el("td");
    for (const p of prices) {
      const line = el("div");
      line.textContent = `${p.store}: ${money(p.price)}`;
      if (p.price === lo) line.className = "best";
      cells.append(line);
    }
    trow.append(cells);
    trow.append(el("td", "best", money(lo)));
    trow.append(el("td", "gap", money(hi - lo)));
    tbody.append(trow);
  }
  table.append(tbody);
  wrap.append(table);
  frag.append(wrap);
  const note = el("p", "result-count", `10 products compared · all prices checked ${CHECKED_LABEL}`);
  frag.append(note);
  return frag;
}

// ---- promos ----
export function viewPromos() {
  const frag = document.createDocumentFragment();
  frag.append(el("h2", "page-h", "Today-only promos"));
  frag.append(
    el(
      "p",
      "page-sub",
      "These are not price cuts — they are gift-card and giveaway offers that run today, 27 Nov 2026. They are listed separately and are not counted in the 60 deals."
    )
  );
  const grid = el("div", "promo-grid");
  for (const p of promos) {
    const card = el("article", "promo");
    card.append(el("h3", null, p.title));
    card.append(el("p", "value", p.value));
    card.append(el("p", "terms", p.terms));
    card.append(el("p", "proof", `Verified: ${p.source}. Checked ${CHECKED_LABEL}.`));
    grid.append(card);
  }
  frag.append(grid);
  return frag;
}

// ---- how ----
export function viewHow() {
  const frag = document.createDocumentFragment();
  frag.append(el("h2", "page-h", "How we check"));
  frag.append(el("p", "page-sub", "A short list is only useful if the prices are real. Here is exactly what we do — and what we refuse to do."));
  const list = el("ol", "how-list");
  const steps = [
    "We start from the stores' own Black Friday releases and from roundups that name the store and the date, published 23-27 Nov 2026.",
    "We re-check every price on the day we publish — 27 Nov 2026, 14:40 WIB — against a source that names the store. If a price has moved, we update it; if it has sold out or cannot be confirmed, we drop the deal and say so.",
    "The was-price is the store's own list price for that exact product. We never invent a was-price, and we never list a product whose was-price we could not verify.",
    "The verdict comes from comparing the sale price with the product's 2026 street price: all-time low means the lowest price we have seen this year; strong means a real cut below the usual street price; routine means an ordinary cut. Inflated was-prices are dropped, not listed.",
    "We check the same product at more than one store where it matters, and print the other stores' prices on the card.",
    "We link to store search pages, not to product pages we guessed. If a store has no working search link, we say so on the card rather than inventing a URL — Woot has no site search, so its two cards link to woot.com itself.",
    "No product photos: every thumbnail is a plain colour block with the category initials. No affiliate codes, no sponsored slots, no paid placement.",
    "Prices move during Black Friday. The check time printed on every card is the moment we saw that price; the store page is always the final word.",
  ];
  for (const s of steps) list.append(el("li", null, s));
  frag.append(list);
  const box = el("div", "note-box");
  box.append(
    el(
      "p",
      null,
      "Dropped during checking, 27 Nov: products whose was-price or price could not be verified at a named store — for example the Vizio Mini LED line, the Costco Hisense QD7 and TCL QM6K, a $649 MacBook Neo with conflicting prices, and Sam's Club listings that only appear behind a membership wall — plus older roundup prices we could not confirm on 27 Nov. They are not on this list."
    )
  );
  frag.append(box);
  return frag;
}

export { renderStats };
