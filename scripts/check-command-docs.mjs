import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const htmlPath = path.join(root, "docs", "commands", "index.html");
const mdPath = path.join(root, "docs", "commands.md");
const catalogPath = path.join(root, "docs", "command-catalog.json");

const html = fs.readFileSync(htmlPath, "utf8");
const markdown = fs.readFileSync(mdPath, "utf8");
let catalog;
try {
  catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
} catch (err) {
  fail(`cannot parse command-catalog.json: ${err.message}`);
  process.exit(1);
}

function fail(message) {
  console.error(`command docs check failed: ${message}`);
  console.error(
    "  Hint: this gate compares docs/commands/index.html, docs/commands.md, and docs/command-catalog.json. Update whichever surface is stale.",
  );
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function decodeHtml(value) {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"');
}

function allMatches(source, regex) {
  return [...source.matchAll(regex)].map((match) => match[1]);
}

const targets = new Set(allMatches(html, /data-command-target="([^"]+)"/g));
const panels = new Set(allMatches(html, /data-command-panel="([^"]+)"/g));
const mismatchedPanels = [...new Set([...targets, ...panels])]
  .filter((name) => !targets.has(name) || !panels.has(name));

assert(targets.size >= 12, `expected at least 12 command coach moments, found ${targets.size}`);
assert(mismatchedPanels.length === 0, `coach buttons without matching panels: ${mismatchedPanels.join(", ")}`);

const requiredCoachTargets = [
  "start",
  "quiet",
  "mission-control",
  "model",
  "test-model",
  "build",
  "board",
  "memory",
  "access",
  "update",
  "logs",
  "doctor",
];

for (const target of requiredCoachTargets) {
  assert(targets.has(target), `missing coach target: ${target}`);
}

for (const panel of allMatches(html, /<article class="command-coach-panel" data-command-panel="([^"]+)"[\s\S]*?<\/article>/g)) {
  const panelRegex = new RegExp(`<article class="command-coach-panel" data-command-panel="${panel}"[\\s\\S]*?<\\/article>`);
  const panelHtml = html.match(panelRegex)?.[0] ?? "";
  assert(panelHtml.includes("<span class=\"surface-pill\">"), `coach panel ${panel} is missing a surface label`);
  assert(/<h3>[^<]+<\/h3>/.test(panelHtml), `coach panel ${panel} is missing a plain-language title`);
  assert(/<code>[^<]+<\/code>/.test(panelHtml), `coach panel ${panel} is missing the command`);
  for (const label of ["Use it for", "You should see", "Try next"]) {
    assert(panelHtml.includes(`<dt>${label}</dt>`), `coach panel ${panel} is missing "${label}"`);
  }
}

const coachText = html
  .match(/<section class="doc-section command-coach-section">[\s\S]*?<\/section>/)?.[0]
  ?.replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim() ?? "";

for (const jargon of ["ingress", "canonical", "MCP", "bootstrap", "runtime root", "PID file"]) {
  assert(!new RegExp(`\\b${jargon}\\b`, "i").test(coachText), `command coach includes jargon: ${jargon}`);
}

const coachDescriptions = allMatches(
  html.match(/<section class="doc-section command-coach-section">[\s\S]*?<\/section>/)?.[0] ?? "",
  /<dd>([\s\S]*?)<\/dd>/g,
).map((item) => item.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

for (const description of coachDescriptions) {
  assert(description.length <= 230, `coach description is too long (${description.length} chars): ${description}`);
}

const combined = `${html}\n${markdown}`;
assert(!combined.includes("Localhost note"), "hero-level Localhost note should stay out of the commands page");
assert(!combined.includes("127.0.0.1:5173"), "commands docs should not hardcode the old Spawner port");
assert(!/http:\/\/127\.0\.0\.1:\d+\/(?:kanban|canvas)/.test(combined), "commands docs should use the Mission Control URL pattern instead of a fixed localhost URL");

for (const snippet of [
  "Mission Control URL + /kanban",
  "spark live status",
  "spark fix spawner",
  "spark providers test --role chat",
  "spark doctor llm",
  "/access 3",
  "/board",
]) {
  assert(combined.includes(snippet), `missing expected command guidance: ${snippet}`);
}

assert(markdown.includes("Do not assume the port is always the same."), "agent markdown must explain dynamic Mission Control ports");
assert(markdown.includes("If it starts with `spark`, type it in a terminal."), "agent markdown must explain terminal surface");
assert(markdown.includes("If it starts with `/`, type it in Telegram."), "agent markdown must explain Telegram surface");

const sparkCodeExamples = [...new Set(allMatches(html, /<code>(spark [^<]+)<\/code>/g).map(decodeHtml))];
assert(sparkCodeExamples.length >= 25, `expected a broad CLI command set, found ${sparkCodeExamples.length}`);

for (const entry of catalog.commands) {
  assert(["terminal", "telegram", "browser"].includes(entry.surface), `catalog command has unknown surface: ${entry.command}`);
  assert(entry.use.length <= 130, `catalog description is too long for ${entry.command}`);
  assert(combined.includes(entry.command), `catalog command missing from docs: ${entry.command}`);
}

console.log(`command docs content ok: ${targets.size} coach moments, ${sparkCodeExamples.length} Spark CLI examples`);
