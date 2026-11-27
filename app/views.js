// HTML for Deal Desk, built from the deal data in data.js. Every value that
// comes from the data is escaped before it goes into the page.

import { deals } from "./data.js";

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const usd = (n) =>
  Number.isInteger(n)
    ? `$${n.toLocaleString("en-US")}`
    : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
export const saveAmount = (d) => d.was - d.price;

const verdictClass = (v) => `verdict verdict-${v.replace(/\s+/g, "")}`;
const verdictText = (v) =>
  v === "NEW LOW" ? "NEW LOW" : v === "STRONG" ? "STRONG DEAL" : v === "GOOD" ? "GOOD DEAL" : v === "FAIR" ? "FAIR DEAL" : "ROUTINE SALE";

const when = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }) + " UTC";

export const categories = [...new Set(deals.map((d) => d.category))].sort();
export const stores = [...new Set(deals.map((d) => d.store))].sort();

export function card(d, top) {
  return `<li class="card${top ? " top" : ""}">
    <div class="meta">
      <span class="${verdictClass(d.verdict)}">${verdictText(d.verdict)}</span>
      <span class="tag">${escape(d.category)}</span>
      <span class="store">${escape(d.store)}</span>
    </div>
    <h3><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h3>
    <div class="price-row">
      <span class="price">${usd(d.price)}</span>
      <span class="was">${usd(d.was)}</span>
      <span class="off">${percentOff(d)}% off</span>
    </div>
    <div class="save">You save ${usd(saveAmount(d))}</div>
    <div class="checked">Checked ${when(d.checked)}</div>
    <div class="source">Source: ${escape(d.source)}</div>
    <a class="store-link" href="${escape(d.url)}" rel="noopener" target="_blank">View at ${escape(d.store)} &nearr;</a>
  </li>`;
}

export function sortDeals(list, sort) {
  const copy = [...list];
  if (sort === "discount") return copy.sort((a, b) => percentOff(b) - percentOff(a) || saveAmount(b) - saveAmount(a));
  if (sort === "saving") return copy.sort((a, b) => saveAmount(b) - saveAmount(a));
  if (sort === "price-asc") return copy.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return copy.sort((a, b) => b.price - a.price);
  if (sort === "verdict") {
    const rank = { "NEW LOW": 0, STRONG: 1, GOOD: 2, FAIR: 3, ROUTINE: 4 };
    return copy.sort((a, b) => rank[a.verdict] - rank[b.verdict] || percentOff(b) - percentOff(a));
  }
  return copy;
}

