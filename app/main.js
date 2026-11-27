// Deal Desk routing: a list at #/ and one page per deal at #/deal/<id>.
// Filter state lives in the hash query (#/?cat=Audio&min=40&sort=discount),
// so any filtered view is a plain link and a screenshot can open it direct.
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { deals } from "./data.js";
import { card, detailPage, filterDeals, listPage, missingPage, sortDeals } from "./views.js";

const app = document.getElementById("app");

function parseHash() {
  const raw = location.hash.replace(/^#/, "");
  const [path, query] = raw.split("?");
  const params = new URLSearchParams(query || "");
  const state = {
    q: params.get("q") || "",
    cat: params.get("cat") || "",
    store: params.get("store") || "",
    min: params.get("min") || "",
    sort: params.get("sort") || "verdict",
    verdict: params.get("verdict") || "",
  };
  const match = path.match(/^\/deal\/([^/]+)/);
  return { dealId: match ? decodeURIComponent(match[1]) : null, state };
}

function buildHash(state, dealId) {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.cat) params.set("cat", state.cat);
  if (state.store) params.set("store", state.store);
  if (state.min) params.set("min", state.min);
  if (state.sort && state.sort !== "verdict") params.set("sort", state.sort);
  if (state.verdict) params.set("verdict", state.verdict);
  const base = dealId ? `/deal/${encodeURIComponent(dealId)}` : "/";
  const qs = params.toString();
  return `#${base}${qs ? "?" + qs : ""}`;
}

function refreshGrid(state) {
  const grid = document.getElementById("deal-grid");
  const count = document.getElementById("count-line");
  if (!grid || !count) return;
  const filtered = sortDeals(filterDeals(state), state.sort || "verdict");
  grid.innerHTML =
    filtered.map((d) => card(d, false)).join("") ||
    `<li class="empty">No deal matches. Try clearing a filter.</li>`;
  count.textContent = `Showing ${filtered.length} of ${deals.length} deals${state.q ? ` matching “${state.q}”` : ""}.`;
}

function wireControls(state) {
  const form = document.getElementById("controls");
  if (!form) return;
  form.addEventListener("submit", (e) => e.preventDefault());
  const search = form.querySelector('input[name="q"]');
  if (search) {
    search.addEventListener("input", () => {
      state.q = search.value;
      history.replaceState(null, "", buildHash(state));
      refreshGrid(state);
    });
  }
  for (const name of ["cat", "store", "min", "sort"]) {
    const field = form.querySelector(`[name="${name}"]`);
    if (field) {
      field.addEventListener("change", () => {
        state[name] = field.value;
        location.hash = buildHash(state);
      });
    }
  }
}

function render() {
  window.__shotReady = false;
  const { dealId, state } = parseHash();
  if (dealId) {
    const found = deals.find((d) => d.id === dealId);
    document.title = `${found ? found.title : "Not found"} | Deal Desk`;
    app.innerHTML = found ? detailPage(found) : missingPage();
  } else {
    document.title = "Deal Desk — 77 Black Friday deals checked today";
    app.innerHTML = listPage(state);
    wireControls(state);
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();
