import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const siteRoot = process.cwd();
const cliRoot = process.env.SPARK_CLI_PATH
  ? path.resolve(process.env.SPARK_CLI_PATH)
  : path.resolve(siteRoot, "..", "spark-cli");

function fail(message) {
  console.error(`command CLI smoke failed: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(path.join(cliRoot, "src", "spark_cli", "cli.py"))) {
  fail(`Spark CLI source not found. Set SPARK_CLI_PATH or place spark-cli beside this repo. Looked at: ${cliRoot}`);
}

function runPython(args, options = {}) {
  const env = {
    ...process.env,
    PYTHONPATH: path.join(cliRoot, "src"),
    ...(options.env ?? {}),
  };
  const attempt = (pythonBin) => spawnSync(
    pythonBin,
    ["-m", "spark_cli.cli", ...args],
    { cwd: cliRoot, env, encoding: "utf8", timeout: options.timeout ?? 30000 },
  );
  let result = attempt(process.env.PYTHON ?? "python");
  if (result.error && result.error.code === "ENOENT" && !process.env.PYTHON) {
    result = attempt("python3");
  }
  return result;
}

function requireSuccess(args, label = args.join(" ")) {
  const result = runPython(args);
  if (result.status !== 0) {
    fail(`spark ${label} exited ${result.status}\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
  }
  return `${result.stdout}\n${result.stderr}`;
}

const html = fs.readFileSync(path.join(siteRoot, "docs", "commands", "index.html"), "utf8");
const markdown = fs.readFileSync(path.join(siteRoot, "docs", "commands.md"), "utf8");
const combined = `${html}\n${markdown}`;
const sparkExamples = [...new Set(
  [...combined.matchAll(/(?:<code>|`)(spark\s+[^<`\n]+)(?:<\/code>|`)/g)]
    .map((match) => match[1].replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&").trim())
    .filter((command) => !command.includes("<module-name>")),
)];

const topHelp = requireSuccess(["--help"], "--help");
const documentedTopLevel = [...new Set(sparkExamples.map((command) => command.replace(/^spark\s+/, "").split(/\s+/)[0]))];

for (const verb of documentedTopLevel) {
  if (!new RegExp(`\\b${verb}\\b`).test(topHelp)) {
    fail(`documented command "spark ${verb}" is not present in top-level help`);
  }
}

const helpTargets = [
  ["setup", "--help"],
  ["guide", "--help"],
  ["live", "start", "--help"],
  ["live", "run", "--help"],
  ["live", "status", "--help"],
  ["live", "logs", "--help"],
  ["autostart", "install", "--help"],
  ["recommend", "llms", "--help"],
  ["providers", "status", "--help"],
  ["providers", "test", "--help"],
  ["status", "--help"],
  ["verify", "--help"],
  ["fix", "telegram", "--help"],
  ["fix", "spawner", "--help"],
  ["telegram", "connect", "--help"],
  ["secrets", "list", "--help"],
  ["list", "--help"],
  ["update", "--help"],
  ["logs", "--help"],
  ["doctor", "--help"],
  ["doctor", "llm", "--help"],
  ["support", "bundle", "--help"],
  ["security", "audit", "--help"],
  ["approval", "classify", "--help"],
  ["search", "--help"],
  ["config", "list", "--help"],
  ["restart", "--help"],
  ["start", "--help"],
  ["stop", "--help"],
  ["install", "--help"],
  ["init", "--help"],
  ["uninstall", "--help"],
];

for (const args of helpTargets) {
  requireSuccess(args);
}

const sandboxHome = fs.mkdtempSync(path.join(os.tmpdir(), "spark-command-docs-"));
const safeRuns = [
  ["recommend", "llms"],
  ["providers", "list"],
  ["approval", "classify", "delete local logs"],
  ["search", "memory"],
  ["config", "list"],
  ["secrets", "list"],
  ["list"],
];

for (const args of safeRuns) {
  const result = runPython(args, { env: { SPARK_HOME: sandboxHome }, timeout: 30000 });
  if (result.status !== 0) {
    fail(`safe blank-sandbox command failed: spark ${args.join(" ")}\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
  }
}

const providerStatus = runPython(["providers", "status"], { env: { SPARK_HOME: sandboxHome }, timeout: 30000 });
if (providerStatus.status === 0) {
  fail("spark providers status should report a repair-needed state in a blank sandbox, not a clean success");
}
if (!`${providerStatus.stdout}\n${providerStatus.stderr}`.includes("No LLM provider is configured")) {
  fail("blank-sandbox providers status should explain that no LLM provider is configured");
}

console.log(`command docs CLI smoke ok: ${sparkExamples.length} examples, ${helpTargets.length} help checks, ${safeRuns.length} sandbox runs`);
