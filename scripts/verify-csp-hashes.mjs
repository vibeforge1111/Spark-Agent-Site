#!/usr/bin/env node
// Verify that every executable inline <script> in the repo's HTML files has a
// matching CSP source hash in nginx.conf's Content-Security-Policy script-src.
//
// CSP source-hash rule: sha256 over the EXACT bytes between the opening
// <script ...> tag and the closing </script>, base64-encoded, prefixed with
// "sha256-". Equivalent to:
//   openssl dgst -sha256 -binary <body> | openssl base64
//
// Scope: only EXECUTABLE inline scripts are governed by script-src. Scripts
// with an external `src`, or with a non-JavaScript `type` (e.g.
// application/ld+json, application/json, importmap, text/template), are data /
// external resources and are NOT subject to script-src hashing, so they are
// skipped. script-src-attr 'none' in the policy already blocks inline event
// handler attributes, which is intentional and unrelated.
//
// Exits non-zero if any executable inline script's hash is missing from the CSP.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import childProcess from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nginxPath = path.join(root, "nginx.conf");
const nginx = fs.readFileSync(nginxPath, "utf8");

// Executable script `type` values. Anything else (data blocks) is skipped.
const EXECUTABLE_TYPES = new Set([
  "",
  "text/javascript",
  "application/javascript",
  "application/ecmascript",
  "text/ecmascript",
  "module",
]);

function listTrackedHtmlFiles() {
  return childProcess
    .execFileSync("git", ["ls-files", "-z", "--", "*.html"], { cwd: root })
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .sort();
}

function readTrackedFile(rel) {
  // Hash the committed blob so Windows CRLF checkouts do not produce false CSP
  // failures. Hosted deploys and CI use the repository bytes.
  return childProcess.execFileSync("git", ["show", `HEAD:${rel}`], { cwd: root }).toString("utf8");
}

function getAttr(attrs, name) {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  if (!m) return null;
  return (m[2] ?? m[3] ?? m[4] ?? "").trim();
}

const files = listTrackedHtmlFiles();
const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

const rows = [];
for (const file of files) {
  const html = readTrackedFile(file);
  let m;
  while ((m = scriptRe.exec(html)) !== null) {
    const attrs = m[1] || "";
    const body = m[2] ?? "";
    const rel = file;

    if (getAttr(attrs, "src") !== null) continue; // external script
    if (body.length === 0) continue; // empty placeholder

    const type = (getAttr(attrs, "type") || "").toLowerCase();
    const executable = EXECUTABLE_TYPES.has(type);

    const hash = "sha256-" + crypto.createHash("sha256").update(body, "utf8").digest("base64");
    const present = nginx.includes(hash);

    rows.push({ file: rel, type: type || "(none)", executable, hash, present, len: body.length });
  }
}

let missing = 0;
console.log("Inline <script> CSP hash audit (executable scripts must be in nginx.conf script-src)\n");
console.log("STATUS    EXECUTABLE  TYPE                  HASH                                                FILE");
for (const r of rows) {
  let status;
  if (!r.executable) status = "SKIP   ";
  else if (r.present) status = "OK     ";
  else { status = "MISSING"; missing++; }
  console.log(
    `${status}   ${r.executable ? "yes" : "no "}         ${r.type.padEnd(20)}  ${r.hash}  ${r.file}`
  );
}

console.log(`\nTotal inline scripts: ${rows.length}` +
  ` | executable: ${rows.filter(r => r.executable).length}` +
  ` | data/skipped: ${rows.filter(r => !r.executable).length}` +
  ` | missing from CSP: ${missing}`);

if (missing > 0) {
  console.error(`\nFAIL: ${missing} executable inline script hash(es) missing from nginx.conf CSP script-src.`);
  process.exit(1);
}
console.log("\nPASS: every executable inline script hash is present in nginx.conf CSP script-src.");
