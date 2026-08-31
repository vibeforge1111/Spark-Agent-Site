#!/usr/bin/env node
// Verify that the Strict-Transport-Security header in nginx.conf meets
// HSTS preload list requirements.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nginxConf = fs.readFileSync(path.join(root, "nginx.conf"), "utf8");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS  ${message}`);
    passed++;
  } else {
    console.error(`  FAIL  ${message}`);
    failed++;
  }
}

const hstsLine = nginxConf.split("\n").find((l) => l.includes("Strict-Transport-Security"));
assert(!!hstsLine, "HSTS header directive present in nginx.conf");

if (hstsLine) {
  const value = hstsLine.match(/"([^"]+)"/)?.[1] || "";
  const maxAgeMatch = value.match(/max-age=(\d+)/);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
  assert(maxAge >= 31536000, `max-age is at least 31536000 (got ${maxAge})`);
  assert(value.includes("includeSubDomains"), "HSTS header includes 'includeSubDomains'");
  assert(value.includes("preload"), "HSTS header includes 'preload'");
  assert(hstsLine.includes("always"), "HSTS directive uses 'always' flag");
}

console.log(`\nHSTS header test: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
