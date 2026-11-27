// Filters: pure functions over the deals list. No DOM here — views.js
// calls these and renders the result.

export const VERDICT_LABELS = {
  low: "All-time low",
  strong: "Strong",
  routine: "Routine",
};

export function savings(deal) {
  return +(deal.was - deal.price).toFixed(2);
}

export function percentOff(deal) {
  return Math.round((1 - deal.price / deal.was) * 100);
}

export function filterDeals(deals, f) {
  return deals.filter((d) => {
    if (f.query) {
      const q = f.query.toLowerCase();
      const hay = `${d.title} ${d.store} ${d.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.category && f.category !== "All") {
      if (d.category !== f.category) return false;
    }
    if (f.store && f.store !== "All") {
      if (d.store !== f.store) return false;
    }
    if (f.minPct > 0 && percentOff(d) < f.minPct) return false;
    if (f.lowsOnly && d.verdict !== "low") return false;
    if (f.verdict && f.verdict !== "All" && d.verdict !== f.verdict) return false;
    return true;
  });
}

export function sortDeals(deals, mode) {
  const out = [...deals];
  const rank = { low: 0, strong: 1, routine: 2 };
  switch (mode) {
    case "biggest-pct":
      return out.sort((a, b) => percentOff(b) - percentOff(a));
    case "biggest-save":
      return out.sort((a, b) => savings(b) - savings(a));
    case "price-low":
      return out.sort((a, b) => a.price - b.price);
    case "price-high":
      return out.sort((a, b) => b.price - a.price);
    case "best-verdict":
    default:
      return out.sort(
        (a, b) =>
          rank[a.verdict] - rank[b.verdict] || percentOff(b) - percentOff(a)
      );
  }
}

export function countsBy(deals, key) {
  const m = new Map();
  for (const d of deals) m.set(d[key], (m.get(d[key]) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export function storeList(deals) {
  const set = new Set(deals.map((d) => d.store));
  for (const d of deals) {
    for (const a of d.alsoAt || []) set.add(a.store);
  }
  return [...set].sort();
}

export function summaryStats(deals) {
  const totalSave = deals.reduce((s, d) => s + savings(d), 0);
  const avgPct = Math.round(
    deals.reduce((s, d) => s + percentOff(d), 0) / deals.length
  );
  return {
    count: deals.length,
    lows: deals.filter((d) => d.verdict === "low").length,
    stores: storeList(deals).length,
    totalSave: Math.round(totalSave),
    avgPct,
  };
}
