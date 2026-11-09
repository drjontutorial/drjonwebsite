// Generates the page "shells" for every Solution Bank URL listed in routes.json
// (course index + one directory per exercise, so printed QR links resolve).
// Each shell is the same template.html: it holds NO solution links. bank.js
// signs the student in against Firebase and only then shows what is assigned.
// The catalog (titles + Drive IDs) lives in Firebase, never in this repo.
//
//   node notes-solutions/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const template = readFileSync(join(here, "template.html"), "utf8");
const routes = JSON.parse(readFileSync(join(here, "routes.json"), "utf8"));
const slug = /^[a-z0-9-]+$/;

let count = 0;
for (const [course, exercises] of Object.entries(routes)) {
  if (!slug.test(course)) throw new Error("Bad course slug: " + course);
  const pages = ["", ...exercises];
  for (const ex of pages) {
    if (ex && !slug.test(ex)) throw new Error("Bad exercise slug: " + course + "/" + ex);
    const dir = join(here, course, ex);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), template);
    count++;
  }
}
writeFileSync(join(here, "index.html"), template);
console.log("Wrote " + (count + 1) + " page shells.");