export function filterDeals(state) {
  const q = (state.q || "").trim().toLowerCase();
  return deals.filter((d) => {
    if (state.cat && d.category !== state.cat) return false;
    if (state.store && d.store !== state.store) return false;
    if (state.min && percentOff(d) < Number(state.min)) return false;
    if (state.verdict && d.verdict !== state.verdict) return false;
    if (q && `${d.title} ${d.store} ${d.category}`.toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
}

export function listPage(state) {
  const totalSave = deals.reduce((s, d) => s + saveAmount(d), 0);
  const newLows = deals.filter((d) => d.verdict === "NEW LOW").length;
  const filtered = sortDeals(filterDeals(state), state.sort || "verdict");
  const top = sortDeals(deals, "discount").slice(0, 6);
  const unfiltered = !state.q && !state.cat && !state.store && !state.min && !state.verdict;
  const option = (value, current, label) =>
    `<option value="${escape(value)}"${value === current ? " selected" : ""}>${escape(label)}</option>`;

  return `<h1>77 Black Friday deals, checked today</h1>
<p class="lede">Every deal below was found and price-checked on Friday 27 November 2026, at the store
or in a deals source that names the store. Each one shows the sale price, the usual price, the
discount, when it was checked, where the price was read — and an honest verdict on whether it is
really a deal.</p>
<ul class="stats">
  <li><b>${deals.length}</b>deals listed</li>
  <li><b>${newLows}</b>all-time lows</li>
  <li><b>${categories.length}</b>categories</li>
  <li><b>${stores.length}</b>stores</li>
  <li><b>${usd(totalSave)}</b>total savings</li>
</ul>
<section class="picks" ${unfiltered ? "" : 'hidden'}>
  <h2>Biggest discounts right now</h2>
  <ul class="grid picks-row">${top.map((d) => card(d, true)).join("")}</ul>
</section>
<p class="legend">Verdicts:
<span class="verdict verdict-NEWLOW">NEW LOW</span> all-time low ·
<span class="verdict verdict-STRONG">STRONG DEAL</span> 40%+ off ·
<span class="verdict verdict-GOOD">GOOD DEAL</span> 25–39% off ·
<span class="verdict verdict-FAIR">FAIR DEAL</span> 15–24% off ·
<span class="verdict verdict-ROUTINE">ROUTINE SALE</span> under 15% off</p>
<section class="list-head">
  <h2>All deals</h2>
  <form class="controls" id="controls">
    <label>Search <input type="search" name="q" value="${escape(state.q || "")}" placeholder="AirPods, TV, laptop…"></label>
    <label>Category <select name="cat">
      ${option("", state.cat || "", "All categories")}
      ${categories.map((c) => option(c, state.cat || "", c)).join("")}
    </select></label>
    <label>Store <select name="store">
      ${option("", state.store || "", "All stores")}
      ${stores.map((s) => option(s, state.store || "", s)).join("")}
    </select></label>
    <label>At least <select name="min">
      ${option("", state.min || "", "Any discount")}
      ${option("25", state.min || "", "25% off")}
      ${option("40", state.min || "", "40% off")}
      ${option("50", state.min || "", "50% off")}
    </select></label>
    <label>Sort by <select name="sort">
      ${option("verdict", state.sort || "verdict", "Best verdict first")}
      ${option("discount", state.sort || "verdict", "Biggest discount")}
      ${option("saving", state.sort || "verdict", "Biggest saving ($)")}
      ${option("price-asc", state.sort || "verdict", "Lowest price")}
      ${option("price-desc", state.sort || "verdict", "Highest price")}
    </select></label>
  </form>
  <p class="count-line" id="count-line">Showing ${filtered.length} of ${deals.length} deals${state.q ? ` matching “${escape(state.q)}”` : ""}.</p>
  <ul class="grid" id="deal-grid">${filtered.map((d) => card(d, false)).join("") || `<li class="empty">No deal matches. Try clearing a filter.</li>`}</ul>
</section>`;
}

export function detailPage(d) {
  const same = deals.filter((x) => x.id !== d.id && x.title === d.title);
  return `<article class="detail">
  <a class="back" href="#/">&larr; All deals</a>
  <div class="meta">
    <span class="${verdictClass(d.verdict)}">${verdictText(d.verdict)}</span>
    <span class="tag">${escape(d.category)}</span>
    <span class="store">${escape(d.store)}</span>
  </div>
  <h1>${escape(d.title)}</h1>
  <div class="price-row">
    <span class="price">${usd(d.price)}</span>
    <span class="was">${usd(d.was)}</span>
    <span class="off">${percentOff(d)}% off</span>
    <span class="save">You save ${usd(saveAmount(d))}</span>
  </div>
  <dl>
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Sale price</dt><dd>${usd(d.price)}</dd>
    <dt>Usual price</dt><dd>${usd(d.was)}</dd>
    <dt>Discount</dt><dd>${percentOff(d)}% off — you save ${usd(saveAmount(d))}</dd>
    <dt>Price checked</dt><dd>${when(d.checked)}</dd>
    <dt>Price read in</dt><dd>${escape(d.source)}</dd>
  </dl>
  <div class="evidence-box">
    <h2>Is it really a deal? ${verdictText(d.verdict)}</h2>
    <p>${escape(d.evidence)}</p>
  </div>
  ${d.also ? `<div class="compare"><h2>Same product elsewhere</h2><p>Also listed at ${escape(d.also)} — compare before you buy.</p></div>` : ""}
  ${same.length ? `<div class="compare"><h2>Same product at another store on this board</h2><p>${same.map((x) => `<a href="#/deal/${encodeURIComponent(x.id)}">${escape(x.store)} — ${usd(x.price)}</a>`).join(" · ")}</p></div>` : ""}
  <p><a class="store-link" href="${escape(d.url)}" rel="noopener" target="_blank">View it at ${escape(d.store)} &nearr;</a></p>
  <p class="checked">Prices move by the hour on Black Friday. This price was read ${when(d.checked)}; check it again at checkout.</p>
</article>`;
}

export function missingPage() {
  return `<h1>Deal not found</h1><p>There is no deal at this address. <a href="#/">See all ${deals.length} deals</a>.</p>`;
}
