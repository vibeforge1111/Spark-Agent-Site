// Tests for staleTokens CI enforcement assertions added to
// scripts/check-security-release-surface.mjs.
//
// These tests inline the relevant assertion logic so they run without needing
// the full release surface (install files, checksums, nginx.conf, etc.).

import assert from "node:assert/strict";
import { describe, it } from "node:test";

// Mirrors the assertion logic from check-security-release-surface.mjs.
function validateStaleTokens(sparkCliRef, sparkCliCommit, staleTokens) {
  const errors = [];
  function softAssert(condition, message) {
    if (!condition) errors.push(message);
  }
  softAssert(
    !staleTokens.includes(sparkCliRef),
    `staleTokens must not contain the current release ref — retire the previous ref before updating sparkCliRef (found: ${sparkCliRef})`,
  );
  softAssert(
    !staleTokens.includes(sparkCliCommit),
    `staleTokens must not contain the current release commit — retire the previous commit before updating sparkCliCommit`,
  );
  softAssert(staleTokens.length > 0, "staleTokens list must be non-empty");
  softAssert(
    staleTokens.some((t) => t.startsWith("spark-cli-")),
    "staleTokens must contain at least one retired spark-cli release ref",
  );
  return errors;
}

describe("staleTokens CI enforcement", () => {
  const currentRef = "spark-cli-public-installer-2026-05-30-r22";
  const currentCommit = "1898af489937f22f5cda25334f99857278bf9176";
  const previousRef = "spark-cli-public-installer-2026-05-29-r20";
  const previousCommit = "bb188d440707ff0a9f866f782760929a69872ed2";

  it("passes when current ref and commit are absent from staleTokens", () => {
    const errors = validateStaleTokens(currentRef, currentCommit, [
      previousRef,
      previousCommit,
    ]);
    assert.deepEqual(errors, []);
  });

  it("fails when current ref is in staleTokens", () => {
    const errors = validateStaleTokens(currentRef, currentCommit, [
      currentRef,
      previousCommit,
    ]);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /staleTokens must not contain the current release ref/);
  });

  it("fails when current commit is in staleTokens", () => {
    const errors = validateStaleTokens(currentRef, currentCommit, [
      previousRef,
      currentCommit,
    ]);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /staleTokens must not contain the current release commit/);
  });

  it("fails when staleTokens is empty", () => {
    const errors = validateStaleTokens(currentRef, currentCommit, []);
    assert.ok(errors.some((e) => e.includes("staleTokens list must be non-empty")));
    assert.ok(errors.some((e) => e.includes("must contain at least one retired spark-cli release ref")));
  });

  it("fails when staleTokens has no spark-cli- ref", () => {
    const errors = validateStaleTokens(currentRef, currentCommit, [
      previousCommit,
      "some-hash-without-a-ref",
    ]);
    assert.ok(errors.some((e) => e.includes("must contain at least one retired spark-cli release ref")));
  });

  it("fails when both current ref and commit are in staleTokens", () => {
    const errors = validateStaleTokens(currentRef, currentCommit, [
      currentRef,
      currentCommit,
    ]);
    assert.equal(errors.length, 2);
  });
});
