#!/usr/bin/env node
// Test that extractScriptBody correctly handles </script> inside string literals.

import crypto from "node:crypto";

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

// Inline the state machine from verify-csp-hashes.mjs so we can unit-test it.
function extractScriptBody(html, startIndex) {
  let state = "code";
  let i = startIndex;
  while (i < html.length) {
    if (state === "code") {
      if (html.slice(i, i + 9).toLowerCase() === "</script>") {
        return { body: html.slice(startIndex, i), endIndex: i + 9 };
      }
      const ch = html[i];
      if (ch === "'") { state = "sq"; }
      else if (ch === '"') { state = "dq"; }
      else if (ch === "`") { state = "tl"; }
      else if (html.slice(i, i + 2) === "//") { state = "line_comment"; i++; }
      else if (html.slice(i, i + 2) === "/*") { state = "block_comment"; i++; }
    } else if (state === "sq") {
      if (html[i] === "\\") { i++; }
      else if (html[i] === "'") { state = "code"; }
    } else if (state === "dq") {
      if (html[i] === "\\") { i++; }
      else if (html[i] === '"') { state = "code"; }
    } else if (state === "tl") {
      if (html[i] === "\\") { i++; }
      else if (html[i] === "`") { state = "code"; }
    } else if (state === "line_comment") {
      if (html[i] === "\n") { state = "code"; }
    } else if (state === "block_comment") {
      if (html.slice(i, i + 2) === "*/") { state = "code"; i++; }
    }
    i++;
  }
  return null;
}

// --- Test 1: Script with </script> inside a double-quoted string literal ---
{
  const body = `var tag = "</script>"; console.log(tag);`;
  const html = `<script>${body}</script>`;
  const openEnd = "<script>".length;
  const result = extractScriptBody(html, openEnd);
  assert(result !== null, "T1: extracts body when </script> is inside double-quoted string");
  assert(result?.body === body, `T1: full body extracted (got: ${JSON.stringify(result?.body?.slice(0,50))})`);
}

// --- Test 2: Script with </script> inside single-quoted string literal ---
{
  const body = `var tag = '</script>'; window.x = tag;`;
  const html = `<script>${body}</script>`;
  const result = extractScriptBody(html, "<script>".length);
  assert(result !== null, "T2: extracts body when </script> is inside single-quoted string");
  assert(result?.body === body, "T2: full body extracted correctly");
}

// --- Test 3: Script without inner </script> works as before ---
{
  const body = `console.log("hello world");`;
  const html = `<script>${body}</script>`;
  const result = extractScriptBody(html, "<script>".length);
  assert(result !== null, "T3: normal script without inner </script> works");
  assert(result?.body === body, "T3: normal body extracted unchanged");
}

// --- Test 4: SHA-256 hash of extracted body matches expected ---
{
  const body = `console.log("test");`;
  const expected = "sha256-" + crypto.createHash("sha256").update(body, "utf8").digest("base64");
  const html = `<script>${body}</script>`;
  const result = extractScriptBody(html, "<script>".length);
  const actual = "sha256-" + crypto.createHash("sha256").update(result.body, "utf8").digest("base64");
  assert(actual === expected, "T4: SHA-256 hash of extracted body matches expected");
}

// --- Test 5: Multiple scripts on same page all extracted correctly ---
{
  const body1 = `var a = 1;`;
  const body2 = `var b = "</script>";`;
  const body3 = `var c = 3;`;
  const html = `<script>${body1}</script><script>${body2}</script><script>${body3}</script>`;
  const OPEN_RE = /<script\b([^>]*)>/gi;
  const bodies = [];
  let m;
  OPEN_RE.lastIndex = 0;
  while ((m = OPEN_RE.exec(html)) !== null) {
    const ex = extractScriptBody(html, OPEN_RE.lastIndex);
    if (!ex) break;
    bodies.push(ex.body);
    OPEN_RE.lastIndex = ex.endIndex;
  }
  assert(bodies.length === 3, `T5: all 3 scripts extracted (got ${bodies.length})`);
  assert(bodies[0] === body1, "T5: script 1 body correct");
  assert(bodies[1] === body2, "T5: script 2 body (with inner </script>) correct");
  assert(bodies[2] === body3, "T5: script 3 body correct");
}

// --- Test 6: </script> inside template literal handled correctly ---
{
  const body = "var t = `</script>`; console.log(t);";
  const html = `<script>${body}</script>`;
  const result = extractScriptBody(html, "<script>".length);
  assert(result !== null, "T6: extracts body when </script> is inside template literal");
  assert(result?.body === body, "T6: template literal body extracted correctly");
}

console.log(`\nCSP hash extraction test: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
