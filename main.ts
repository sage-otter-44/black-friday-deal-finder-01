// Deal Desk — black-friday-deal-finder-01 entry (Node 22, standard library only).
//
// The site is this directory's app/ folder: plain static files a browser opens
// at app/index.html (ES modules, CSS, no build step), its 77 deals held in its
// own data.js. Nothing the site runs, styles or shows loads over the network;
// each deal links out to its store. This program hands it in: it copies app/
// and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the grading reads (the screenshots, the
// first load's files and bytes, and the source), with the vendored make.fun
// library. Leave vendor/makefun-frontend.ts as it is: the scorer requires
// dossier.json to be byte for byte what its own copy writes.
//
// Serve the site locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (!existsSync(join(here, "screenshots"))) {
  throw new Error("screenshots/ is missing: take the site's screenshots first (see shots.json)");
}
cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
const shotNames = readdirSync(join(out, "screenshots")).filter((f) => !f.startsWith("."));
if (shotNames.length < 3 || shotNames.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shotNames.length}`);
}
for (const name of shotNames) {
  if (statSync(join(out, "screenshots", name)).size > 262144) {
    throw new Error(`screenshot ${name} is over the 256 KiB cap`);
  }
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 16 MiB of app files: app/ counts beside /output's own 1000-entry
// cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);

const shots = readdirSync(join(out, "screenshots")).filter((f) => !f.startsWith("."));
const appBytes = readdirSync(join(out, "app")).reduce(
  (sum, f) => sum + statSync(join(out, "app", f)).size,
  0,
);
const dossierBytes = statSync(join(out, "dossier.json")).size;
console.log(`Deal Desk handed in: ${shots.length} screenshots (${shots.join(", ")}), app/ ${appBytes} bytes, dossier.json ${dossierBytes} bytes -> ${out}`);
