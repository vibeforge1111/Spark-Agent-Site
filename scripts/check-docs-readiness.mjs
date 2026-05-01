import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsRoot = path.join(root, "docs");
const cssVersion = "20260501-provider-roles";
const feedbackTemplate = "docs-feedback.yml";

function fail(message) {
  console.error(`docs readiness check failed: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const pages = [
  { path: "docs/index.html", name: "Overview", required: ["Guided installer", "Before installing, choose how Spark should reach an LLM"] },
  { path: "docs/installer-guide/index.html", name: "Installer guide", required: ["Install Spark in five calm steps", "BotFather", "Mission Control"] },
  { path: "docs/install-safety/index.html", name: "Install safety", required: ["dry-run", "checksums", "access level"] },
  { path: "docs/providers/index.html", name: "Providers", required: ["one provider", "Agent", "Mission", "Provider types", "Supported providers", "spark providers test --role chat", "spark providers test --role mission", "Codex", "Claude", "Ollama", "LM Studio", "surprise fallback"] },
  { path: "docs/commands/index.html", name: "Commands", required: ["Tell Spark what you are trying to do", "Computer terminal", "Telegram bot", "Mission Control"] },
  { path: "docs/lifecycle/index.html", name: "Start/Stop", required: ["spark live start", "spark live status", "autostart"] },
  { path: "docs/troubleshooting/index.html", name: "Troubleshooting", required: ["spark fix telegram", "spark fix spawner", "spark doctor llm"] },
  { path: "docs/security/index.html", name: "Security", required: ["spark security audit", "spark support bundle", "access"] },
  { path: "docs/suites/index.html", name: "Modules", required: ["telegram-starter", "Domain Chip Memory", "Spawner UI"] },
  { path: "docs/self-improvement/index.html", name: "Self-improvement", required: ["domain chip", "Spark Researcher", "score"] },
];

for (const page of pages) {
  const html = read(page.path);
  assert(html.includes("docs-nav-links"), `${page.name} is missing left docs navigation`);
  assert(html.includes("docs-feedback-banner"), `${page.name} is missing docs feedback banner`);
  assert(html.includes(feedbackTemplate), `${page.name} feedback banner does not point to the issue form`);
  assert(html.includes(`/docs/docs.css?v=${cssVersion}`), `${page.name} uses stale docs CSS cache key`);
  assert(!html.includes("docs.css?v=20260501-command-playbook-readable"), `${page.name} still uses old command-playbook CSS key`);
  for (const required of page.required) {
    assert(html.toLowerCase().includes(required.toLowerCase()), `${page.name} missing expected phrase: ${required}`);
  }

  const text = stripHtml(html);
  assert(!/\bretard\b/i.test(text), `${page.name} contains user-hostile wording`);
  assert(!/\bblack box\b/i.test(text), `${page.name} should avoid black-box framing`);
  assert(!/\bLocalhost note\b/i.test(text), `${page.name} should not show the old localhost note`);
}

const overview = read("docs/index.html");
const installJourney = [
  "/docs/installer-guide/",
  "/docs/install-safety/",
  "/docs/providers/",
  "/docs/commands/",
  "/docs/lifecycle/",
  "/docs/troubleshooting/",
];

for (const href of installJourney) {
  assert(overview.includes(href), `overview should link the install journey step: ${href}`);
}

const allHtmlFiles = pages.map((page) => page.path);
const internalLinks = new Set();
for (const relPath of allHtmlFiles) {
  const html = read(relPath);
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (href.startsWith("/") && !href.startsWith("//")) {
      internalLinks.add(href.split("#")[0]);
    }
  }
}

for (const href of internalLinks) {
  if (!href || href === "/") continue;
  const cleanHref = href.split("?")[0];
  const localPath = href.endsWith("/")
    ? path.join(root, cleanHref.slice(1), "index.html")
    : path.join(root, cleanHref.slice(1));
  assert(fs.existsSync(localPath), `internal docs link target missing: ${cleanHref}`);
}

for (const relPath of ["docs/commands.md", "docs/providers.md", "docs/install-safety.md", "docs/lifecycle.md", "docs/troubleshooting.md", "docs/security.md"]) {
  const markdown = read(relPath);
  assert(markdown.includes("Human page:"), `${relPath} should point agents back to the human page`);
}

console.log(`docs readiness ok: ${pages.length} pages, ${internalLinks.size} internal links`);
