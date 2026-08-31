import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const sparkCliRef = "spark-cli-public-installer-2026-08-08-r30-v3";
const sparkCliCommit = "63a8bcd71034bdb35e9305e2ab001189240572b2";
const releaseName = "spark-cli-public-installer-2026-08-08-r30-v3";

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

function readJson(relPath) {
  try {
    return JSON.parse(read(relPath));
  } catch (err) {
    fail(`cannot parse ${relPath}: ${err.message}`);
    process.exit(1);
  }
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

const checksumsJson = readJson("install/checksums.json");
const commandsJson = readJson("install/commands.json");
const manifest = readJson("install/release-manifest.json");
const jsonHashes = Object.fromEntries(checksumsJson.files.map((entry) => [entry.path, entry.sha256]));

assert(JSON.stringify(jsonHashes) === JSON.stringify(expected), "checksums.json must match checksums.txt");
assert(JSON.stringify(commandsJson.checksums.sha256) === JSON.stringify(expected), "commands.json hashes must match checksums.txt");
assert(manifest.sparkCli.ref === sparkCliRef, "release manifest must use current Spark CLI release ref");
assert(manifest.sparkCli.commit === sparkCliCommit, "release manifest must use current Spark CLI commit");
assert(manifest.sparkCli.releaseName === releaseName, "release manifest must use current Spark CLI release name");
assert(commandsJson.source.ref === sparkCliRef, "commands.json source ref must match current Spark CLI release ref");
assert(commandsJson.source.commit === sparkCliCommit, "commands.json source commit must match current Spark CLI commit");
assert(commandsJson.source.releaseName === releaseName, "commands.json source release must match current Spark CLI release name");

const publicExtensions = new Set([".html", ".md", ".json", ".txt"]);
const publicFiles = walk(".").filter((relPath) => {
  if (relPath.startsWith(".github/") || relPath.startsWith("scripts/")) return false;
  if (relPath.startsWith("local-handoffs/")) return false;
  return publicExtensions.has(path.extname(relPath));
});

const staleTokens = [
  "spark-cli-public-installer-2026-07-27-r30-v2",
  "f25477616019c2dfa0877eec28e51f49d0189c4b",
  "f3dd20a607d6e2ef23b20297e9f74daeac6cd6246b27905cb82aff838b716e64",
  "8220ec53bae0a25f7cf67ffb50d3c1ca31ba96cfbcc02b754d313870959b18bc",
  "spark-cli-public-installer-2026-06-27-r30",
  "b2344a8c55c2f311e8904cbd95a90bba0c519b09",
  "520953341deebef55f2b211df90b36443f5f4da779921a11b8d0c11b2bbbd63f",
  "3c995e91cddca76c32c427df4c6f44b89fe7baf4916a6126e8bc6b678fe57d79",
  "spark-cli-public-installer-2026-06-03-r24-v2",
  "fc49c16a97ac5b69aaf27daea55918a40a28ad0c",
  "6f550c552e7d4666a60e1a0124c3354935a3dd78759be959aa49ae6f05fd3192",
  "d8a9a0635f6a7bddb83717165d994ad5ff142bb85f509b36f463962de31557b7",
  "spark-cli-public-installer-2026-06-03-r26",
  "spark-cli-public-installer-2026-06-03-r25",
  "f989fd06aebad0fa02c99a840b8b2d92f08daea6",
  "4e6372d7a100cf3275c6bc29923a9cae2f23fed53dbcc1d22ce1bab66676ddef",
  "32676b2d6b51c350b090566f4eabf90d471ec302a0e282a702bdc5641a27577f",
  "495687f5267e4ac41a451a2cf60d59f8f62cba68",
  "40c2c8c3dbed386c5b2131cf683fc27be29dbff2010294862751ac2093461f68",
  "8a625f4c1a172e9ac2cba6dc03164655575b025c674b6f03caf58f4bedcacb44",
  "spark-cli-public-installer-2026-06-02-r23",
  "e9bbd3137fc313644f37741bc76dbdaf1d118b9d",
  "421318e92dc9cb4a5a7f256350d3a9f7e5a00a5145c0f2dba384c8cf10f2b993",
  "799d730d7e2fac49746841ebd87fffa5168861992c343aeab3d86a44feb74342",
  "spark-cli-public-installer-2026-05-30-r22",
  "1898af489937f22f5cda25334f99857278bf9176",
  "42b864fe8068c4adc7b8e5883df7323fb7a1cb679fb200150cbfb6e4305de976",
  "024605eada65497619bf20ec993723394d95a60d499941f16c6497aa2dda2a1a",
  "spark-cli-public-installer-2026-05-29-r20",
  "bb188d440707ff0a9f866f782760929a69872ed2",
  "33659e85e6ac370acc5a4ae8b57eb1555140364df97bba310a6511a9c835d8f0",
  "5cd18867b1411f2674af6620e85e205f3a69c243360a7a43a69b9c7791fe7d18",
  "spark-cli-public-installer-2026-05-29-r19",
  "d36d8e73b5f345b58c1000f851e33b1b6ee61fe0",
  "e879a0efcfc0703d9ea872158256cd5796130917b4bf96b0ec966a417850d5d6",
  "25d10d099fe1474ed413a79234d2d8d074d431f69d85e68a01a45c0a6d2266e7",
  "spark-cli-public-installer-2026-05-29-r18",
  "4c1610c2b8ed1b0c87781129f223c08f30f16c36",
  "0b3cff3c51d21027deb3b3289850cc94ce0ea05bc24b67242b29b302d3091511",
  "02dc3d134069f76361649f40a2dc1a60e419ee29730ff3ed57bdf2487ef0d1d2",
  "8ebbc64bcf650f45b4be4141a7f6c97604f8f2eb",
  "7efef6795bd280e52c69920adaa3eaa6bb4abeb8fc682850c81ab362f5b50b48",
  "d499f5f5e36fca402d2daeeaf8764d77cf9129144c45edf4b8d01bedfb630a5e",
  "spark-cli-public-installer-2026-05-29-r17",
  "c4b9a909402ff1a14d810529b5625802a4d47f28",
  "e8056c6eb553e1268cb14c51d2a64d1296822669fde8f3a46c5a9ffd6f5d6c52",
  "75d590d596144f36d0d8b351dabdace4c304ed1f53af3131973520f53129f9a9",
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

assert(
  !staleTokens.includes(sparkCliRef),
  `staleTokens must not contain the current release ref: ${sparkCliRef}`,
);
assert(
  !staleTokens.includes(sparkCliCommit),
  "staleTokens must not contain the current release commit",
);
assert(staleTokens.length > 0, "staleTokens must preserve retired release history");
assert(
  staleTokens.some((token) => token.startsWith("spark-cli-public-installer-")),
  "staleTokens must retain at least one retired public installer ref",
);

const staleReleasePatterns = [
  {
    pattern: /\bspark-cli-public-installer-2026-06-03-r24(?!-v\d)\b/,
    label: "spark-cli-public-installer-2026-06-03-r24",
  },
];

for (const relPath of publicFiles) {
  const text = read(relPath);
  for (const { pattern, label } of staleReleasePatterns) {
    assert(!pattern.test(text), `${relPath} contains stale release token ${label}`);
  }
  for (const token of staleTokens) {
    assert(!text.includes(token), `${relPath} contains stale release token ${token}`);
  }
  assert(!text.includes("github.com/vibeforge1111/spark-skill-graphs"), `${relPath} routes users to retired spark-skill-graphs repo`);

  for (const line of text.split(/\n/)) {
    const installer = line.includes("install.ps1") ? "install.ps1" : line.includes("install.sh") ? "install.sh" : null;
    if (!installer) continue;
    for (const [, digest] of line.matchAll(/\b([a-f0-9]{64})\b/gi)) {
      assert(digest.toLowerCase() === expected[installer], `${relPath} has stale ${installer} hash: ${digest}`);
    }
  }
}

assert(
  !staleTokens.includes(sparkCliRef),
  `staleTokens must not contain the current release ref — retire the previous ref before updating sparkCliRef (found: ${sparkCliRef})`,
);
assert(
  !staleTokens.includes(sparkCliCommit),
  `staleTokens must not contain the current release commit — retire the previous commit before updating sparkCliCommit`,
);
assert(staleTokens.length > 0, "staleTokens list must be non-empty");
assert(
  staleTokens.some((t) => t.startsWith("spark-cli-")),
  "staleTokens must contain at least one retired spark-cli release ref",
);

for (const relPath of ["cookies.html", "privacy.html", "terms.html"]) {
  const html = read(relPath);
  assert(
    /<a\b[^>]*href="https:\/\/github\.com\/vibeforge1111\/Spark-Agent-Site"[^>]*>github<\/a>/.test(html),
    `${relPath} legal footer must route GitHub visitors to the active public site repo`,
  );
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
