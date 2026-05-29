import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const sparkCliRef = "c4b9a909402ff1a14d810529b5625802a4d47f28";
const releaseName = "spark-cli-public-installer-2026-05-29-r17";

function fail(message) {
  console.error(`security release surface check failed: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function sha256(relPath) {
  return crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relPath))).digest("hex");
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const relPath = path.join(dir, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      if ([".git", "node_modules", ".tmp-launch-qa", ".tmp-launch-qa-after-csp"].includes(entry.name)) continue;
      walk(relPath, files);
    } else {
      files.push(relPath);
    }
  }
  return files;
}

function decodeAttribute(value) {
  return value
    .replace(/&#10;/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

const checksumsText = read("install/checksums.txt");
const expected = Object.fromEntries(
  checksumsText
    .trim()
    .split(/\n/)
    .filter(Boolean)
    .map((line) => {
      const [digest, relPath] = line.trim().split(/\s+/);
      return [relPath, digest];
    }),
);

for (const relPath of ["install.sh", "install.ps1"]) {
  assert(expected[relPath] === sha256(relPath), `${relPath} checksum does not match install/checksums.txt`);
}

const checksumsJson = JSON.parse(read("install/checksums.json"));
const commandsJson = JSON.parse(read("install/commands.json"));
const manifest = JSON.parse(read("install/release-manifest.json"));
const jsonHashes = Object.fromEntries(checksumsJson.files.map((entry) => [entry.path, entry.sha256]));

assert(JSON.stringify(jsonHashes) === JSON.stringify(expected), "checksums.json must match checksums.txt");
assert(JSON.stringify(commandsJson.checksums.sha256) === JSON.stringify(expected), "commands.json hashes must match checksums.txt");
assert(manifest.sparkCli.commit === sparkCliRef, "release manifest must use current Spark CLI commit");
assert(manifest.sparkCli.releaseName === releaseName, "release manifest must use current Spark CLI release name");
assert(commandsJson.source.ref === sparkCliRef, "commands.json source ref must match current Spark CLI commit");
assert(commandsJson.source.releaseName === releaseName, "commands.json source release must match current Spark CLI release name");

const publicExtensions = new Set([".html", ".md", ".json", ".txt"]);
const publicFiles = walk(".").filter((relPath) => {
  if (relPath.startsWith(".github/") || relPath.startsWith("scripts/")) return false;
  if (relPath.startsWith("local-handoffs/")) return false;
  return publicExtensions.has(path.extname(relPath));
});

const staleTokens = [
  "8ebbc64bcf650f45b4be4141a7f6c97604f8f2eb",
  "7efef6795bd280e52c69920adaa3eaa6bb4abeb8fc682850c81ab362f5b50b48",
  "d499f5f5e36fca402d2daeeaf8764d77cf9129144c45edf4b8d01bedfb630a5e",
  "f2ae90330b07db135cafb913e37c20c4bd960831",
  "spark-cli-public-installer-2026-05-29-r16",
  "b1c156a62fa76146d57caa3881a807f1612a22d77798d256f71773527f1ba04a",
  "67ead15caa6cebbedaeed68cacc73d85db53c2b1b948b9b89b430973dbc5be0d",
  "7ab32b23003726dcea8a414c8e9395bf13f45e12",
  "spark-cli-public-installer-2026-05-24-r15",
  "2a8b8765bc7b7d3233984a2b710091cc092b1756",
  "spark-cli-launch-2026-05-14-integrated-main-r1",
  "470de83e4ce00461c685f7f4fc6117f690321cf1efeb19412e5fd24a4c67b0f0",
  "6c19aeba936c8c70940dd3748349befb08e1eb332d8e1945842198f61d64d788",
  "8b7ec67ad5e35ef94a851105c629fcfc110f66a8",
  "9fe6a5e58b7ab2aff55f1a960dc60f8380d9a590319673d06770d6cb4dddafa1",
  "e2233e2720b0e5cf95820fd9ec0089ef83c48ebe335d3cd9c999cb211d915e0e",
  "fd040b0125862d1d070a1a9f926c007111a77e90",
  "042e25f06347504dd691e1c3007f5bc06f482b3bc67266b7732a77b469b43ebd",
  "83dd3cf769f318a08a22fcc0ba5fb38f112387b008e1fb6203ed084a82d28241",
  "b5e5dba559d6945a2e211f79ee862ffe1d3c230d",
  "39c5eed14e0323d5b017a2c78c80feaa88684c0f802803bdab0bf10bbcdfbdf6",
  "c95fe01dafbe25b1295fe87cd65dcaeed6f847087485641e3b5f97ca5c0932df",
  "3976f59cfcd0aa92b0566cf4e3311543e1437688",
  "899dca9f96d0db914649533dc3c9a1123fd56175",
  "5fa9db0c41cb4ad3315e97c0e06c8b9ed7901e7b5bb0c37a4ffb735846d36a37",
  "547b11de13fc060f010ab07555eba41cb0e652732472a4b6430cfb91704f4d50",
  "spark-cli-launch-2026-05-12",
  "85574e0abafd984d5c057447fc433cfc31557725",
  "e17754f52ff22098c23cce348326fdb01a94b792",
  "3722a070aaa4fb44f12aff132984fe11c153d9387fd0fa970209ea39a2e0aa1b",
  "1d3918316a6c8e118d4ef23d87ae0d19dd609aece0abb33d4dd53428fdcd2d8e",
  "spark-cli-launch-2026-05-05",
  "spark-cli-launch-2026-05-05-1",
  "spark-cli-launch-2026-05-11",
  "82c31c866d9c4d1d3a1da92cc1c1fa622512679f",
  "c0e642c68f015cb996a0242369ee396c9326b134",
  "fae73498312eece9bf658720908442da55735186664df019eced26a4f594c4e7",
  "5053220d890afa276bba9e741570b1edec8f4c4c77842fde6e5b46795c514e33",
  "c45a69cc6aabdc30b93e3bc68048137d9c0e5b1f85fb9e3953a050b548bddfdc",
  "efd8f772c16d90ad17e230be3fc4778c54d81792833edf7bdf4964db85265512",
  "c8b62590f9f469646246f45cb13f5636a738190c",
  "04202414425a41435807a5feb7c9e52c18e4554919aaf6dc7a1b0b892519d485",
  "cf6115d8702e50ae90ab275601ac7140ffd43251ca1a1b0e12cb84ab1077d07f",
  "65b40a6ec1154adff71d1290e6c6e5dfdc66c327",
  "spark-cli-public-installer-2026-05-15-r9",
  "998e2b133fe26826a3c30eaba23d94a6d732df09eab8da137af2cb6ee2ed1c25",
  "db41e347d1e73e1fa147088445bbe4d400ea364008265d6be4af1d529ffeaaeb",
];

for (const relPath of publicFiles) {
  const text = read(relPath);
  for (const token of staleTokens) {
    assert(!text.includes(token), `${relPath} contains stale release token ${token}`);
  }

  for (const line of text.split(/\n/)) {
    const installer = line.includes("install.ps1") ? "install.ps1" : line.includes("install.sh") ? "install.sh" : null;
    if (!installer) continue;
    for (const [, digest] of line.matchAll(/\b([a-f0-9]{64})\b/gi)) {
      assert(digest.toLowerCase() === expected[installer], `${relPath} has stale ${installer} hash: ${digest}`);
    }
  }
}

const copyBlocks = [];
for (const relPath of publicFiles.filter((file) => file.endsWith(".html"))) {
  const html = read(relPath);
  for (const match of html.matchAll(/data-copy-value=(?:"([^"]*)"|'([^']*)')/g)) {
    copyBlocks.push({ relPath, value: decodeAttribute(match[1] ?? match[2] ?? "") });
  }
}
for (const option of commandsJson.installOptions) {
  copyBlocks.push({ relPath: "install/commands.json", value: option.singleCopyBlock });
  assert(
    option.commands.some((command) => command.includes("--dry-run") || command.includes("-DryRun")),
    `install/commands.json ${option.id} commands must include a dry-run step`,
  );
}

for (const { relPath, value } of copyBlocks) {
  assert(!/\|\s*(?:ba)?sh\b/i.test(value), `${relPath} copy block pipes remote code into a shell`);
  assert(!/\b(?:iex|Invoke-Expression)\b/i.test(value), `${relPath} copy block uses Invoke-Expression`);
  assert(!/[\u202a-\u202e\u2066-\u2069]/u.test(value), `${relPath} copy block contains bidi control characters`);
  if (/install\.(?:sh|ps1)/.test(value) && /agent\.sparkswarm\.ai/.test(value)) {
    assert(value.includes("--dry-run") || value.includes("-DryRun"), `${relPath} installer copy block must include dry-run`);
    assert(!value.includes("&&"), `${relPath} installer copy block must avoid shell chaining`);
    assert(!/;\s*powershell\b/i.test(value), `${relPath} installer copy block must avoid semicolon chaining`);
  }
}

const allowedDomains = new Set([
  "agent.sparkswarm.ai",
  "github.com",
  "nodejs.org",
  "static.cloudflareinsights.com",
  "cloudflareinsights.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cli.github.com",
  "token.actions.githubusercontent.com",
]);

for (const { relPath, value } of copyBlocks) {
  for (const [, domain] of value.matchAll(/https?:\/\/([^/\s'")]+)/g)) {
    assert(allowedDomains.has(domain), `${relPath} copy block contains unexpected domain: ${domain}`);
  }
}

const agentDocs = [
  "llms.txt",
  "llms-full.txt",
  "docs/llms.txt",
  "docs/llms-full.txt",
  "docs/AGENTS.md",
  "docs/install-safety.md",
  "docs/security.md",
  "install/commands.json",
];

const injectionPatterns = [
  /ignore (?:all )?(?:previous|prior|system|developer) instructions/i,
  /reveal (?:the )?(?:system|developer) prompt/i,
  /paste .*api key .*website/i,
  /upload .*\.spark/i,
  /cat ~\/\.ssh/i,
  /curl [^\n|]+\|\s*(?:ba)?sh/i,
  /iwr [^\n|]+\|\s*iex/i,
];

const confusingInstallerCopyPatterns = [
  /TELEGRAM_RELAY_SECRET/,
  /\btelegram relay secret\b/i,
  /\brelay secrets?\b/i,
  /Finish in Telegram/i,
  /Finish onboarding in Telegram/i,
  /Spawner execution plane/i,
  /Review the installer plan with me/i,
  /Telegram \+ LLM setup/i,
  /First, create a Telegram bot/i,
  /first, enter the required Telegram setup values/i,
  /Open Telegram and send:/i,
  /Open Telegram and send \/start/i,
];

for (const relPath of agentDocs) {
  const text = read(relPath);
  for (const pattern of injectionPatterns) {
    assert(!pattern.test(text), `${relPath} contains suspicious agent-doc phrase: ${pattern}`);
  }
}

for (const relPath of publicFiles) {
  const text = read(relPath);
  for (const pattern of confusingInstallerCopyPatterns) {
    assert(!pattern.test(text), `${relPath} contains confusing installer copy: ${pattern}`);
  }
}

const nginx = read("nginx.conf");
assert(/location = \/commands\.json\s*\{[\s\S]*?try_files \/install\/commands\.json =404;[\s\S]*?\}/.test(nginx), "nginx must alias /commands.json to /install/commands.json");
const rootLocation = nginx.match(/location \/ \{[\s\S]*?\n  \}/)?.[0] ?? "";
assert(rootLocation.includes("try_files $uri $uri/ =404;"), "nginx root location must return 404 for unknown paths");
assert(!rootLocation.includes("/index.html"), "nginx root location must not fallback unknown paths to the homepage");

const codeowners = read(".github/CODEOWNERS");
for (const sensitivePath of ["install.sh", "install.ps1", "install/**", "llms.txt", "llms-full.txt", "docs/AGENTS.md", ".github/workflows/**", "nginx.conf"]) {
  assert(codeowners.includes(sensitivePath), `CODEOWNERS must cover ${sensitivePath}`);
}

if (!process.exitCode) {
  console.log(`security release surface ok: ${publicFiles.length} published files, ${copyBlocks.length} copy blocks`);
}
